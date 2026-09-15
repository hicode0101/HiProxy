<script setup lang="ts">
/**
 * 关于 Tab：项目信息 + 版本 + 新版特性说明
 * 长文案按界面语言渲染：短标签走 t()，整段介绍放在组件内双语字典，
 * 避免把大段文字塞进 messages.json；resolvedUiLocale 是响应式的，切换语言即时生效。
 */
import { computed } from 'vue';
import { NAlert, NTable } from 'naive-ui';
import { browser } from '#imports';
import { resolvedUiLocale } from '@/utils/i18n';

const version = browser.runtime.getManifest().version;

interface AboutCopy {
  project: string;
  versionLabel: string;
  author: string;
  featuresTitle: string;
  features: string[];
  warning: string;
}

const COPY: Record<'zh_CN' | 'en', AboutCopy> = {
  zh_CN: {
    project: '项目地址：',
    versionLabel: '版本号：',
    author: '作者：',
    featuresTitle: 'v4 新版特性',
    features: [
      '全新 Win11 (Fluent Design) 界面，配置结构化存储并支持版本迁移',
      '新增「自动切换」模式：按域名规则自动选择代理，先命中先生效',
      '新增「PAC 脚本」模式：完全自定义 PAC 脚本',
      '支持 HTTP/HTTPS 代理用户名密码认证（自动回填，无需手动输入）',
      '工具栏图标显示模式徽标，Popup 高亮当前使用的代理',
      '界面语言可切换：跟随浏览器 / English / 简体中文',
      '导入配置自动识别并升级旧版 3.x 格式',
    ],
    warning:
      '本系列工具软件仅供白帽子安全研究和技术交流使用，禁止用于商业用途。SOCKS5 ' +
      '用户名密码认证受 Chrome 平台限制，请配合 HiLocalProxy 小工具使用。',
  },
  en: {
    project: 'Project: ',
    versionLabel: 'Version: ',
    author: 'Author: ',
    featuresTitle: "What's new in v4",
    features: [
      'Brand-new Win11 (Fluent Design) UI; config stored as a structured, versioned schema',
      'New "Auto Switch" mode: pick a proxy per domain rule, first match wins',
      'New "PAC Script" mode: fully custom PAC script',
      'HTTP/HTTPS proxy username & password auth (auto-filled, no manual input)',
      'Toolbar icon shows a mode badge; the popup highlights the active proxy',
      'Switchable UI language: follow browser / English / 简体中文',
      'Import auto-detects and upgrades legacy 3.x backup files',
    ],
    warning:
      'This tool is for white-hat security research and technical exchange only; commercial use is prohibited. ' +
      'SOCKS5 username/password auth is limited by the Chrome platform — use it with the HiLocalProxy helper tool.',
  },
};

const copy = computed(() => COPY[resolvedUiLocale()]);
</script>

<template>
  <div>
    <n-table :bordered="false" :single-line="false">
      <tbody>
        <tr>
          <td class="row-label">{{ copy.project }}</td>
          <td>
            <a href="https://github.com/hicode0101/HiProxy" target="_blank">
              https://github.com/hicode0101/HiProxy
            </a>
          </td>
        </tr>
        <tr>
          <td>{{ copy.versionLabel }}</td>
          <td>v{{ version }}</td>
        </tr>
        <tr>
          <td>{{ copy.author }}</td>
          <td>hicode0101</td>
        </tr>
      </tbody>
    </n-table>

    <n-alert type="info" style="margin-top: 16px" :title="copy.featuresTitle">
      <ul class="feature-list">
        <li v-for="(item, i) in copy.features" :key="i">{{ item }}</li>
      </ul>
    </n-alert>

    <n-alert type="warning" style="margin-top: 12px">
      {{ copy.warning }}
    </n-alert>
  </div>
</template>

<style scoped>
.row-label {
  width: 130px;
  font-weight: 600;
}

.feature-list {
  margin: 4px 0 2px;
  padding-left: 18px;
  font-size: 13px;
  line-height: 1.9;
}
</style>
