<template>

    <n-menu :options="menuOptions" @update:value="onMenuChange" />


</template>

<script lang="ts" setup>

import type { Component } from 'vue'
import { defineComponent, h } from 'vue'
import { NIcon, useMessage } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import { RouterLink } from 'vue-router'
import {
    HomeOutline as HomeIcon,
    PersonOutline as PersonIcon,
    LogoChrome as ChromeIcon,
    LogoWindows as SystemIcon,
    SettingsOutline as OptionsIcon
} from '@vicons/ionicons5'

import { ArrowSwap24Filled as DirectIcon } from '@vicons/fluent'
import { MdAnalytics } from '@vicons/ionicons4'

const message = useMessage()

const menuOptions: MenuOption[] = []


menuOptions.push({
    label: 'Direct',
    key: 'pop-menu-Direct',
    icon: renderIcon(DirectIcon)
});

menuOptions.push({
    label: 'System',
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


menuOptions.push({
    label: 'burp-8080',
    key: 'pop-menu-8080',
    icon: renderColorIcon(ChromeIcon, "#8a2be2")
});

menuOptions.push({
    label: '1234567890123456789',
    key: 'pop-menu-8081',
    icon: renderColorIcon(ChromeIcon, "#55bb55")
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
    label: 'Options',
    key: 'pop-menu-Options',
    icon: renderIcon(OptionsIcon),
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
        default:
            console.log("^_^");
            changeProxy(key, item);
    }
    
    closePopup();
}

function openOptions() {
    //chrome.tabs.create({url: "/options.html"});
    browser.tabs.create({ url: "/options.html" });

}

function openOptions2() {
    window.location.href = "./options.html";

}

function directProxy() {

    browser.proxy.settings.set({ value: { mode: "direct" }, scope: "regular" });

    showCurrProxy();
    reDrawIcon("#9b9b9b", "");
    closePopup();

}

function systemProxy() {

    browser.proxy.settings.set({ value: { mode: "system" }, scope: "regular" });

    showCurrProxy();
    reDrawIcon("#000000", "");
    closePopup();

}

function onChangeProxy(key: string, item: MenuOption) {

    
}

function changeProxy1() {
    browser.proxy.settings.set({
        value: {
            mode: "fixed_servers",
            rules: {
                singleProxy: {
                    scheme: "http",
                    host: "127.0.0.1",
                    port: 8080
                }
            }
        },
        scope: "regular"
    }, function (result: any) {
        console.log(result);
    });
}

function closePopup() {
    window.close();
    // If the popup is opened as a tab, the above won't work. Let's reload then.
    document.body.style.opacity = "0";
    setTimeout(function () { history.go(0); }, 300);
}

function showCurrProxy() {
    browser.proxy.settings.get({ 'incognito': false }, function (config: any) {
        console.log(JSON.stringify(config));
    });
}

function reDrawIcon(outColor: string, innerColor: string) {
    console.log(outColor, innerColor);

    const canvas = new OffscreenCanvas(16, 16);
    const context = canvas.getContext('2d');
    if (!context) {
        console.error('Failed to get 2D rendering context');
        return;
    }
    context.scale(16, 16);
    context.clearRect(0, 0, 1, 1);
    //context.fillStyle = '#00FF00';
    //circleDraw(context, "#4477bb");
    //circleDraw(context, "#4477bb","#00FF00");
    circleDraw(context, outColor, innerColor);
    context.setTransform(1, 0, 0, 1, 0, 0);
    const imageData = context.getImageData(0, 0, 16, 16);
    //chrome.action.setIcon({ imageData: imageData }, () => { /* ... */ });
    browser.action.setIcon({ imageData: imageData }, () => { /* ... */ });

}

function circleDraw(ctx: OffscreenCanvasRenderingContext2D, outerCircleColor: string, innerCircleColor: string) {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = outerCircleColor;
    ctx.beginPath();
    ctx.arc(0.5, 0.5, 0.5, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    if (innerCircleColor != null && innerCircleColor != "") {
        ctx.fillStyle = innerCircleColor;
    } else {
        ctx.globalCompositeOperation = "destination-out";
    }

    ctx.beginPath();
    ctx.arc(0.5, 0.5, 0.25, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}



async function currProxyPidSet(currProxyPid: string) {
    await browser.storage.local.set({"currProxyPid": currProxyPid});
    
}

function currProxyPidRemove() {
    browser.storage.local.remove("currProxyPid");
}

async function currProxyPidGet() {
    
    const _result = await browser.storage.local.get("currProxyPid");
    console.log(_result);
    //console.log(_result.currProxyPid);
    return _result.currProxyPid;
}

async function openCurrProxy() {
    let currProxyPid = await currProxyPidGet();
    console.log("currProxyPid", currProxyPid);

    proxyConfigsGetByCallback((result: Map<string,any>)=>{
        let proxyConfigs = result;
        if(proxyConfigs instanceof Map){
            if (currProxyPid != undefined && proxyConfigs.has(currProxyPid) == true) {
                let proxyConfig = proxyConfigs.get(currProxyPid);
                changeProxy(proxyConfig);
            } else {
                directProxy();
            }
        }else{
            console.error("proxyConfigs is not a map");
            directProxy();
        }
        
    });
    

}

function changeProxy(proxyConfig: any) {

    var _config = {
        mode: proxyConfig.mode,
        rules: proxyConfig.rules
    };

    console.log("proxy.settings.set", _config);
    browser.proxy.settings.set({ value: _config, scope: 'regular' }, console.log("porxy switched"));


    reDrawIcon(proxyConfig.color, "");
    showCurrProxy();
}

function proxyConfigsGetByCallback(callback:Function) {
    browser.storage.local.get(["proxyConfigs"]).then((result:any) => {
        console.log("GetValue is ", result);
        if(result.proxyConfigs == undefined){
            console.log("GetValue is undefined");
            callback(new Map());
        }else{
            let map = new Map(JSON.parse(result.proxyConfigs));
            console.log("map is ", map);
            callback(map);
        }
        
    });
   
}


</script>

<style scoped></style>