<script setup lang="ts">
/**
 * 代理配置 Tab
 * - 列表内编辑的是"草稿"，点击【批量保存】才写入配置（保留旧版的使用习惯）
 * - 每行可设为当前代理 / 打开详情弹窗 / 删除
 * - 行内有校验红框：名称非空且不重复、host 非空、端口 1~65535
 */
import { computed, ref, watch } from 'vue';
import {
  NButton,
  NColorPicker,
  NEmpty,
  NIcon,
  NInput,
  NInputNumber,
  NSelect,
  NTag,
  NTooltip,
  useDialog,
  useMessage,
} from 'naive-ui';
import { AppsListDetail24Regular as DetailIcon } from '@vicons/fluent';
import { Delete24Regular as DeleteIcon } from '@vicons/fluent';
import { Add24Regular as AddIcon } from '@vicons/fluent';
import { LogoChrome, PowerOutline } from '@vicons/ionicons5';

import ProfileDetailModal from '@/components/ProfileDetailModal.vue';
import { useConfig } from '@/composables/useConfig';
import { resetConfig } from '@/utils/config';
import { PROFILE_COLORS, PROFILE_TEMPLATES } from '@/utils/config/defaults';
import { validateProfileList } from '@/utils/config/validate';
import { deepClone } from '@/utils/object';
import { t } from '@/utils/i18n';
import type { ProxyProfile, ProxyScheme } from '@/types';

const message = useMessage();
const dialog = useDialog();
const { config, update } = useConfig();

/** 草稿列表（未保存前不影响实际代理） */
const drafts = ref<ProxyProfile[]>([]);
/** 草稿是否有未保存修改；无修改时跟随全局配置自动刷新 */
const dirty = ref(false);
/** 详情弹窗 */
const modalShow = ref(false);
const modalProfile = ref<ProxyProfile | null>(null);
/** 新增模板选择 */
const templateKey = ref('blank');

const schemeOptions = (['http', 'https', 'socks4', 'socks5'] as ProxyScheme[]).map((v) => ({
  label: v.toUpperCase(),
  value: v,
}));

const templateOptions = PROFILE_TEMPLATES.map((tpl) => ({
  label: t(tpl.labelKey),
  value: tpl.key,
}));

// 首次加载 + 外部变更（导入/重置/其它页面修改）时同步草稿
watch(
  config,
  (cfg) => {
    if (cfg && !dirty.value) drafts.value = deepClone(cfg.profiles);
  },
  { immediate: true },
);

/** 行级校验结果：行索引 → 问题列表 */
const issuesByRow = computed(() => validateProfileList(drafts.value));

/** 当前 fixed 模式激活的配置 id */
const activeId = computed(() =>
  config.value?.activeMode === 'fixed' ? config.value.activeProfileId : null,
);

function addFromTemplate() {
  const tpl = PROFILE_TEMPLATES.find((x) => x.key === templateKey.value) ?? PROFILE_TEMPLATES[PROFILE_TEMPLATES.length - 1];
  drafts.value.push(tpl.build());
  dirty.value = true;
}

function removeRow(index: number) {
  drafts.value.splice(index, 1);
  dirty.value = true;
}

function openDetail(row: ProxyProfile) {
  modalProfile.value = row;
  modalShow.value = true;
}

/** 详情弹窗确认：写回草稿 */
function onDetailConfirm(next: ProxyProfile) {
  const index = drafts.value.findIndex((p) => p.id === next.id);
  if (index >= 0) drafts.value[index] = next;
  dirty.value = true;
}

/** 批量保存：全部校验通过才写入 */
async function saveAll() {
  if (issuesByRow.value.size > 0) {
    message.error(t('profiles_err_summary', String(issuesByRow.value.size)));
    return;
  }
  await update((d) => {
    d.profiles = deepClone(drafts.value);
  });
  dirty.value = false;
  message.success(t('profiles_save_ok'));
}

/** 一键切换为当前代理（同时保存当前草稿，避免丢失未保存的编辑） */
async function activate(row: ProxyProfile) {
  if (issuesByRow.value.size > 0) {
    message.error(t('profiles_err_summary', String(issuesByRow.value.size)));
    return;
  }
  await update((d) => {
    d.profiles = deepClone(drafts.value);
    d.activeMode = 'fixed';
    d.activeProfileId = row.id;
  });
  dirty.value = false;
  message.success(t('profiles_activated', row.name));
}

