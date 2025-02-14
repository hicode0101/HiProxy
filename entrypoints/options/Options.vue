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
                    <n-tab-pane name="tabConfigs" :tab="browser.i18n.getMessage('options_tab_proxy_config')">

                        <n-dynamic-input v-model:value="proxyConfigList" :on-create="onCreateConfig">
                            <template #create-button-default>
                                {{ browser.i18n.getMessage('options_btn_addNew') }}
                            </template>
                            <template #default="{ value }">
                                <div style="display: flex; align-items: center; width: 90%;padding-left: 20px;">
                                    <n-button ghost v-model:color="value.color">
                                    <template #icon>
                                        <n-icon>
                                        <ChromeIcon />
                                        </n-icon>
                                    </template>
                                    </n-button>
                                    <n-color-picker v-model:value="value.color" :modes="['hex']" :show-alpha="false" :style="{ width: '90px',margin: '0 5px'  }" :actions="['confirm']" />
                                    <n-input v-model:value="value.name" @change="changeNameEvent(value,$event)" @keyup="keyUpNameEvent(value,$event)" type="text" :placeholder="browser.i18n.getMessage('options_msg_input_proxy_name_ph')"  :style="{ width: '33%',margin: '0 5px' }" />
                                    <n-select v-model:value="value.rules.singleProxy.scheme" :style="{ width: '120px',margin: '0 5px' }" :options="proxyTypeOptions" />
                                    
                                    
                                    <n-input v-model:value="value.rules.singleProxy.host" type="text" placeholder="host" :style="{ width: '300px',margin: '0 5px' }"/>
                                    <n-input-number v-model:value="value.rules.singleProxy.port" :show-button="false" :style="{ width: '150px',margin: '0 5px' }"/>
                                    
                                    <n-button tertiary type="info" @click="editDetail(value,$event)">
                                    <template #icon>
                                        <n-icon><DetailIcon /></n-icon>
                                    </template>
                                    </n-button>
    
                                </div>
                            </template>
                        </n-dynamic-input>

                        <n-divider />

                        <div class="btnBlock">
                            <n-space>
                                <n-button type="primary" @click="saveConfigs">
                                    {{ browser.i18n.getMessage('options_btn_save_all') }}
                                </n-button>
                                <n-button strong secondary type="error" @click="resetConfigs">
                                    {{ browser.i18n.getMessage('options_btn_reset') }}
                                </n-button>
                                
                            </n-space>
                        </div>


                    </n-tab-pane>
                    <n-tab-pane name="export" :tab="browser.i18n.getMessage('options_tab_export')">

                        <n-table >
                            <tbody>
                                <tr>
                                    <td colspan="2">
                                        <n-alert type="info">
                                            在这里您可以将当前的配置导出进行备份或分享，也可以在这里通过导入文件直接还原个性化的配置参数。
                                            {{ browser.i18n.getMessage('options_msg_export_tips') }}
                                        </n-alert>
                                    </td>
                                    
                                </tr>
                                <tr>
                                    <td>{{ browser.i18n.getMessage('options_msg_export_lbl') }}导出：</td>
                                    <td>
                                        
                                        <n-button type="info" @click="downloadConfigs">
                                            {{ browser.i18n.getMessage('options_msg_export_btn') }}导出当前配置
                                        </n-button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>{{ browser.i18n.getMessage('options_msg_import_lbl') }}导入：</td>
                                    <td>
                                        
                                        <input type="file" @change="handleFileInput" />
                                        <n-button type="warning" @click="importConfigs">
                                            {{ browser.i18n.getMessage('options_msg_import_btn') }}导入配置
                                        </n-button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>{{ browser.i18n.getMessage('options_msg_import_reset_lbl') }}重置：</td>
                                    <td>
                                        
                                        <n-button type="error" @click="resetConfigs">
                                            {{ browser.i18n.getMessage('options_msg_import_reset_btn') }}重置（还原到初始配置）
                                        </n-button>
                                    </td>
                                </tr>
                            </tbody>
                        </n-table>

                        

                    </n-tab-pane>
                    <n-tab-pane name="others" :tab="browser.i18n.getMessage('options_tab_others')">
                        <n-table >
                            <tbody>
                               
                                <tr>
                                    <td>{{ browser.i18n.getMessage('options_msg_others_uselastproxy_lbl') }}默认上一次代理：</td>
                                    <td>
                                        <n-switch v-model:value="useLastProxy" @update:value="useLastProxyChange" />
                                        {{ browser.i18n.getMessage('options_msg_others_uselastproxy_switch') }}（每次重新启动浏览器时，自动使用上一次使用的代理）
                                    </td>
                                </tr>
                            </tbody>
                        </n-table>

                    </n-tab-pane>
                    <n-tab-pane name="tabBypassDoc" :tab="browser.i18n.getMessage('options_tab_bypass_doc')">

                        <n-space vertical>
                            <n-table striped>
                                <thead>
                                <tr>
                                    <th>表达式</th>
                                    <th>说明</th>
                                </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>127.0.0.1</td>
                                        <td>
                                           http://127.0.0.1 的访问不会走代理 
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>localhost</td>
                                        <td>
                                           http://localhost 的访问不会走代理 
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>::1</td>
                                        <td>
                                           http://::1 的访问不会走代理（"::1"代表ipv6的本地回环地址）
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>192.168.1.0/24</td>
                                        <td>
                                            对主机范围 192.168.1.0~192.168.1.255 的访问不会走代理 
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>qq.com</td>
                                        <td>
                                            仅 http://qq.com 的访问不会走代理，其它二级域名的访问会走代理，例如 http://www.qq.com 的访问会走代理 
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>.qq.com</td>
                                        <td>
                                            qq.com 域名下所有二级域名不走代理，例如 http://aaa.qq.com 或 http://bbb.qq.com 的访问都不会走代理 
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>*.qq.com</td>
                                        <td>
                                            qq.com 域名下所有二级域名不走代理，例如 http://aaa.qq.com 或 http://bbb.qq.com 的访问都不会走代理（推荐）
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>*qq.com</td>
                                        <td>
                                           http://abc.qq.com 或 http://abcqq.com 的访问不会走代理 
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>login.qq.com</td>
                                        <td>
                                           http://login.qq.com 的访问不会走代理 
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>h.trace.qq.com</td>
                                        <td>
                                           http://h.trace.qq.com 的访问不会走代理 
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>官方文档</td>
                                        <td>
                                            <a href="https://developer.chrome.com/docs/extensions/reference/api/proxy#bypass_list" target="_blank">
                                            https://developer.chrome.com/docs/extensions/reference/api/proxy?hl=zh-cn#bypass_list
                                            </a>
                                        </td>
                                    </tr>
                                    
                                </tbody>
                            </n-table>
                        </n-space>
                        
                        
                    </n-tab-pane>
                    <n-tab-pane name="tabAbout" :tab="browser.i18n.getMessage('options_tab_about')">

                        <n-space vertical>
                            <n-table striped>
                                <tbody>
                                    <tr text="{{ browser.i18n.getMessage('options_tab_about') }}">
                                        <td>{{ browser.i18n.getMessage('options_about_project') }}：</td>
                                        <td>
                                            <a target="_blank"
                                                href="https://github.com/hicode0101/HiProxy">https://github.com/hicode0101/HiProxy</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>{{ browser.i18n.getMessage('options_about_version') }}：</td>
                                        <td>v{{ browser.runtime.getManifest().version }}</td>
                                    </tr>
                                    <tr>
                                        <td>{{ browser.i18n.getMessage('options_about_author') }}：</td>
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
                Copyright by <a href="https://github.com/hicode0101" target="_blank">hicode0101</a>
            </div>
        </n-gi>
    </n-grid>

    <n-modal v-model:show="showModal" preset="card" style="width: 600px; height: 550px;">
        <template #header>
        <div>
            
            <n-tag>
                {{ detailItem.name }}
            <template #icon>
                <n-icon :component="ChromeIcon" v-model:color="detailItem.color" />
            </template>
            </n-tag>
            
        </div>
        </template>
        <div>
            <n-table >
                <tbody>
                    <tr>
                        <td colspan="2">
                            <n-alert type="info">
                                {{ browser.i18n.getMessage('options_msg_input_detail_bypass') }}
                            </n-alert>
                        </td>
                        
                    </tr>
                    <tr>
                        <td>ByPassHost：</td>
                        <td>
                            
                            <n-input
                                v-model:value="detailBypassHost"
                                :placeholder="browser.i18n.getMessage('options_msg_input_detail_bypass_host_ph')" 
                                type="textarea"
                                :autosize="{
                                    minRows: 10,
                                    maxRows: 10,
                                }"  :style="{ width: '360px',margin: '0 5px' }"
                                />  
                        </td>
                    </tr>
                </tbody>
            </n-table>
            
            <n-table v-show="false">
                <tbody>
                    <tr>
                        <td colspan="2">
                            <n-alert type="info">
                                {{ browser.i18n.getMessage('options_msg_input_detail_auth') }}
                            </n-alert>
                        </td>
                        
                    </tr>
                    
                    <tr>
                        <td>UserName：</td>
                        <td>
                            <n-input v-model:value="tmpMsg" type="text" :placeholder="browser.i18n.getMessage('options_msg_input_detail_auth_username')" :style="{ width: '200px',margin: '0 5px' }" />
                        </td>
                    </tr>
                    <tr>
                        <td>PassWord：</td>
                        <td>
                            <n-input v-model:value="tmpMsg2" type="text" :placeholder="browser.i18n.getMessage('options_msg_input_detail_auth_password')" :style="{ width: '200px',margin: '0 5px' }" />
                        </td>
                    </tr>
                </tbody>
            </n-table>
            
        </div>
        <template #action>
        <div>
            
            <n-popover trigger="hover">
                <template #trigger>
                    <n-button strong secondary round type="info" @click="detailToList">
                        {{ browser.i18n.getMessage('options_btn_detail_ok') }}
                    </n-button>
                </template>
                <span>{{ browser.i18n.getMessage('options_btn_detail_ok_tips') }}</span>
            </n-popover>
        </div>
        </template>
    </n-modal>
  
