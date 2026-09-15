<script setup lang="ts">
/**
 * 导入导出 Tab
 * - 导出：当前完整配置（含自动切换规则 / PAC 脚本）下载为 HiProxyConfig.json
 * - 导入：自动识别 v2 格式与旧版 3.x 格式（自动升级），导入前校验并二次确认
 * - 重置：恢复出厂默认配置
 */
import { ref } from 'vue';
import { NAlert, NButton, NTable, useDialog, useMessage } from 'naive-ui';
import { ArrowDownload24Regular as ExportIcon } from '@vicons/fluent';
import { ArrowUpload24Regular as ImportIcon } from '@vicons/fluent';
import { ArrowReset24Regular as ResetIcon } from '@vicons/fluent';

import { useConfig } from '@/composables/useConfig';
import { resetConfig, saveConfig, sanitizeConfig } from '@/utils/config';
import { buildBackupFile, parseBackupFile } from '@/utils/config/validate';
import { t } from '@/utils/i18n';

const message = useMessage();
const dialog = useDialog();
const { config } = useConfig();

const fileInput = ref<HTMLInputElement | null>(null);
/** 选中但尚未导入的文件内容 */
let pendingImport: string | null = null;

/** 导出当前配置 */
function exportConfig() {
  if (!config.value) return;
  const data = JSON.stringify(buildBackupFile(config.value), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'HiProxyConfig.json';
  link.click();
  URL.revokeObjectURL(link.href);
  message.success(t('io_export_ok'));
}

/** 选择文件后先暂存内容，确认后导入 */
function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    if (typeof e.target?.result === 'string') {
      pendingImport = e.target.result;
    } else {
      message.error(t('io_err_not_json'));
    }
  };
  reader.onerror = () => message.error(t('io_err_not_json'));
  reader.readAsText(file);
  input.value = ''; // 允许重复选择同一个文件
}

/** 解析 + 二次确认 + 导入 */
function importConfig() {
  if (!pendingImport) {
    message.warning(t('io_err_no_file'));
    return;
  }
  const parsed = parseBackupFile(pendingImport);
  if (!parsed.ok) {
    message.error(t(parsed.error));
    return;
  }
  const clean = sanitizeConfig(parsed.config);

  dialog.warning({
    title: t('io_import_confirm_title'),
    content: t('io_import_confirm', [
      String(clean.profiles.length),
      String(clean.autoRules.length),
    ]),
    positiveText: t('common_confirm'),
    negativeText: t('common_cancel'),
    onPositiveClick: async () => {
      await saveImported(clean, parsed.legacy);
    },
  });
}

async function saveImported(clean: ReturnType<typeof sanitizeConfig>, legacy: boolean) {
  await saveConfig(clean);
  if (legacy) message.success(t('io_imported_legacy'));
  message.success(t('io_imported', String(clean.profiles.length)));
}

/** 重置为出厂默认 */
function resetAll() {
  dialog.warning({
    title: t('io_reset_confirm_title'),
    content: t('io_reset_confirm'),
    positiveText: t('common_confirm'),
    negativeText: t('common_cancel'),
    onPositiveClick: async () => {
      await resetConfig();
      message.success(t('profiles_reset_ok'));
    },
  });
}
</script>

<template>
  <div>
    <n-alert type="info" style="margin-bottom: 14px">
      {{ t('io_desc') }}
    </n-alert>

    <n-table :bordered="false" :single-line="false">
      <tbody>
        <tr>
          <td class="row-label">{{ t('io_export_label') }}</td>
          <td>
            <n-button type="primary" @click="exportConfig">
              <template #icon><n-icon :component="ExportIcon" /></template>
              {{ t('io_export') }}
            </n-button>
          </td>
        </tr>
        <tr>
          <td>{{ t('io_import_label') }}</td>
          <td>
            <div class="import-area">
              <label class="file-picker">
                <input
                  ref="fileInput"
                  type="file"
                  accept="application/json,.json"
                  @change="onFileChange"
                />
                {{ t('io_file_choose') }}
              </label>
              <n-button type="warning" @click="importConfig">
                <template #icon><n-icon :component="ImportIcon" /></template>
                {{ t('io_import') }}
              </n-button>
            </div>
          </td>
        </tr>
        <tr>
          <td>{{ t('io_reset_label') }}</td>
          <td>
            <n-button type="error" secondary @click="resetAll">
              <template #icon><n-icon :component="ResetIcon" /></template>
              {{ t('io_reset') }}
            </n-button>
          </td>
        </tr>
      </tbody>
    </n-table>
  </div>
</template>

<style scoped>
.row-label {
  width: 120px;
  font-weight: 600;
}

.import-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 原生文件选择框做成 Win11 风格按钮外观 */
.file-picker {
  display: inline-flex;
  align-items: center;
  padding: 0 16px;
  height: 34px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  background: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;
}

.file-picker:hover {
  background: #f5f5f5;
}

.file-picker input[type='file'] {
  display: none;
}
</style>
