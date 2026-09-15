/**
 * 全局配置状态（单例 composable）
 * popup / options 共用：加载 → 响应式引用 → 写入（写 storage 即全局广播）
 *
 * 用法：
 *   const { config, ready, update } = useConfig();
 *   update((draft) => { draft.activeMode = 'direct'; });
 */
import { ref } from 'vue';
import { loadConfig, saveConfig, subscribeConfig } from '@/utils/config';
import { currentUiLocaleSetting, setUiLocale } from '@/utils/i18n';
import { deepClone } from '@/utils/object';
import type { ExtensionConfig } from '@/types';

/** 模块级单例：同页面多处 useConfig 共享同一份响应式状态 */
const config = ref<ExtensionConfig | null>(null);
const ready = ref(false);
let started = false;

export function useConfig() {
  if (!started) {
    started = true;
    void loadConfig().then((cfg) => {
      config.value = cfg;
      ready.value = true;
      // 界面语言跟随配置加载（手动指定时加载对应 _locales 资源）
      void setUiLocale(cfg.uiLocale);
    });

    // 其它上下文（popup / background / 另一个页面）写入时同步到本地
    subscribeConfig((next) => {
      config.value = next;
      // 其它页面切换了界面语言时，本页面跟随刷新
      if (next.uiLocale !== currentUiLocaleSetting()) void setUiLocale(next.uiLocale);
    });
  }

  /**
   * 以"草稿"方式修改配置并保存：
   * update((draft) => { draft.activeMode = 'fixed'; })
   * 修改的是深拷贝，保存成功后才替换本地引用（写坏的数据不会进内存）。
   */
  async function update(mutator: (draft: ExtensionConfig) => void): Promise<ExtensionConfig | null> {
    if (!config.value) return null;
    const draft = deepClone(config.value);
    mutator(draft);
    const saved = await saveConfig(draft);
    config.value = saved; // storage.watch 也会回推，这里先行为赋值避免闪烁
    return saved;
  }

  return { config, ready, update };
}
