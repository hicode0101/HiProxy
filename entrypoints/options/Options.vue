<template>

    <n-grid x-gap="12" :cols="1">
        <n-gi>
            <div class="topBlock">
                <h1>{{ browser.i18n.getMessage('plugin_name') }}</h1>
            </div>
        </n-gi>
        <n-gi>
            <div class="bodyBlock">
                <n-tabs :bar-width="28" type="line" class="custom-tabs">
                    <n-tab-pane name="tabConfigs" tab="Proxy Configs">

                        <n-dynamic-input v-model:value="customValue" :on-create="onCreate">
                            <template #create-button-default>
                                随便搞点啥
                            </template>
                            <template #default="{ value }">
                                <div style="display: flex; align-items: center; width: 90%;padding-left: 20px;">
                                    
                                    <n-input v-model:value="value.pname" type="text" :style="{ width: '33%' }" />
                                    <n-select v-model:value="value.scheme" :style="{ width: '120px' }" :options="proxyTypeOptions" />
                                    
                                    
                                    <n-input v-model:value="value.host" type="text" :style="{ width: '300px' }"/>
                                    <n-input v-model:value="value.port" type="text" :style="{ width: '150px' }"/>
                                </div>
                            </template>
                        </n-dynamic-input>

                    </n-tab-pane>
                    <n-tab-pane name="tabAbout" tab="About">

                        <n-space vertical>
                            <n-table striped>
                                <tbody>
                                    <tr>
                                        <td>Project：</td>
                                        <td><a target="_blank"
                                                href="https://github.com/hicode0101/HiProxy">https://github.com/hicode0101/HiProxy</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Version：</td>
                                        <td>v3.1.0</td>
                                    </tr>
                                    <tr>
                                        <td>Author：</td>
                                        <td>hicode0101</td>
                                    </tr>

                                </tbody>
                            </n-table>
                        </n-space>

                    </n-tab-pane>
                </n-tabs>
            </div>
        </n-gi>
        <n-gi>
            <div class="bottomBlock">
                Copyright by hicode0101
            </div>
        </n-gi>
    </n-grid>

</template>

<script lang="ts" setup>

function openPopup() {
    window.location.href = "./popup.html";
}

function openOptions() {
    window.location.href = "./options.html";
}

let customValue = ref([
    {
        pname: 'http-8080',
        scheme: "HTTP",
        host: "127.0.0.1",
        port: "8080"
    }
]);

function onCreate() {
    return {
        pname: 'http-8080',
        scheme: "HTTP",
        host: "127.0.0.1",
        port: "8080"
        
    }
}

let default_proxyType = 'HTTP';
let proxyTypeOptions = ['HTTP', 'HTTPS', 'SOCKS4', 'SOCKS5'].map(
        v => ({
          label: v,
          value: v
        })
      );

      

</script>

<style scoped>
.topBlock {
    height: 80px;
    background-color: rgba(139, 141, 139, 0.12);

}

.bodyBlock {

    background-color: rgba(244, 244, 244, 0.24);
    min-height: 60vh;
}

.bottomBlock {
    height: 50px;
    background-color: rgba(174, 176, 174, 0.12);
    text-align: center;
    padding-top: 20px;
}
</style>