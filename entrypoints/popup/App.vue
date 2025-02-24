
<template>

<n-loading-bar-provider>
  <n-message-provider>
    <n-notification-provider>
      <n-modal-provider>
        <n-dialog-provider>
          <Suspense>
          <Popup/>
          </Suspense>
        </n-dialog-provider>
      </n-modal-provider>
    </n-notification-provider>
  </n-message-provider>
</n-loading-bar-provider>


</template>

<script lang="ts" setup>
import Popup from "./Popup.vue"

</script>

<style scoped>
  body{
    background-color: #fdfdfd;
  }
</style>
