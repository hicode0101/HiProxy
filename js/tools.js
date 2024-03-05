document.addEventListener('DOMContentLoaded', () => {
    
    //chrome info
    console.log(new Date().toString());   

    console.debug(navigator.language);
    console.debug(window.navigator.appVersion);
    console.debug(chrome.runtime.getManifest());

    chrome.runtime.getPlatformInfo((platformInfo)=>{
        console.debug(JSON.stringify(platformInfo));
    
    });

    chrome.proxy.settings.get({'incognito': false}, function(config) {
        console.log(JSON.stringify(config));
    });

    document.getElementById('btn_testCSP').addEventListener('click', (e) => {
        TestCSP();
    });

    

});


function TestCSP(){

        /**
     * 
     * Uncaught EvalError: Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source of script in the following Content Security Policy directive: "script-src 'self'".
     * 
     */
    
        obj = document.getElementById("btn_testCSP").attributes["lay-options"]
        console.log(obj);

        attrValue = obj.value
        console.log(attrValue);

        //触发异常，CSP错误，且Chrome MV3版本不允许更改 CSP
        var sss = new Function('return '+ (attrValue || '{}'))();

        //
        console.log(eval("alert('Hello world')"));

}















