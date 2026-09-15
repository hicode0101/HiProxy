/**
 * 代理引擎：把 ExtensionConfig 翻译成 chrome.proxy.settings 调用
 * 这是唯一允许调用 proxy.settings 的模块，保证代理状态的单一来源。
 *
 * 工作方式（事件驱动）：
 *   UI / popup 只写配置 → storage 变化 → background 监听 → 调用 applyConfig()
 *   background 启动 / 安装 / 浏览器启动时也会主动 apply 一次
 */
import { browser } from '#imports';
import { t } from '@/utils/i18n';
import { buildAutoPacScript, isAsciiOnly, looksLikeValidPac } from '@/utils/proxy/pac';
import { updateBadge } from '@/utils/proxy/badge';
import { updateAuthCache } from '@/utils/proxy/auth';
import { appendLog } from '@/utils/proxy/debug';
import type { ExtensionConfig, ProxyProfile } from '@/types';

/** 解析后的实际生效目标 */
export interface ResolvedTarget {
  mode: 'direct' | 'system' | 'fixed' | 'pac';
  profile?: ProxyProfile;       // fixed 模式下有效
  pacScript?: string;           // pac 模式下有效（含自动切换生成的脚本）
  badgeColor: string;           // 图标颜色
  badgeText: string;            // 徽标文字
  labelKey: string;             // 状态文案 key（图标 tooltip / UI 显示）
}

/**
 * 把配置解析为实际生效目标，所有"引用失效回退"逻辑集中在这里：
 * - fixed 模式但 activeProfileId 失效 → 回退直连
 * - pac 模式脚本缺失/非法 → 回退直连
 */
export function resolveTarget(cfg: ExtensionConfig): ResolvedTarget {
  switch (cfg.activeMode) {
    case 'system':
      return { mode: 'system', badgeColor: '#1a1a1a', badgeText: 'SYS', labelKey: 'mode_system' };

    case 'fixed': {
      const profile = cfg.profiles.find((p) => p.id === cfg.activeProfileId);
      if (!profile) {
        return { mode: 'direct', badgeColor: '#9b9b9b', badgeText: '', labelKey: 'mode_direct' };
      }
      return {
        mode: 'fixed',
        profile,
        badgeColor: profile.color,
        badgeText: profile.name.slice(0, 4),
        labelKey: 'mode_fixed',
      };
    }

    case 'auto': {
      const script = buildAutoPacScript(cfg);
      return {
        mode: 'pac',
        pacScript: script,
        badgeColor: '#0067c0',
        badgeText: 'AUTO',
        labelKey: 'mode_auto',
      };
    }

    case 'pac': {
      if (!looksLikeValidPac(cfg.pacScript) || !isAsciiOnly(cfg.pacScript)) {
        // 脚本没有入口函数或含非 ASCII 字符时不能贸然接管代理，回退直连
        return { mode: 'direct', badgeColor: '#9b9b9b', badgeText: '', labelKey: 'mode_direct' };
      }
      return {
        mode: 'pac',
        pacScript: cfg.pacScript,
        badgeColor: '#744da9',
        badgeText: 'PAC',
        labelKey: 'mode_pac',
      };
    }

    case 'direct':
    default:
      return { mode: 'direct', badgeColor: '#9b9b9b', badgeText: '', labelKey: 'mode_direct' };
  }
}

/**
 * 应用配置到浏览器：代理设置 + 图标徽标 + 认证缓存，一次到位
 */
export async function applyConfig(cfg: ExtensionConfig): Promise<ResolvedTarget> {
  const target = resolveTarget(cfg);
  void appendLog(`applyConfig: resolved=${target.mode} profile=${target.profile?.name ?? '-'}`);

  try {
    if (target.mode === 'direct') {
      await browser.proxy.settings.set({ value: { mode: 'direct' }, scope: 'regular' });
    } else if (target.mode === 'system') {
      await browser.proxy.settings.set({ value: { mode: 'system' }, scope: 'regular' });
    } else if (target.mode === 'fixed' && target.profile) {
      const p = target.profile;
      await browser.proxy.settings.set({
        value: {
          mode: 'fixed_servers',
          rules: {
            singleProxy: { scheme: p.scheme, host: p.host, port: p.port },
            bypassList: p.bypassList,
          },
        },
        scope: 'regular',
      });
      void appendLog(`set fixed_servers ${p.scheme} ${p.host}:${p.port} ok`);
    } else if (target.mode === 'pac' && target.pacScript) {
      await browser.proxy.settings.set({
        value: {
          mode: 'pac_script',
          pacScript: { data: target.pacScript, mandatory: true },
        },
        scope: 'regular',
      });
    }
  } catch (err) {
    // 代理设置失败（如 PAC 语法被 Chrome 拒绝）时回退直连，避免断网
    console.error('[HiProxy] apply proxy failed, fallback to direct:', err);
    await browser.proxy.settings.set({ value: { mode: 'direct' }, scope: 'regular' });
    target.mode = 'direct';
    target.badgeColor = '#9b9b9b';
    target.badgeText = '';
    target.labelKey = 'mode_direct';
  }

  await updateBadge(cfg, target);
  updateAuthCache(target);
  return target;
}

/** 当前状态的人类可读描述（popup / options 顶部状态条共用） */
export function describeTarget(target: ResolvedTarget): string {
  if (target.mode === 'fixed' && target.profile) {
    const modeName = t('mode_fixed');
    return `${modeName} · ${target.profile.name}`;
  }
  return t(target.labelKey);
}
