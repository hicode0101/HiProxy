
chrome.runtime.onInstalled.addListener((_reason) => {
    console.debug("onInstalled");
    //console.info("onInstalled");
    console.log(JSON.stringify(_reason));
    

    
});


chrome.proxy.onProxyError.addListener(function(details) {
    console.error(JSON.stringify(details));
});

chrome.runtime.onStartup.addListener((event) => {
    console.debug("onStartup");
});

chrome.runtime.getPlatformInfo((platformInfo)=>{
    console.debug(new Date().toString());
    console.debug(JSON.stringify(platformInfo));

});




