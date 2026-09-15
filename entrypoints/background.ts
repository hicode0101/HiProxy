/**
 * Background Service Worker
 * 职责单一：监听配置变化并应用代理；处理扩展安装/浏览器启动；注册代理认证。
 * 所有业务逻辑都在 utils/proxy/* 中，这里是组装层。
 */
import { browser, defineBackground } from '#imports';
import { loadConfig, saveConfig, subscribeConfig } from '@/utils/config';
import { currentUiLocaleSetting, setUiLocale } from '@/utils/i18n';
import { applyConfig } from '@/utils/proxy/engine';
import { initAuthListener } from '@/utils/proxy/auth';
import { appendLog } from '@/utils/proxy/debug';
import type { ExtensionConfig } from '@/types';

export default defineBackground(() => {
  // 代理认证监听必须顶层同步注册
  initAuthListener();

  void appendLog(`SW boot, runtime id=${browser.runtime.id}`);

  // 应用代理前先同步界面语言，保证工具栏徽标 tooltip 文案与设置一致
  async function syncLocaleAndApply(cfg: ExtensionConfig) {
    if (cfg.uiLocale !== currentUiLocaleSetting()) await setUiLocale(cfg.uiLocale);
    await applyConfig(cfg);
  }

  // 配置变化（popup / options 写入）→ 立即应用，事件驱动单一出口
  subscribeConfig((cfg) => {
    void appendLog(`watch fired: mode=${cfg.activeMode} profile=${cfg.activeProfileId ?? 'null'}`);
    syncLocaleAndApply(cfg).then(
      () => appendLog('applyConfig done'),
      (err) => appendLog(`applyConfig threw: ${String(err)}`),
    );
  });

  // 首次安装：初始化默认配置；更新安装：同步应用当前配置
  browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      void loadConfig().then((cfg) => saveConfig(cfg));
    } else {
      void loadConfig().then((cfg) => syncLocaleAndApply(cfg));
    }
  });

  // 浏览器启动：按"恢复上次代理"开关决定行为（不覆盖已保存的激活配置）
  browser.runtime.onStartup.addListener(() => {
    void loadConfig().then((cfg) => {
      if (cfg.useLastProxy) {
        void syncLocaleAndApply(cfg);
      } else {
        // 仅临时切直连，保存的 activeMode 保持不变，方便用户手动恢复
        void syncLocaleAndApply({ ...cfg, activeMode: 'direct' });
      }
    });
  });
});