/** 重置：确认后恢复出厂配置（保留"恢复上次代理"开关） */
function resetAll() {
  dialog.warning({
    title: t('profiles_reset_confirm_title'),
    content: t('profiles_reset_confirm'),
    positiveText: t('common_confirm'),
    negativeText: t('common_cancel'),
    onPositiveClick: async () => {
      await resetConfig();
      dirty.value = false;
      message.success(t('profiles_reset_ok'));
    },
  });
}
</script>

<template>
  <div>
    <!-- 工具栏 -->
    <div class="toolbar">
      <n-select
        v-model:value="templateKey"
        :options="templateOptions"
        :consistent-menu-width="false"
        style="width: 200px"
      />
      <n-button type="primary" secondary @click="addFromTemplate">
        <template #icon><n-icon :component="AddIcon" /></template>
        {{ t('profiles_add') }}
      </n-button>

      <div class="toolbar-spacer" />

      <n-button type="primary" @click="saveAll">{{ t('profiles_save_all') }}</n-button>
      <n-button type="error" secondary @click="resetAll">{{ t('profiles_reset') }}</n-button>
    </div>

    <!-- 配置列表 -->
    <div class="rows">
      <div
        v-for="(row, index) in drafts"
        :key="row.id"
        class="row"
        :class="{ invalid: issuesByRow.has(index) }"
      >
        <!-- 行首图标：以配置色渲染，直观标识该行 -->
        <span class="row-icon">
          <n-icon :component="LogoChrome" :color="row.color" :size="24" />
        </span>

        <n-color-picker
          v-model:value="row.color"
          :modes="['hex']"
          :show-alpha="false"
          :swatches="PROFILE_COLORS"
          :actions="['confirm']"
          :style="{ width: '96px', flex: 'none' }"
        />

        <div class="name-cell">
          <n-input
            v-model:value="row.name"
            :placeholder="t('profiles_name_ph')"
            @update:value="dirty = true"
          />
          <n-tag v-if="row.id === activeId" type="success" size="small" :bordered="false">
            {{ t('profiles_in_use') }}
          </n-tag>
        </div>

        <n-select
          v-model:value="row.scheme"
          :options="schemeOptions"
          :consistent-menu-width="false"
          class="scheme"
          @update:value="dirty = true"
        />

        <n-input
          v-model:value="row.host"
          placeholder="host"
          class="host"
          @update:value="dirty = true"
        />

        <n-input-number
          :value="row.port"
          :show-button="false"
          placeholder="port"
          class="port"
          @update:value="(v) => (row.port = Number(v ?? 0), (dirty = true))"
        />

        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button quaternary type="primary" @click="activate(row)">
              <template #icon><n-icon :component="PowerOutline" /></template>
            </n-button>
          </template>
          {{ t('profiles_set_current') }}
        </n-tooltip>

        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button quaternary @click="openDetail(row)">
              <template #icon><n-icon :component="DetailIcon" /></template>
            </n-button>
          </template>
          {{ t('profiles_detail') }}
        </n-tooltip>

        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button quaternary type="error" @click="removeRow(index)">
              <template #icon><n-icon :component="DeleteIcon" /></template>
            </n-button>
          </template>
          {{ t('common_delete') }}
        </n-tooltip>
      </div>

      <n-empty v-if="drafts.length === 0" :description="t('profiles_empty')" style="padding: 40px 0" />
    </div>

    <!-- 详情弹窗 -->
    <ProfileDetailModal
      v-model:show="modalShow"
      :profile="modalProfile"
      @confirm="onDetailConfirm"
    />
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.toolbar-spacer {
  flex: 1;
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  transition: background 0.15s;
}

.row:hover {
  background: rgba(0, 95, 184, 0.035);
}

/* 校验不通过的行：红色描边提示 */
.row.invalid {
  border-color: rgba(196, 43, 28, 0.5);
  background: rgba(196, 43, 28, 0.04);
}

.row-icon {
  width: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 2.2;
  min-width: 240px;
}

.scheme {
  width: 112px;
  flex: none;
}

.host {
  flex: 1.4;
  min-width: 150px;
}

.port {
  width: 96px;
  flex: none;
}
</style>
