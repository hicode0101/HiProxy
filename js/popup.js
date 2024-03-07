
document.addEventListener('DOMContentLoaded', () => {

    // document.getElementById('btn_open').addEventListener('click', (e) => {

    //     //testProxy();

    //     //proxyConfigsInit();
    //     currProxyPidSet("socks5-10808");
    //     openCurrProxy();
        

    // });

    document.getElementById('btn_direct').addEventListener('click', (e) => {
        directProxy();

    });

    document.getElementById('btn_system').addEventListener('click', (e) => {
        systemProxy();

    });

    //document.getElementById('btn_close').addEventListener('click', (e) => {
    //    closeProxy();
    //});

    document.getElementById('btn_options').addEventListener('click', (e) => {
        chrome.tabs.create({url: "ui/options.html"});

    });

    

    //
    proxyConfigsInit();
    

    //defaultProxy = chrome.runtime.getURL('js/defaultProxy.json');
    //console.log(json);


});



async function openCurrProxy() {
    currProxyPid = await currProxyPidGet();
    console.log("currProxyPid", currProxyPid);

    proxyConfigsGetByCallback((result)=>{
        proxyConfigs = result;
        if(proxyConfigs instanceof Map){
            if (currProxyPid != undefined && proxyConfigs.has(currProxyPid) == true) {
                proxyConfig = proxyConfigs.get(currProxyPid);
                openProxy(proxyConfig);
            } else {
                directProxy();
            }
        }else{
            console.error("proxyConfigs is not a map");
            directProxy();
        }
        
    });
    

}

function testProxy(){
    //alert(2222);
    console.log("testProxy");


    var config = {
        mode: "fixed_servers",
        rules: {
            fallbackProxy : {
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

    // var config = {
    //     mode: "fixed_servers",
    //     rules: {
    //         singleProxy : {
    //             scheme: "http",
    //             host: "127.0.0.1",
    //             port: 8080,
    //         },
    //         bypassList: [
    //             "127.0.0.1",
    //             "::1",
    //             "localhost"
    //         ]
    //     }
    // };
    
    chrome.proxy.settings.set({value: config, scope: 'regular'}, console.log("porxy switched"));

    showCurrProxy();
    reDrawIcon("#ff0000");
    closePopup();

}


function openProxy(proxyConfig) {

    console.log("openProxy", proxyConfig);

    var _config = {
        mode: proxyConfig.mode,
        rules: proxyConfig.rules
    };

    console.log("proxy.settings.set", _config);
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



layui.use(function () {
    //var dropdown = layui.dropdown;
    var layer = layui.layer;
    var util = layui.util;
    var laytpl = layui.laytpl;

    //layui.off('click', 'dropdown');
    
    util.on('lay-on', {
        open: layui.throttle(function(othis) {
            //testProxy();

            //console.log(this);
            console.log(othis.attr("pid"));
            //layer.tips(othis.html(), this);
            pid = othis.attr("pid");
            currProxyPidSet(pid);
            openCurrProxy();

        }, 10) // 多少毫秒内不重复执行
      }, {
        trigger: 'click'
      }
    );

});



