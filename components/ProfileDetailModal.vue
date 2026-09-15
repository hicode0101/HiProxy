<script setup lang="ts">
/**
 * 代理配置详情弹窗
 * 编辑两块内容：
 *  1. bypassList —— 不经过代理的主机列表（每行一个，支持通配符）
 *  2. 代理认证   —— HTTP/HTTPS 代理的用户名密码（SOCKS5 认证受 Chrome 限制，见提示）
 * 弹窗内部操作的是副本，点"确定"才通过 confirm 事件交回给列表。
 */
import { ref, watch } from 'vue';
import { NAlert, NButton, NInput, NModal, NSpace, NTable } from 'naive-ui';
import { t } from '@/utils/i18n';
import type { ProxyProfile } from '@/types';

const props = defineProps<{
  show: boolean;
  profile: ProxyProfile | null;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'confirm', profile: ProxyProfile): void;
}>();

const bypassText = ref('');
const username = ref('');
const password = ref('');

// 每次打开时从传入配置拷贝一份编辑副本
watch(
  () => props.show,
  (show) => {
    if (show && props.profile) {
      bypassText.value = props.profile.bypassList.join('\n');
      username.value = props.profile.auth?.username ?? '';
      password.value = props.profile.auth?.password ?? '';
    }
  },
);

function onConfirm() {
  if (!props.profile) return;
  const bypassList = bypassText.value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const auth = username.value || password.value
    ? { username: username.value, password: password.value }
    : undefined;

  emit('confirm', { ...props.profile, bypassList, auth });
  emit('update:show', false);
}
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    style="width: 640px"
    :title="profile?.name || t('tab_profiles')"
    @update:show="(v: boolean) => emit('update:show', v)"
  >
    <!-- bypass 主机列表 -->
    <n-alert type="info" :show-icon="true" style="margin-bottom: 12px">
      {{ t('detail_bypass_title') }}
    </n-alert>
    <n-input
      v-model:value="bypassText"
      type="textarea"
      :placeholder="t('detail_bypass_ph')"
      :autosize="{ minRows: 9, maxRows: 12 }"
      style="font-family: Consolas, monospace"
    />

    <!-- 代理认证 -->
    <n-alert type="warning" :show-icon="true" style="margin: 16px 0 12px">
      {{ t('detail_auth_title') }}
    </n-alert>
    <n-table :bordered="false" :single-line="false" size="small">
      <tbody>
        <tr>
          <td style="width: 110px">{{ t('detail_auth_username') }}</td>
          <td>
            <n-input v-model:value="username" :placeholder="t('detail_auth_username')" />
          </td>
        </tr>
        <tr>
          <td>{{ t('detail_auth_password') }}</td>
          <td>
            <n-input
              v-model:value="password"
              type="password"
              show-password-on="click"
              :placeholder="t('detail_auth_password')"
            />
          </td>
        </tr>
      </tbody>
    </n-table>

    <template #action>
      <n-space justify="end">
        <n-button @click="emit('update:show', false)">{{ t('common_cancel') }}</n-button>
        <n-button type="primary" @click="onConfirm">{{ t('detail_ok') }}</n-button>
      </n-space>
    </template>
  </n-modal>
</template>
