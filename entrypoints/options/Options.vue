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

                        <n-dynamic-input v-model:value="proxyConfigList" :on-create="onCreateConfig">
                            <template #create-button-default>
                                新增代理配置
                            </template>
                            <template #default="{ value }">
                                <div style="display: flex; align-items: center; width: 90%;padding-left: 20px;">
                                    <n-color-picker v-model:value="value.color" :modes="['hex']" :show-alpha="false" :style="{ width: '90px' }" />
                                    <n-input v-model:value="value.pname" type="text" placeholder="代理配置的名称，例如：http-8080，方便自己区分" :style="{ width: '33%' }" />
                                    <n-select v-model:value="value.scheme" :style="{ width: '120px' }" :options="proxyTypeOptions" />
                                    
                                    
                                    <n-input v-model:value="value.host" type="text" placeholder="host" :style="{ width: '300px' }"/>
                                    <n-input v-model:value="value.port" type="text" placeholder="port" :style="{ width: '150px' }"/>
                                </div>
                            </template>
                        </n-dynamic-input>

                        <n-divider />

                        <div class="btnBlock">
                            <n-space>
                                <n-button type="primary" @click="saveConfigs">
                                保存
                                </n-button>
                                <n-button strong secondary type="error" @click="resetConfigs">
                                重置
                                </n-button>
                            </n-space>
                        </div>


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
import { defineComponent, h, reactive, ref } from 'vue'
import { NIcon, useMessage } from 'naive-ui'

const message = useMessage()

function openPopup() {
    window.location.href = "./popup.html";
}

function openOptions() {
    window.location.href = "./options.html";
}



function onCreateConfig() {
    return {
        pname: 'http-8080',
        color: '#9F9F9F',
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

let proxyConfigList = ref([
    {
        pname: 'http-8080',
        color: '#9F9F9F',
        scheme: "HTTP",
        host: "127.0.0.1",
        port: "8080"
    }
]);


browser.storage.local.get(["proxyConfigs"]).then((result: any) => {
    console.log("renderProxyConfigList-1", proxyConfigList);
    console.log("GetValue is ", result);
    if (result.proxyConfigs == undefined) {
        console.log("GetValue is undefined");
        
    } else {
        let proxyConfigs = new Map(JSON.parse(result.proxyConfigs));
        console.log("map is ", proxyConfigs);
        proxyConfigs.forEach((proxyConfig, key) => {
            console.log(key + " = " + proxyConfig);
            proxyConfigList.value.push({
                pname: proxyConfig.pid,
                color: proxyConfig.color,
                scheme: proxyConfig.rules.singleProxy.scheme.toUpperCase(),
                host: proxyConfig.rules.singleProxy.host,
                port: proxyConfig.rules.singleProxy.port.toString()
            });
        });

        
    }
    
    

});   

function saveConfigs() {
    message.info("功能继续完善中...");
}

function resetConfigs() {
    message.info("reset 功能继续完善中...");
}

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

.btnBlock {
    height: 80px;
    place-items: center;
}

.bottomBlock {
    height: 50px;
    background-color: rgba(174, 176, 174, 0.12);
    text-align: center;
    padding-top: 20px;
}
</style>