</template>

<script lang="ts" setup>
import { defineComponent, h, reactive, ref } from 'vue'
import { useDialog, useMessage } from 'naive-ui'

import {
    LogoChrome as ChromeIcon
} from '@vicons/ionicons5'

import { AppsListDetail24Regular as DetailIcon } from '@vicons/fluent'
import { download } from 'naive-ui/es/_utils'
import type { UploadFileInfo } from 'naive-ui'

const message = useMessage()
const dialog = useDialog()

let proxyConfigList: any = ref([]);

let showModal = ref(false);
let detailItem = ref({});
let detailBypassHost = ref("");

let tmpMsg = ref("");
let tmpMsg2 = ref("");

let useLastProxy = ref(false);
let importContent = ref("");


let msgConfig = browser.i18n.getMessage('options_tab_proxy_config');

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
                scheme: "http",
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

let default_proxyType = 'http';
let proxyTypeOptions = ['http', 'https', 'socks4', 'socks5'].map(
        v => ({
          label: v.toUpperCase(),
          value: v
        })
      );


browser.storage.local.get(["useLastProxy"]).then((result : any)=>  {
    console.log("useLastProxy is ", result.useLastProxy);
    
    useLastProxy.value = result.useLastProxy
    
});

browser.storage.local.get(["proxyConfigs"]).then((result: any) => {
    
    console.log("GetValue is ", result);
    if (result.proxyConfigs == undefined) {
        console.log("GetValue is undefined");
        
    } else {
        //console.log("get storage:",result.proxyConfigs);
        let proxyConfigs = new Map(JSON.parse(result.proxyConfigs));
        console.log("map is ", proxyConfigs);
        proxyConfigs.forEach((proxyConfig, key) => {
            //console.log(key + " = " + proxyConfig);
            proxyConfigList.value.push(proxyConfig);
        });

        
    }
    
    

});   

