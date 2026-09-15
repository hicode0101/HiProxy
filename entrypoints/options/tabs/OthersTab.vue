<script setup lang="ts">
/**
 * 其它配置 Tab
 * 开关型设置，改动即时保存生效：
 * - 默认上一次代理：浏览器重启后是否自动恢复上次使用的代理
 * - 模式徽标：工具栏图标上显示模式文字
 * - 浏览器语言 / 界面语言：展示当前浏览器语言，并可手动切换扩展界面语言
 */
import { computed, ref, watch } from 'vue';
import { NSelect, NSwitch, NTable, NTag } from 'naive-ui';

import { useConfig } from '@/composables/useConfig';
import { browserLocale, t } from '@/utils/i18n';
import type { UiLocaleSetting } from '@/types';

const { config, update } = useConfig();

/** 本地镜像（避免开关在配置未加载完成时闪烁） */
const useLastProxy = ref(false);
const showBadge = ref(true);
const uiLocale = ref<UiLocaleSetting>('auto');

watch(
  config,
  (cfg) => {
    if (cfg) {
      useLastProxy.value = cfg.useLastProxy;
      showBadge.value = cfg.showBadge;
      uiLocale.value = cfg.uiLocale;
    }
  },
  { immediate: true },
);

/** 浏览器 UI 语言（如 zh-CN / en-US），只读展示 */
const browserLang = browserLocale();

/** 界面语言下拉选项：语言名按惯例始终以各自语言显示，不随界面语言翻译 */
const localeOptions = computed(() => [
  { label: t('others_lang_auto'), value: 'auto' },
  { label: 'English', value: 'en' },
  { label: '简体中文', value: 'zh_CN' },
]);

function onUseLastChange(value: boolean) {
  void update((d) => {
    d.useLastProxy = value;
  });
}

function onShowBadgeChange(value: boolean) {
  void update((d) => {
    d.showBadge = value;
  });
}

/** 切换界面语言：保存后 useConfig 的订阅会加载对应语言资源，全界面自动刷新 */
function onUiLocaleChange(value: UiLocaleSetting) {
  void update((d) => {
    d.uiLocale = value;
  });
}
</script>

<template>
  <n-table :bordered="false" :single-line="false">
    <tbody>
      <tr>
        <td class="row-label">{{ t('others_use_last') }}</td>
        <td>
          <n-switch v-model:value="useLastProxy" @update:value="onUseLastChange" />
          <span class="hint">{{ t('others_use_last_hint') }}</span>
        </td>
      </tr>
      <tr>
        <td>{{ t('others_badge') }}</td>
        <td>
          <n-switch v-model:value="showBadge" @update:value="onShowBadgeChange" />
          <span class="hint">{{ t('others_badge_hint') }}</span>
        </td>
      </tr>
      <tr>
        <td>{{ t('others_lang_browser') }}</td>
        <td>
          <n-tag size="small" :bordered="false" class="lang-tag">{{ browserLang }}</n-tag>
          <span class="hint">{{ t('others_lang_browser_hint') }}</span>
        </td>
      </tr>
      <tr>
        <td>{{ t('others_lang_ui') }}</td>
        <td>
          <n-select
            v-model:value="uiLocale"
            class="locale-select"
            size="small"
            :options="localeOptions"
            @update:value="onUiLocaleChange"
          />
          <span class="hint">{{ t('others_lang_hint') }}</span>
        </td>
      </tr>
    </tbody>
  </n-table>
</template>

<style scoped>
.row-label {
  width: 150px;
  font-weight: 600;
}

.hint {
  margin-left: 12px;
  font-size: 13px;
  color: #8a8a8a;
}

.lang-tag {
  font-family: Consolas, monospace;
}

.locale-select {
  display: inline-block; /* n-select 默认块级，转行内让 hint 与其同行 */
  width: 220px;
  vertical-align: middle;
}
</style>
