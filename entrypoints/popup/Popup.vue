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
        case "pop-menu-Options":
            openOptions();
            break;
        default:
            console.log("^_^");
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

function closePopup() {
    window.close();
    // If the popup is opened as a tab, the above won't work. Let's reload then.
    document.body.style.opacity = "0";
    setTimeout(function () { history.go(0); }, 300);
}

</script>

<style scoped></style>