async function saveConfigs() {
    //message.info("saveConfigs ...");

    //console.log(proxyConfigList.value);

    if(!checkForInput()){
        //message.error("输入参数不正确，请检查");
        return;
    }
    
    if(!checkForName()){
        message.error(browser.i18n.getMessage('options_msg_repeat_name'));
        return;
    }

    
    
    
    let proxyConfigsMap = new Map<string,any>();
    
    proxyConfigList.value.forEach((element: any) => {
        console.log(element.name);
        element.pid = element.name;
        proxyConfigsMap.set(element.pid, element);
        
    });
    
    let json = JSON.stringify(Array.from(proxyConfigsMap));
    console.log(json);
    
    await browser.storage.local.set({"proxyConfigs": json});

    
    //setTimeout(() => {refreshPage();},2000);

    openCurrProxy(()=>{});
    
    //message.success(browser.i18n.getMessage('options_msg_save_success'),{duration:2000, onAfterLeave: () => {refreshPage();}});
    message.success(browser.i18n.getMessage('options_msg_save_success'),{duration:2000, onAfterLeave: () => {}});
}

function resetConfigs() {
    //message.info("resetConfigs ...");
    
    dialog.error({
          title: browser.i18n.getMessage('options_msg_reset_dialog_title'),
          content: browser.i18n.getMessage('options_msg_reset_dialog_content'),
          positiveText: browser.i18n.getMessage('options_msg_reset_dialog_positiveText'),
          negativeText: browser.i18n.getMessage('options_msg_reset_dialog_negativeText'),
          maskClosable: false,
          onPositiveClick: () => {
            proxyConfigsInit();            
            refreshPage();
          },
          onMaskClick: () => {
            //message.warning('有个警告弹窗，您看到了吗')
          },
          onEsc: () => {
            //message.info('通过 esc 取消')
          }
        });
}

