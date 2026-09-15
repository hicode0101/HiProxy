<script setup lang="ts">
/**
 * PAC 脚本 Tab
 * - 自定义 PAC 脚本编辑器（等宽字体）
 * - 保存 / 保存并启用 / 恢复默认模板 / 由自动切换规则生成
 */
import { computed, ref, watch } from 'vue';
import { NAlert, NButton, NIcon, NInput, NSpace, NText, useMessage } from 'naive-ui';
import { DocumentBulletList20Regular as ScriptIcon } from '@vicons/fluent';
import { Wand24Regular as WandIcon } from '@vicons/fluent';
import { ArrowReset24Regular as ResetIcon } from '@vicons/fluent';

import { useConfig } from '@/composables/useConfig';
import { buildAutoPacScript, isAsciiOnly, looksLikeValidPac } from '@/utils/proxy/pac';
import { PAC_TEMPLATE } from '@/utils/config/defaults';
import { t } from '@/utils/i18n';

const message = useMessage();
const { config, update } = useConfig();

/** 脚本编辑草稿 */
const script = ref('');
/** 有未保存修改时，不再跟随外部配置刷新 */
const dirty = ref(false);

watch(
  config,
  (cfg) => {
    if (cfg && !dirty.value) script.value = cfg.pacScript;
  },
  { immediate: true },
);

/** 脚本缺少入口函数时给出警示（Chrome 会拒绝执行） */
const invalid = computed(() => !looksLikeValidPac(script.value));

/** Chrome 要求 pacScript 内容只含 ASCII（中文注释会导致启用失败） */
const nonAscii = computed(() => !isAsciiOnly(script.value));

async function save(enable: boolean) {
  if (nonAscii.value) {
    message.error(t('pac_err_non_ascii'));
    return;
  }
  await update((d) => {
    d.pacScript = script.value;
    if (enable) d.activeMode = 'pac';
  });
  dirty.value = false;
  message.success(enable ? t('pac_enabled_ok') : t('pac_save_ok'));
}

function resetTemplate() {
  script.value = PAC_TEMPLATE;
  dirty.value = true;
}

function fromAutoRules() {
  if (!config.value) return;
  script.value = buildAutoPacScript(config.value);
  dirty.value = true;
}
</script>

<template>
  <div>
    <n-alert type="info" style="margin-bottom: 14px">
      {{ t('pac_desc') }}
    </n-alert>

    <n-alert v-if="invalid" type="warning" style="margin-bottom: 14px">
      {{ t('pac_invalid_warn') }}
    </n-alert>
    <n-alert v-else-if="nonAscii" type="warning" style="margin-bottom: 14px">
      {{ t('pac_err_non_ascii') }}
    </n-alert>

    <n-input
      v-model:value="script"
      type="textarea"
      :autosize="false"
      :rows="18"
      class="script-editor"
      @update:value="dirty = true"
    />

    <n-space style="margin-top: 14px" align="center">
      <n-button type="primary" @click="save(false)">
        <template #icon><n-icon :component="ScriptIcon" /></template>
        {{ t('pac_save') }}
      </n-button>
      <n-button type="primary" secondary @click="save(true)">
        <template #icon><n-icon :component="WandIcon" /></template>
        {{ t('pac_save_enable') }}
      </n-button>
      <n-button @click="fromAutoRules">
        <template #icon><n-icon :component="WandIcon" /></template>
        {{ t('pac_from_auto') }}
      </n-button>
      <n-button quaternary @click="resetTemplate">
        <template #icon><n-icon :component="ResetIcon" /></template>
        {{ t('pac_reset_tpl') }}
      </n-button>
      <n-text v-if="dirty" depth="3" style="font-size: 12px">{{ t('pac_dirty_hint') }}</n-text>
    </n-space>
  </div>
</template>

<style scoped>
/* 固定行数 + 可手动拉伸：autosize 在 n-tabs( animated ) 内挂载时
   高度测量为 0，会导致编辑框整体塌陷消失 */
.script-editor :deep(textarea) {
  font-family: "Cascadia Code", Consolas, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.6;
  min-height: 380px;
  height: 380px;
  resize: vertical;
}
</style>
