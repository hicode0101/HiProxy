
document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('btn_open').addEventListener('click', (e) => {
        openProxy();
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

    
    

});


function openProxy(){
    //alert(2222);
    console.log("log-openProxy");


    var config = {
        mode: "fixed_servers",
        rules: {
            fallbackProxy: {
                scheme: "socks5",
                host: "127.0.0.1",
                port: 10808,
            },
            bypassList: [
                "127.0.0.1", 
                "foobar.com"
            ]
        }
    };
    
    chrome.proxy.settings.set({value: config, scope: 'regular'}, console.log("代理设置完成"));

    getCurrProxy();

}

function closeProxy(){

    chrome.proxy.settings.clear({ scope: "regular" });

}

function directProxy(){

    chrome.proxy.settings.set({ value: {mode: "direct"}, scope: "regular" });

    getCurrProxy();

}

function systemProxy(){

    chrome.proxy.settings.set({ value: {mode: "system"}, scope: "regular" });

    getCurrProxy();

}

function getCurrProxy(){
    chrome.proxy.settings.get({'incognito': false}, function(config) {
        console.log(JSON.stringify(config));
    });
}



layui.use(function(){
    //var dropdown = layui.dropdown;
    var layer = layui.layer;
    var util = layui.util;

    //layui.off('click', 'dropdown');

    
});