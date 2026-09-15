/**
 * 轻量 i18n：文案统一放在 _locales 下（en / zh_CN），popup / options / background 通吃
 *
 * 支持界面语言手动切换（其它配置 → 界面语言）：
 * - 'auto'   ：跟随浏览器 UI 语言（browser.i18n.getUILanguage）
 * - 'en'/'zh_CN'：手动指定。Chrome 的 i18n API 不支持运行时切换，
 *   因此自行 fetch 对应 _locales/<locale>/messages.json 并手动替换 $1 占位符
 *
 * 注意 1：browser.* 方法必须保持 obj.method() 调用形式，
 *         提取成变量会丢失 receiver 导致 SW 里抛 TypeError。
 * 注意 2：messages 是响应式的，语言切换后所有 t() 调用处（模板/computed）自动刷新。
 */
import { ref } from 'vue';
import { browser } from '#imports';
import type { UiLocaleSetting } from '@/types';

/** 支持的语言资源目录（与 manifest 的 _locales 目录对应） */
type ResolvedLocale = 'zh_CN' | 'en';

/** 用户设置（auto / en / zh_CN） */
const setting = ref<UiLocaleSetting>('auto');
/** 实际生效的语言资源 */
const locale = ref<ResolvedLocale>('zh_CN');
/** 当前语言的全部文案（key → message 模板） */
const messages = ref<Record<string, string>>({});

/** 当前浏览器 UI 语言（如 zh-CN / en-US），供展示用 */
export function browserLocale(): string {
  return browser.i18n.getUILanguage?.() ?? 'en';
}

/** 把 'auto' 设置解析为实际资源语言：中文浏览器用 zh_CN，其余用 en */
function resolveLocale(s: UiLocaleSetting): ResolvedLocale {
  if (s === 'zh_CN' || s === 'en') return s;
  return browserLocale().toLowerCase().startsWith('zh') ? 'zh_CN' : 'en';
}

/** 从扩展包内加载对应语言的 messages.json（key → message 模板） */
async function loadMessages(target: ResolvedLocale): Promise<Record<string, string>> {
  try {
    const url = browser.runtime.getURL(`/_locales/${target}/messages.json`);
    const res = await fetch(url);
    const data = (await res.json()) as Record<string, { message?: string }>;
    const out: Record<string, string> = {};
    for (const [key, item] of Object.entries(data)) {
      out[key] = item?.message ?? key;
    }
    return out;
  } catch {
    return {}; // 加载失败时退回原生 getMessage
  }
}

/** 手动替换 $1、$2 占位符（等价于原生 getMessage 的占位符行为） */
function substitute(template: string, substitutions?: string | string[]): string {
  const args =
    substitutions == null ? [] : Array.isArray(substitutions) ? substitutions : [substitutions];
  return template.replace(/\$(\d+)/g, (raw, idx) => args[Number(idx) - 1] ?? raw);
}

/**
 * 取多语言文案；自定义资源缺失时回退原生 getMessage，再缺失返回 key 本身，方便发现漏配。
 * 读取了响应式 messages，因此语言切换后所有调用处自动刷新。
 */
export function t(key: string, substitutions?: string | string[]): string {
  const tpl = messages.value[key];
  if (tpl !== undefined) return substitute(tpl, substitutions);
  // wxt 生成的类型把 key 收窄成字面量联合，这里用参数级断言放宽为 string
  const msg = browser.i18n.getMessage(key as never, substitutions as never);
  return msg || key;
}

/** 当前生效的语言资源（zh_CN / en） */
export function resolvedUiLocale(): ResolvedLocale {
  return locale.value;
}

/** 当前用户设置（auto / en / zh_CN），用于判断是否需要切换 */
export function currentUiLocaleSetting(): UiLocaleSetting {
  return setting.value;
}

/** 切换界面语言并加载对应资源；设置未变化且资源已就绪时跳过 */
export async function setUiLocale(next: UiLocaleSetting): Promise<void> {
  if (next === setting.value && Object.keys(messages.value).length > 0) return;
  setting.value = next;
  locale.value = resolveLocale(next);
  messages.value = await loadMessages(locale.value);
}
