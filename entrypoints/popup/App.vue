<script setup lang="ts">
/**
 * Popup 快捷切换菜单
 * - 展示当前状态（图标颜色与页面头部一致）
 * - 直接连接 / 系统代理 / 自动切换 / PAC 脚本 / 各代理配置，当前项高亮
 * - 底部：配置选项入口 + 查询当前 IP
 * 点击即写入配置，由 background 监听变化后统一应用。
 */
import { computed } from 'vue';
import { NIcon } from 'naive-ui';
import {
  CheckmarkOutline,
  DesktopOutline,
  GitNetworkOutline,
  GlobeOutline,
  LogoChrome,
  SettingsOutline,
  DocumentTextOutline,
} from '@vicons/ionicons5';
import { ArrowSwap24Filled } from '@vicons/fluent';

import { browser } from '#imports';
import { useConfig } from '@/composables/useConfig';
import { describeTarget, resolveTarget } from '@/utils/proxy/engine';
import { t } from '@/utils/i18n';
import type { ProxyMode } from '@/types';

const { config, update } = useConfig();

/** 当前激活菜单项的 key：direct / system / auto / pac / profile.id */
const activeKey = computed(() => {
  const cfg = config.value;
  if (!cfg) return '';
  switch (cfg.activeMode) {
    case 'fixed':
      return cfg.activeProfileId ?? '';
    case 'auto':
    case 'pac':
    case 'system':
    case 'direct':
      return cfg.activeMode;
  }
});

/** 页头状态文本 */
const status = computed(() => {
  if (!config.value) return { text: '…', color: '#9b9b9b' };
  const target = resolveTarget(config.value);
  return { text: describeTarget(target), color: target.badgeColor };
});

/** 切换模式并关闭 popup */
async function switchTo(mode: ProxyMode, profileId: string | null = null) {
  await update((d) => {
    d.activeMode = mode;
    d.activeProfileId = profileId;
  });
  window.close();
}

function openOptions() {
  void browser.runtime.openOptionsPage();
  window.close();
}

function queryMyIp() {
  void browser.tabs.create({ url: 'https://ip.hicode.top' });
  window.close();
}
</script>

<template>
  <div class="popup">
    <!-- 头部：标题 + 当前状态 -->
    <div class="header">
      <div class="logo" />
      <span class="title">HiProxy</span>
      <span class="status">
        <span class="dot" :style="{ background: status.color }" />
        {{ status.text }}
      </span>
    </div>

    <!-- 基础模式 -->
    <div class="menu-item" :class="{ active: activeKey === 'direct' }" @click="switchTo('direct')">
      <span class="icon"><n-icon :component="ArrowSwap24Filled" :color="'#8a8a8a'" /></span>
      <span class="label">{{ t('pop_direct') }}</span>
      <n-icon v-if="activeKey === 'direct'" class="check" :component="CheckmarkOutline" />
    </div>
    <div class="menu-item" :class="{ active: activeKey === 'system' }" @click="switchTo('system')">
      <span class="icon"><n-icon :component="DesktopOutline" /></span>
      <span class="label">{{ t('pop_system') }}</span>
      <n-icon v-if="activeKey === 'system'" class="check" :component="CheckmarkOutline" />
    </div>

    <!-- 智能模式 -->
    <div class="menu-item" :class="{ active: activeKey === 'auto' }" @click="switchTo('auto')">
      <span class="icon"><n-icon :component="GitNetworkOutline" :color="'#0067c0'" /></span>
      <span class="label">{{ t('pop_auto') }}</span>
      <n-icon v-if="activeKey === 'auto'" class="check" :component="CheckmarkOutline" />
    </div>
    <div class="menu-item" :class="{ active: activeKey === 'pac' }" @click="switchTo('pac')">
      <span class="icon"><n-icon :component="DocumentTextOutline" :color="'#744da9'" /></span>
      <span class="label">{{ t('pop_pac') }}</span>
      <n-icon v-if="activeKey === 'pac'" class="check" :component="CheckmarkOutline" />
    </div>

    <div class="divider" />
    <div class="section-title">{{ t('pop_profiles_section') }}</div>

    <!-- 代理配置列表 -->
    <template v-if="config && config.profiles.length > 0">
      <div
        v-for="profile in config.profiles"
        :key="profile.id"
        class="menu-item"
        :class="{ active: activeKey === profile.id }"
        :title="`${profile.scheme.toUpperCase()} ${profile.host}:${profile.port}`"
        @click="switchTo('fixed', profile.id)"
      >
        <span class="icon"><n-icon :component="LogoChrome" :color="profile.color" /></span>
        <span class="label">{{ profile.name }}</span>
        <n-icon v-if="activeKey === profile.id" class="check" :component="CheckmarkOutline" />
      </div>
    </template>
    <div v-else class="empty-tip">{{ t('pop_no_configs') }}</div>

    <div class="divider" />

    <!-- 入口 -->
    <div class="menu-item" @click="openOptions">
      <span class="icon"><n-icon :component="SettingsOutline" /></span>
      <span class="label">{{ t('pop_options') }}</span>
    </div>
    <div class="menu-item" @click="queryMyIp">
      <span class="icon"><n-icon :component="GlobeOutline" /></span>
      <span class="label">{{ t('pop_myip') }}</span>
    </div>
  </div>
</template>
