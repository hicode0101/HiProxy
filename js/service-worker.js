
chrome.runtime.onInstalled.addListener((e) => {
    console.log("onInstalled");
    //console.info("onInstalled");
    console.debug(JSON.stringify(e));

    if (e.reason === 'install') {
        //proxyConfigsInit();
        chrome.tabs.create({url: "ui/options.html"});  
    }


});


chrome.proxy.onProxyError.addListener(function (details) {
    console.error(JSON.stringify(details));
});

chrome.runtime.onStartup.addListener((event) => {
    console.log("onStartup");
});

chrome.runtime.getPlatformInfo((platformInfo) => {
    console.debug(new Date().toString());
    console.debug(JSON.stringify(platformInfo));

});


chrome.action.onClicked.addListener((tab) => {
    console.log("action clicked", JSON.stringify(tab));

});

function workerFuc() {
    
    console.log("workerFuc");

}



