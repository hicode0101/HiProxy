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
                                    <n-input v-model:value="value.name" type="text" placeholder="代理配置的名称，例如：http-8080，方便自己区分" :style="{ width: '33%' }" />
                                    <n-select v-model:value="value.rules.singleProxy.scheme" :style="{ width: '120px' }" :options="proxyTypeOptions" />
                                    
                                    
                                    <n-input v-model:value="value.rules.singleProxy.host" type="text" placeholder="host" :style="{ width: '300px' }"/>
                                    <n-input-number v-model:value="value.rules.singleProxy.port" :show-button="false" :style="{ width: '150px' }"/>
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
import { useDialog, useMessage } from 'naive-ui'

const message = useMessage()
const dialog = useDialog()

function openPopup() {
    window.location.href = "./popup.html";
}

function openOptions() {
    window.location.href = "./options.html";
}



function onCreateConfig() {
    return {
        pid: "",
        name: "",
        color: "#B9B9B9",
        mode: "fixed_servers",
        rules: {
            singleProxy: {
                scheme: "HTTP",
                host: "127.0.0.1",
                port: 8080,
            },
            bypassList: [
                "127.0.0.1",
                "::1",
                "localhost"
            ]
        }
        
    }
}

let default_proxyType = 'HTTP';
let proxyTypeOptions = ['HTTP', 'HTTPS', 'SOCKS4', 'SOCKS5'].map(
        v => ({
          label: v,
          value: v
        })
      );

let proxyConfigList: any = ref([]);


browser.storage.local.get(["proxyConfigs"]).then((result: any) => {
    
    console.log("GetValue is ", result);
    if (result.proxyConfigs == undefined) {
        console.log("GetValue is undefined");
        
    } else {
        console.log("get storage:",result.proxyConfigs);
        let proxyConfigs = new Map(JSON.parse(result.proxyConfigs));
        console.log("map is ", proxyConfigs);
        proxyConfigs.forEach((proxyConfig, key) => {
            console.log(key + " = " + proxyConfig);
            proxyConfigList.value.push(proxyConfig);
        });

        
    }
    
    

});   

async function saveConfigs() {
    //message.info("saveConfigs ...");

    //console.log(proxyConfigList.value);
    
    let proxyConfigsMap = new Map<string,any>();
    
    proxyConfigList.value.forEach((element: any) => {
        console.log(element.name);
        element.pid = element.name;
        proxyConfigsMap.set(element.pid, element);
        
    });
    
    let json = JSON.stringify(Array.from(proxyConfigsMap));
    
    await browser.storage.local.set({"proxyConfigs": json});

    
    //setTimeout(() => {refreshPage();},2000);

    message.success('保存成功',{duration:2000, onAfterLeave: () => {refreshPage();}});
    
}

function resetConfigs() {
    //message.info("resetConfigs ...");
    
    dialog.warning({
          title: '操作警告',
          content: '您确定要重置全部配置吗？',
          positiveText: '确定重置',
          negativeText: '取消',
          maskClosable: false,
          onPositiveClick: () => {
            proxyConfigsInit();            
            refreshPage();
          },
          onMaskClick: () => {
            message.warning('有个警告弹窗，您看到了吗')
          },
          onEsc: () => {
            message.info('通过 esc 取消')
          }
        });
}

function refreshPage() {
  window.location.reload();
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