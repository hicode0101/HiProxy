
document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('btn_open').addEventListener('click', (e) => {
        proxyConfigsInit();
        currProxyPidSet("socks5-10808");
        openCurrProxy();

    });

    document.getElementById('btn_direct').addEventListener('click', (e) => {
        directProxy();

    });

    document.getElementById('btn_system').addEventListener('click', (e) => {
        systemProxy();

    });

    //document.getElementById('btn_close').addEventListener('click', (e) => {
    //    closeProxy();
    //});

    //
    proxyConfigsInit();


});



function reDrawIcon(outColor, innerColor) {
    const canvas = new OffscreenCanvas(16, 16);
    const context = canvas.getContext('2d');
    context.scale(16, 16);
    context.clearRect(0, 0, 1, 1);
    //context.fillStyle = '#00FF00';
    //circleDraw(context, "#4477bb");
    //circleDraw(context, "#4477bb","#00FF00");
    circleDraw(context, outColor, innerColor);
    context.setTransform(1, 0, 0, 1, 0, 0);
    const imageData = context.getImageData(0, 0, 16, 16);
    chrome.action.setIcon({ imageData: imageData }, () => { /* ... */ });

}

function circleDraw(ctx, outerCircleColor, innerCircleColor) {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = outerCircleColor;
    ctx.beginPath();
    ctx.arc(0.5, 0.5, 0.5, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    if (innerCircleColor != null) {
        ctx.fillStyle = innerCircleColor;
    } else {
        ctx.globalCompositeOperation = "destination-out";
    }

    ctx.beginPath();
    ctx.arc(0.5, 0.5, 0.25, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

function closePopup() {
    window.close();
    // If the popup is opened as a tab, the above won't work. Let's reload then.
    document.body.style.opacity = 0;
    setTimeout(function () { history.go(0); }, 300);
}

async function openCurrProxy() {
    currProxyPid = await currProxyPidGet();
    console.log("currProxyPid", currProxyPid);

    proxyConfigsGetByCallback((result)=>{
        proxyConfigs = result.proxyConfigs;
        if (currProxyPid != undefined && proxyConfigsMap.has(currProxyPid) == true) {
            proxyConfig = proxyConfigsMap.get(currProxyPid);
            openProxy(proxyConfig);
        } else {
            directProxy();
        }
    });
    

}

function openProxy(proxyConfig) {
    //alert("openProxy");
    console.log("openProxy", proxyConfig);

    var _config = {
        mode: proxyConfig.mode,
        rules: proxyConfig.rules
    };

    chrome.proxy.settings.set({ value: _config, scope: 'regular' }, console.log("porxy switched"));

    showCurrProxy();
    reDrawIcon(proxyConfig.color);
    closePopup();

}

function closeProxy() {

    chrome.proxy.settings.clear({ scope: "regular" });

}

function directProxy() {

    chrome.proxy.settings.set({ value: { mode: "direct" }, scope: "regular" });

    showCurrProxy();
    reDrawIcon("#9b9b9b");
    closePopup();

}

function systemProxy() {

    chrome.proxy.settings.set({ value: { mode: "system" }, scope: "regular" });

    showCurrProxy();
    reDrawIcon("#000000");
    closePopup();

}

function showCurrProxy() {
    chrome.proxy.settings.get({ 'incognito': false }, function (config) {
        console.log(JSON.stringify(config));
    });
}




async function storageSet(jsonData) {
    console.log("storageSet", jsonData);
    //chrome.storage.local.set(jsonData).then(() => {
    //    console.log("Value is set");
    //});

    await chrome.storage.local.set(jsonData);

}

async function storageGet(keyName) {

    //_result = {};
    //await chrome.storage.local.get(keyName).then((result) => {
    //   console.log("storageGet is ", keyName, JSON.stringify(result));
    //   _result = result;
    //});

    const _result = await chrome.storage.local.get(keyName);
    console.log(_result);
    //console.log(_result.currProxyPid);

    return _result;
}

function storageRemove(keyName) {
    chrome.storage.local.remove(keyName).then(() => {
        console.log("Value removed");
    });
}

function storageClear() {
    chrome.storage.local.clear();
    console.log("storageClear");
}


async function currProxyPidGet() {
    
    const _result = await chrome.storage.local.get("currProxyPid");
    console.log(_result);
    //console.log(_result.currProxyPid);
    return _result.currProxyPid;
}

async function currProxyPidSet(currProxyPid) {
    await chrome.storage.local.set({"currProxyPid": currProxyPid});
    
}

function currProxyPidRemove() {
    chrome.storage.local.remove("currProxyPid");
}

async function proxyConfigsSet(proxyConfigsMap) {
    //proxyConfigsMap = new Map();
    json = JSON.stringify(Array.from(proxyConfigsMap));
    await chrome.storage.local.set({"proxyConfigs": json});
    console.log(proxyConfigsMap);
    //console.log(JSON.stringify(Array.from(proxyConfigsMap)));
}

async function proxyConfigsGet() {
    const _result = await chrome.storage.local.get("proxyConfigs");
    console.log(_result);
    console.log(_result.proxyConfigs);
    map = new Map(JSON.parse(_result.proxyConfigs));
    return map;
   
}

function proxyConfigsGetByCallback(callback) {
    chrome.storage.local.get(["proxyConfigs"]).then((result) => {
        console.log("Value is " + result);
        callback(result);
    });
   
}

function proxyConfigGet(pid) {

    proxyConfigsMap = proxyConfigsGet().proxyConfigs;
    if (proxyConfigsMap.has(pid) == true) {
        return proxyConfigsMap.get(pid);
    } else {
        return {}
    }
}

function proxyConfigSet(proxyConfig) {
    proxyConfigsMap = proxyConfigsGet().proxyConfigs;
    proxyConfigsMap.set(proxyConfig.pid, proxyConfig);

    proxyConfigsSet(proxyConfigsMap);
}

function proxyConfigCheckPid(pid) {
    proxyConfigsMap = proxyConfigsGet().proxyConfigs;
    return proxyConfigsMap.has(pid)
}


function proxyConfigCheckName(name) {
    proxyConfigsMap = proxyConfigsGet().proxyConfigs;
    proxyConfigsMap.forEach(function (value, key) {
        if (value.name == name) {
            return true;
        }
    });

    return false;
}

function proxyConfigsClear() {

    return storageRemove("proxyConfigs");
}

async function proxyConfigsInit() {
    console.log("proxyConfigsInit");

    //storageClear();

    proxyConfigsMap = new Map();

    proxyConfig = {
        pid: "http-8080",
        name: "http-8080",
        color: "#99dd99",
        mode: "fixed_servers",
        rules: {
            fallbackProxy: {
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
    };

    proxyConfigsMap.set(proxyConfig.pid, proxyConfig);

    proxyConfig = {
        pid: "socks5-1080",
        name: "socks5-1080",
        color: "#99dd99",
        mode: "fixed_servers",
        rules: {
            fallbackProxy: {
                scheme: "socks5",
                host: "127.0.0.1",
                port: 1080,
            },
            bypassList: [
                "127.0.0.1",
                "::1",
                "localhost"
            ]
        }
    };

    proxyConfigsMap.set(proxyConfig.pid, proxyConfig);

    proxyConfig = {
        pid: "socks5-10808",
        name: "socks5-10808",
        color: "#99dd99",
        mode: "fixed_servers",
        rules: {
            fallbackProxy: {
                scheme: "socks5",
                host: "127.0.0.1",
                port: 10808,
            },
            bypassList: [
                "127.0.0.1",
                "::1",
                "localhost"
            ]
        }
    };

    proxyConfigsMap.set(proxyConfig.pid, proxyConfig);


    proxyConfig = {
        pid: "burp-8080",
        name: "burp-8080",
        color: "#99dd99",
        mode: "fixed_servers",
        rules: {
            fallbackProxy: {
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
    };

    proxyConfigsMap.set(proxyConfig.pid, proxyConfig);


    await proxyConfigsSet(proxyConfigsMap);

    proxyConfigsMap = await proxyConfigsGet();
    console.log(proxyConfigsMap);

}



layui.use(function () {
    //var dropdown = layui.dropdown;
    var layer = layui.layer;
    var util = layui.util;

    //layui.off('click', 'dropdown');


});



