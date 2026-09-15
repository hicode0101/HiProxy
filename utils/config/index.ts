/**
 * 配置门面：加载 / 保存 / 修复 / 订阅
 * 上层（UI、background）只与这里交互，不直接碰 storage。
 *
 * 设计要点：
 * - 写入即广播：任何上下文保存配置后，其他上下文通过 storage.watch 收到通知
 * - 读取即修复：sanitizeConfig 保证配置永远处于自洽状态（引用不悬空、字段齐全）
 */
import { uid } from '@/utils/id';
import { PAC_TEMPLATE, defaultConfig } from '@/utils/config/defaults';
import { migrateLegacyProfile } from '@/utils/config/migrate';
import { readLegacyKeys, readRawConfig, watchRawConfig, writeRawConfig } from '@/utils/storage';
import type { ExtensionConfig, ProxyProfile, ProxyScheme, UiLocaleSetting } from '@/types';

const SCHEMES: ProxyScheme[] = ['http', 'https', 'socks4', 'socks5'];

/** 合法的界面语言取值（sanitize 用） */
const UI_LOCALES: UiLocaleSetting[] = ['auto', 'en', 'zh_CN'];

/**
 * 修复配置的完整性，任何来源（导入/迁移/手工改存储）的数据都会先过这里
 */
export function sanitizeConfig(input: Partial<ExtensionConfig> | null): ExtensionConfig {
  const base = defaultConfig();
  if (!input || typeof input !== 'object') return base;

  const cfg: ExtensionConfig = {
    ...base,
    ...input,
    schemaVersion: 2,
  };

  // ---- profiles：字段补全 + id 兜底 ----
  const profiles: ProxyProfile[] = Array.isArray(cfg.profiles) ? cfg.profiles : [];
  cfg.profiles = profiles.map((p) => {
    const fixed: ProxyProfile = {
      id: typeof p?.id === 'string' && p.id ? p.id : uid('profile-'),
      name: typeof p?.name === 'string' ? p.name : '',
      color: typeof p?.color === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(p.color) ? p.color : '#005FB8',
      scheme: SCHEMES.includes(p?.scheme as ProxyScheme) ? (p.scheme as ProxyScheme) : 'http',
      host: typeof p?.host === 'string' ? p.host : '',
      port: Number.isInteger(Number(p?.port)) ? Number(p.port) : 8080,
      bypassList: Array.isArray(p?.bypassList) ? p.bypassList.filter((x) => typeof x === 'string') : [...base.profiles[0].bypassList],
    };
    if (p?.auth && typeof p.auth.username === 'string' && typeof p.auth.password === 'string') {
      fixed.auth = { username: p.auth.username, password: p.auth.password };
    }
    return fixed;
  });

  // ---- 自动切换规则：丢弃空规则、指向已删除配置的规则回退为直连 ----
  const profileIds = new Set(cfg.profiles.map((p) => p.id));
  cfg.autoRules = (Array.isArray(cfg.autoRules) ? cfg.autoRules : [])
    .filter((r) => r && typeof r.pattern === 'string' && r.pattern.trim())
    .map((r) => ({
      id: typeof r.id === 'string' && r.id ? r.id : uid('rule-'),
      pattern: r.pattern.trim(),
      target: r.target === 'direct' || profileIds.has(r.target) ? r.target : 'direct',
    }));
  cfg.autoFallback =
    cfg.autoFallback === 'direct' || profileIds.has(cfg.autoFallback) ? cfg.autoFallback : 'direct';

  // ---- 激活引用：fixed 模式指向的配置若已不存在，回退为直连 ----
  if (cfg.activeProfileId && !profileIds.has(cfg.activeProfileId)) {
    cfg.activeProfileId = null;
  }
  if (cfg.activeMode === 'fixed' && !cfg.activeProfileId) {
    cfg.activeMode = 'direct';
  }

  // ---- 其余开关 ----
  cfg.pacScript = typeof cfg.pacScript === 'string' && cfg.pacScript.trim() ? cfg.pacScript : PAC_TEMPLATE;
  cfg.useLastProxy = cfg.useLastProxy === true;
  cfg.showBadge = cfg.showBadge !== false; // 默认开启徽标
  cfg.uiLocale = UI_LOCALES.includes(cfg.uiLocale) ? cfg.uiLocale : 'auto';

  return cfg;
}

/**
 * 加载配置（三段式）：
 * 1. v2 根对象存在 → sanitize 后返回
 * 2. 不存在但检测到旧版 3.x 遗留键 → 迁移成 v2（保留旧键不删除，兼容降级）
 * 3. 全新安装 → 默认配置
 */
export async function loadConfig(): Promise<ExtensionConfig> {
  const raw = await readRawConfig();
  if (raw) return sanitizeConfig(raw);

  const legacy = await readLegacyKeys();
  if (legacy.proxyConfigs) {
    try {
      const arr = JSON.parse(legacy.proxyConfigs) as [string, ProxyProfile][];
      const profiles = arr.map(([, p]) => migrateLegacyProfile(p as never));
      return sanitizeConfig({
        ...defaultConfig(),
        profiles,
        useLastProxy: legacy.useLastProxy === true,
      });
    } catch {
      // 旧数据损坏时按全新安装处理
    }
  }
  return defaultConfig();
}

/** 保存前先 sanitize，保证落盘数据永远自洽 */
export async function saveConfig(cfg: ExtensionConfig): Promise<ExtensionConfig> {
  const clean = sanitizeConfig(cfg);
  await writeRawConfig(clean);
  return clean;
}

/** 重置为出厂默认（保留 useLastProxy 开关，减少重置带来的困扰） */
export async function resetConfig(): Promise<ExtensionConfig> {
  const fresh = defaultConfig();
  const current = await readRawConfig();
  if (current) fresh.useLastProxy = current.useLastProxy === true;
  await writeRawConfig(fresh);
  return fresh;
}

/**
 * 订阅配置变化。
 * onChange 拿到的永远是 sanitize 过的配置；返回取消订阅函数。
 */
export function subscribeConfig(
  onChange: (cfg: ExtensionConfig) => void,
): () => void {
  return watchRawConfig((next) => {
    if (next) onChange(sanitizeConfig(next));
  });
}
