document.addEventListener('DOMContentLoaded', () => {
    
    //chrome info
    console.log(new Date().toString());   

    console.debug(navigator.language);
    console.debug(window.navigator.appVersion);
    console.debug(chrome.runtime.getManifest());

    chrome.runtime.getPlatformInfo((platformInfo)=>{
        console.debug(JSON.stringify(platformInfo));
    
    });

});

