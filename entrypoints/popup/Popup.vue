<template>

    <n-menu :options="menuOptions" @update:value="onMenuChange" />


</template>

<script lang="ts" setup>

import type { Component } from 'vue'
import { defineComponent, h, reactive } from 'vue'
import { NIcon, useMessage } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import { RouterLink } from 'vue-router'
import {
    LogoChrome as ChromeIcon,
    LogoWindows as SystemIcon,
    SettingsOutline as OptionsIcon,
    PersonCircleOutline as NetWorkIcon
} from '@vicons/ionicons5'

import { ArrowSwap24Filled as DirectIcon } from '@vicons/fluent'

const message = useMessage()

let menuOptions: MenuOption[] = reactive([]);


menuOptions.push({
    label: browser.i18n.getMessage('pop_menu_direct'),
    key: 'pop-menu-Direct',
    icon: renderColorIcon(DirectIcon, "#9b9b9b")
});

menuOptions.push({
    label: browser.i18n.getMessage('pop_menu_system'),
    key: 'pop-menu-System',
    icon: renderIcon(SystemIcon)
});

menuOptions.push({
    key: 'divider-top',
    type: 'divider',
    props: {
        style: {
            marginLeft: '32px'
        }
    }
});


browser.storage.local.get(["proxyConfigs"]).then((result: any) => {
    
    console.log("GetValue is ", result);
    if (result.proxyConfigs == undefined) {
        console.log("GetValue is undefined");
        
    } else {
        let proxyConfigs = new Map(JSON.parse(result.proxyConfigs));
        console.log("map is ", proxyConfigs);
        proxyConfigs.forEach((proxyConfig, key) => {
            console.log(key + " = " + proxyConfig);
            menuOptions.push({
                label: proxyConfig.pid,
                key: proxyConfig.pid,
                icon: renderColorIcon(ChromeIcon, proxyConfig.color)
            });
        });

        menuOptions.push({
            key: 'divider-bottom',
            type: 'divider',
            props: {
                style: {
                    marginLeft: '32px'
                }
            }
        });

        menuOptions.push({
            label: browser.i18n.getMessage('pop_menu_options'),
            key: 'pop-menu-Options',
            icon: renderIcon(OptionsIcon),
        });

        menuOptions.push({
            label: browser.i18n.getMessage('pop_menu_myip'),
            key: 'pop-menu-MyIp',
            icon: renderIcon(NetWorkIcon),
        });
        
    }
    
    

});




function renderIcon(icon: Component) {
    return () => h(NIcon, null, { default: () => h(icon) })
}

function renderColorIcon(icon: Component, colorCode: string) {
    return () => h(NIcon, { color: colorCode }, { default: () => h(icon) })
}

function onMenuChange(key: string, item: MenuOption) {
    switch(key){
        case "pop-menu-Direct":
            directProxy();
            break;
        case "pop-menu-System":
            systemProxy();
            break;
        case "pop-menu-Options":
            openOptions();
            break;
        case "pop-menu-MyIp":
            queryMyIp();
            break;
        default:
            console.log("^_^");
            onChangeProxy(key, item);
    }
    
    //closePopup();
}

function closePopup1() {
    //do nothing for testing
}

function closePopup() {
    
    window.close();
    
    // If the popup is opened as a tab, the above won't work. Let's reload then.
    document.body.style.opacity = "0";
    setTimeout(function () { history.go(0); }, 300);
}

function openOptions() {
    //chrome.tabs.create({url: "/options.html"});
    browser.tabs.create({ url: "/options.html" });

}

function openOptions2() {
    window.location.href = "./options.html";

}

function queryMyIp() {
    //https://www.ip138.com
    browser.tabs.create({ url: "https://ip.hicode.top" });

}


async function onChangeProxy(key: string, item: MenuOption) {

    currProxyPidSet(key);
    openCurrProxy();
    
}


async function renderProxyConfigList(callback: Function) {
    
    proxyConfigsGetByCallback((result: Map<string,any>)=>{
        let proxyConfigs = result;
        if(proxyConfigs instanceof Map){
            proxyConfigs.forEach((value, key) => {
                console.log(key + " = " + value);
                callback(value);
            });
        }else{
            console.error("proxyConfigs is not a map");
            directProxy();
        }
        
    });
}


console.log("setup end");
</script>

<style scoped></style>