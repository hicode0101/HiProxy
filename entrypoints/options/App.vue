<script setup lang="ts">
/**
 * Options 主页面
 * 布局：上下结构 —— 顶部 HiProxy 标题与当前状态，下方为功能 Tab 选项卡
 */
import { computed } from 'vue';
import {
  NCard,
  NConfigProvider,
  NDialogProvider,
  NMessageProvider,
  NTabPane,
  NTabs,
} from 'naive-ui';
import { win11Theme } from '@/assets/styles/theme';
import { t } from '@/utils/i18n';
import { useConfig } from '@/composables/useConfig';
import { describeTarget, resolveTarget } from '@/utils/proxy/engine';

import ProfilesTab from './tabs/ProfilesTab.vue';
import AutoSwitchTab from './tabs/AutoSwitchTab.vue';
import PacTab from './tabs/PacTab.vue';
import ImportExportTab from './tabs/ImportExportTab.vue';
import OthersTab from './tabs/OthersTab.vue';
import WildcardDocTab from './tabs/WildcardDocTab.vue';
import AboutTab from './tabs/AboutTab.vue';

const { config } = useConfig();

/** 头部状态条：当前代理模式 + 目标 */
const status = computed(() => {
  if (!config.value) return { text: '…', color: '#9b9b9b' };
  const target = resolveTarget(config.value);
  return { text: describeTarget(target), color: target.badgeColor };
});
</script>

<template>
  <n-config-provider :theme-overrides="win11Theme">
    <n-message-provider>
      <n-dialog-provider>
        <div class="page">
          <!-- 页头 -->
          <header class="hero">
            <div class="hero-logo" />
            <div>
              <h1 class="hero-title">HiProxy</h1>
              <p class="hero-desc">{{ t('plugin_desc') }}</p>
            </div>
            <div class="hero-status">
              <span class="dot" :style="{ background: status.color }" />
              <span>{{ t('status_current') }}{{ status.text }}</span>
            </div>
          </header>

          <!-- 功能选项卡 -->
          <n-card class="win-card main-card" :bordered="false">
            <!-- 不使用 animated：滑动动画会导致 textarea autosize 初次测量高度为 0 -->
            <n-tabs type="line">
              <n-tab-pane name="profiles" :tab="t('tab_profiles')">
                <ProfilesTab />
              </n-tab-pane>
              <n-tab-pane name="auto" :tab="t('tab_auto')">
                <AutoSwitchTab />
              </n-tab-pane>
              <n-tab-pane name="pac" :tab="t('tab_pac')">
                <PacTab />
              </n-tab-pane>
              <n-tab-pane name="io" :tab="t('tab_io')">
                <ImportExportTab />
              </n-tab-pane>
              <n-tab-pane name="others" :tab="t('tab_others')">
                <OthersTab />
              </n-tab-pane>
              <n-tab-pane name="doc" :tab="t('tab_doc')">
                <WildcardDocTab />
              </n-tab-pane>
              <n-tab-pane name="about" :tab="t('tab_about')">
                <AboutTab />
              </n-tab-pane>
            </n-tabs>
          </n-card>

          <!-- 页脚 -->
          <footer class="footer">
            Copyright by
            <a href="https://github.com/hicode0101" target="_blank">hicode0101</a>
          </footer>
        </div>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>
