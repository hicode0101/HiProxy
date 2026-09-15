<script setup lang="ts">
/**
 * 自动切换 Tab
 * - 规则列表：域名表达式 → 目标（直连 / 某个代理配置），按顺序匹配、先命中先生效
 * - 修改即时保存（防抖 400ms），启用方式：popup 或代理配置中把模式切到"自动切换"
 */
import { computed, ref, watch } from 'vue';
import { NAlert, NButton, NEmpty, NIcon, NInput, NSelect, NSpace } from 'naive-ui';
import { Add24Regular as AddIcon } from '@vicons/fluent';
import { Delete24Regular as DeleteIcon } from '@vicons/fluent';
import { ArrowRight24Regular as ArrowIcon } from '@vicons/fluent';

import { useConfig } from '@/composables/useConfig';
import { emptyAutoRule } from '@/utils/config/defaults';
import { deepClone } from '@/utils/object';
import { t } from '@/utils/i18n';
import type { AutoSwitchRule, RuleTarget } from '@/types';

const { config, update } = useConfig();

/** 本地编辑副本 */
const rules = ref<AutoSwitchRule[]>([]);
const fallback = ref<RuleTarget>('direct');

/** 目标下拉选项：直连 + 全部代理配置 */
const targetOptions = computed(() => [
  { label: t('auto_target_direct'), value: 'direct' },
  ...(config.value?.profiles ?? []).map((p) => ({
    label: `${p.name}（${p.scheme.toUpperCase()} ${p.host}:${p.port}）`,
    value: p.id,
  })),
]);

// 首次加载时同步；保存进行中（pending）时跳过外部同步，避免覆盖输入
let pending = false;
watch(
  config,
  (cfg) => {
    if (cfg && !pending) {
      rules.value = deepClone(cfg.autoRules);
      fallback.value = cfg.autoFallback;
    }
  },
  { immediate: true },
);

let saveTimer: ReturnType<typeof setTimeout> | undefined;

/** 规则变更 → 防抖保存（空 pattern 的行不落盘，但保留在界面上方便继续输入） */
function scheduleSave() {
  pending = true;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    await update((d) => {
      d.autoRules = rules.value
        .filter((r) => r.pattern.trim())
        .map((r) => ({ ...r, pattern: r.pattern.trim() }));
      d.autoFallback = fallback.value;
    });
    pending = false;
  }, 400);
}

function addRule() {
  rules.value.push(emptyAutoRule());
  scheduleSave();
}

function removeRule(index: number) {
  rules.value.splice(index, 1);
  scheduleSave();
}
</script>

<template>
  <div>
    <n-alert type="info" style="margin-bottom: 14px">
      {{ t('auto_desc') }}
    </n-alert>

    <!-- 默认走向 -->
    <div class="fallback-bar">
      <span class="label">{{ t('auto_fallback') }}</span>
      <n-select
        v-model:value="fallback"
        :options="targetOptions"
        :consistent-menu-width="false"
        style="width: 320px"
        @update:value="scheduleSave"
      />
      <span class="hint">{{ t('auto_hint') }}</span>
    </div>

    <!-- 规则列表 -->
    <div class="rules">
      <div v-for="(rule, index) in rules" :key="rule.id" class="rule-row">
        <n-input
          v-model:value="rule.pattern"
          :placeholder="t('auto_pattern_ph')"
          style="flex: 1"
          @update:value="scheduleSave"
        />
        <n-icon :component="ArrowIcon" size="18" color="#8a8a8a" />
        <n-select
          v-model:value="rule.target"
          :options="targetOptions"
          :consistent-menu-width="false"
          style="width: 340px"
          @update:value="scheduleSave"
        />
        <n-button quaternary type="error" @click="removeRule(index)">
          <template #icon><n-icon :component="DeleteIcon" /></template>
        </n-button>
      </div>

      <n-empty
        v-if="rules.length === 0"
        :description="t('auto_empty')"
        style="padding: 36px 0"
      />
    </div>

    <n-space style="margin-top: 14px">
      <n-button type="primary" secondary @click="addRule">
        <template #icon><n-icon :component="AddIcon" /></template>
        {{ t('auto_add_rule') }}
      </n-button>
    </n-space>

    <n-alert type="default" :show-icon="false" style="margin-top: 14px">
      {{ t('auto_enable_hint') }}
    </n-alert>
  </div>
</template>

<style scoped>
.fallback-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.fallback-bar .label {
  font-weight: 600;
}

.fallback-bar .hint {
  font-size: 12px;
  color: #8a8a8a;
}

.rules {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rule-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: background 0.15s;
}

.rule-row:hover {
  background: rgba(0, 95, 184, 0.035);
}
</style>