function refreshPage() {
  window.location.reload();
}

function editDetail(item : any, event : Event){
    showModal.value = true;
    
    console.log(item);
    detailItem.value = item;
    console.log(detailItem);
    
    detailBypassHost.value = item.rules.bypassList.join("\n");
}

function detailToList(){
    //console.log(detailBypassHost.value);
    let _pid = detailItem.value.pid;
    let _bypassList = detailBypassHost.value.split("\n");
    console.log(_pid, _bypassList);

    
    proxyConfigList.value.forEach((element: any) => {
        if (element.pid == _pid) {
            element.rules.bypassList = _bypassList;
        }
    });

    //console.log(proxyConfigList);
    
    //
    detailItem.value = {};
    detailBypassHost.value = "";
    
    showModal.value = false;
    
    
}

function keyUpNameEvent(item : any, event : Event){
    //message.info('[Event keyup]')
    console.log("keyup:",item.pid, item.name);
    

    
}

function changeNameEvent(item : any, event : Event){
    //message.info(`[Event change]: ${item.name}`)
    
    console.log("change:",item.pid, item.name);
    
    //console.log(checkForName());
    if(!checkForName()){
        message.error(browser.i18n.getMessage('options_msg_repeat_name'));
    }
}

function checkForName() {
    let result = true;
    proxyConfigList.value.forEach((elementA: any) => {
        let _name = elementA.name;
        let _pid = elementA.pid;
        let _count = 0;
        proxyConfigList.value.forEach((elementB: any) => {
        
            if (elementB.name == _name) {
                _count++;

                if (_count >= 2) {
                    
                    result = false;
                }
            }

            
        });
    });

    return result;
}

function checkForInput() {
    let result = true;
    proxyConfigList.value.forEach((elementA: any) => {
        console.log(elementA);
        if (elementA.name === null || elementA.name == "") {
            result = false;
            message.error(browser.i18n.getMessage('options_msg_input_name'));

        }

        if (elementA.rules.singleProxy.host === null || elementA.rules.singleProxy.host === '') {
            result = false;
            message.error(browser.i18n.getMessage('options_msg_input_host'));

        }

        if (elementA.rules.singleProxy.port === null || elementA.rules.singleProxy.port<0 || elementA.rules.singleProxy.port > 65535) {
            result = false;
            message.error(browser.i18n.getMessage('options_msg_input_port'));

        }

    });

    return result;
}

function useLastProxyChange(value: boolean){
    useLastProxySet(useLastProxy.value);
}

async function handleFileInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    try {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
            console.log('导入的配置:', content);
            importContent.value = content;
        }else{
            console.error('配置文件格式不正确');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('读取文件时出错:', error);
    }
  }
}

function importConfigs() {
    let content = importContent.value;
    try {
        const jsonObj = JSON.parse(content);
        useLastProxy.value = jsonObj.UseLastProxy;
        proxyConfigList.value = jsonObj.ProxyConfigs;

        useLastProxySet(jsonObj.UseLastProxy);
        saveConfigs();

    } catch (error) {
        console.error('解析文件内容时出错:', error);
    }
}

function downloadConfigs() {
    
    let configObj = {}
    configObj.Version = 319;
    configObj.UseLastProxy = useLastProxy.value;
    configObj.ProxyConfigs = proxyConfigList.value;

    const dataStr = JSON.stringify(configObj, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(dataBlob);
    downloadLink.download = 'HiProxyConfig.json';
    downloadLink.click();

    // 释放 URL 对象以节省内存
    URL.revokeObjectURL(downloadLink.href);

}

function downloadText(fileName :string, text :string) {
    //downloadText('test.txt', '测试');

    let url = window.URL || window.webkitURL || window;
    let blob = new Blob([text]);
    let saveLink = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
    saveLink.href = url.createObjectURL(blob);
    // 设置 download 属性
    saveLink.download = fileName;
    saveLink.click();
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
    margin: 0 5px;
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