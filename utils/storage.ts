

export async function currProxyPidGet() {
    //localStorage.getItem('currProxyPid');
    //chrome.storage.local.get(["currProxyPid"]).then((result)=> {console.log("Value is ",result.currProxyPid);});
    
    const _result = await browser.storage.local.get("currProxyPid");
    console.log(_result);
    //console.log(_result.currProxyPid);
    return _result.currProxyPid;
}


export async function currProxyPidSet(currProxyPid: string) {
    //localStorage.setItem('currProxyPid', 'taven2');
    //chrome.storage.local.set({"currProxyPid":"system"}).then(()=> {console.log("Value is set");})

    await browser.storage.local.set({ "currProxyPid": currProxyPid });

}

export function currProxyPidRemove() {
    browser.storage.local.remove("currProxyPid");
}

export async function useLastProxyGet() {

    const _result = await browser.storage.local.get("useLastProxy");
    console.log(_result);
    //console.log(_result.useLastProxy);
    return _result.useLastProxy;
}


export async function useLastProxySet(useLastProxy: boolean) {

    await browser.storage.local.set({ "useLastProxy": useLastProxy });

}

export async function saveProxyConfigs(proxyConfigsMap : Map<string,any>){
    
    let json = JSON.stringify(Array.from(proxyConfigsMap));
    console.log(json);
    
    //localStorage.setItem("proxyConfigs", json);
    await browser.storage.local.set({"proxyConfigs": json});
    
}

export function getAllKeys() {
    //chrome.storage.local.getKeys().then((result)=> {console.log("Value is ",result);});
    browser.storage.local.getKeys().then((result : any)=> {console.log("Value is ",result);});
}

async function storageSet(jsonData : string) {
    console.log("storageSet", jsonData);
    //chrome.storage.local.set(jsonData).then(() => {
    //    console.log("Value is set");
    //});

    await browser.storage.local.set(jsonData);

}

async function storageGet(keyName : string) {

    //_result = {};
    //await chrome.storage.local.get(keyName).then((result) => {
    //   console.log("storageGet is ", keyName, JSON.stringify(result));
    //   _result = result;
    //});

    const _result = await browser.storage.local.get(keyName);
    console.log(_result);
    //console.log(_result.currProxyPid);

    return _result;
}
export function clearStorage() {
    //localStorage.clear();
    //chrome.storage.local.clear();
    browser.storage.local.clear();
    console.log("storageClear");
}

export function storageRemove(keyName : string) {
    browser.storage.local.remove(keyName).then(() => {
        console.log("Value removed");
    });
}




export async function proxyConfigsSet(proxyConfigsMap: Map<string, any>) {
    //proxyConfigsMap = new Map();
    let json = JSON.stringify(Array.from(proxyConfigsMap));
    await browser.storage.local.set({ "proxyConfigs": json });
    console.log(proxyConfigsMap);
    console.log(JSON.stringify(Array.from(proxyConfigsMap)));
}


async function proxyConfigsGet() {
    const _result = await browser.storage.local.get("proxyConfigs");
    console.log(_result);
    console.log(_result.proxyConfigs);
    let map = new Map(JSON.parse(_result.proxyConfigs));
    return map;
   
}

export function proxyConfigsGetByCallback(callback: Function) {
    browser.storage.local.get(["proxyConfigs"]).then((result: any) => {
        console.log("GetValue is ", result);
        if (result.proxyConfigs == undefined) {
            console.log("GetValue is undefined");
            callback(new Map());
        } else {
            let map = new Map(JSON.parse(result.proxyConfigs));
            console.log("map is ", map);
            callback(map);
        }

    });

}




export function getDefaultConfigs() {
    let proxyConfigsMap = new Map();

    let proxyConfig = {
        pid: "http-8080",
        name: "http-8080",
        color: "#4477bb",
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
    };

    proxyConfigsMap.set(proxyConfig.pid, proxyConfig);

    proxyConfig = {
        pid: "socks5-1080",
        name: "socks5-1080",
        color: "#8169ff",
        mode: "fixed_servers",
        rules: {
            singleProxy: {
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
        color: "#d497ee",
        mode: "fixed_servers",
        rules: {
            singleProxy: {
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
        pid: "socks5-7891",
        name: "socks5-7891",
        color: "#9117c5",
        mode: "fixed_servers",
        rules: {
            singleProxy: {
                scheme: "socks5",
                host: "127.0.0.1",
                port: 7891,
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
        pid: "http-7890",
        name: "http-7890",
        color: "#0b4da4",
        mode: "fixed_servers",
        rules: {
            singleProxy: {
                scheme: "http",
                host: "127.0.0.1",
                port: 7890,
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
        color: "#55bb55",
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
                ".google.com",
                ".google-analytics.com",
                ".googleapis.com",
                "mcs.volceapplog.com",
                "mssdk.bytedance.com",
                "mcs.zijieapi.com",
                "mon.zijieapi.com"
            ]
        }
    };

    proxyConfigsMap.set(proxyConfig.pid, proxyConfig);

    return proxyConfigsMap;
}

