
<template>

  <n-loading-bar-provider>
    <n-message-provider>
      <n-notification-provider>
        <n-modal-provider>
          <n-dialog-provider>
            <Options/>
          </n-dialog-provider>
        </n-modal-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-loading-bar-provider>
  
  
  </template>
  
  <script lang="ts" setup>
  import Options from "./Options.vue"
  
  //const url = chrome.runtime.getURL('/background.js');
  //const url = browser.runtime.getURL('/background.js');
  //console.log(url);

  </script>
  
  <style scoped>
  
  </style>
  