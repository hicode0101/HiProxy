
document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('btn_config_save').addEventListener('click', (e) => {
        
        proxyConfigsSave();

    });

    document.getElementById('btn_config_reset').addEventListener('click', (e) => {
        
        proxyConfigsInit();

    });

    document.getElementById('btn_config_clear').addEventListener('click', (e) => {
        
        storageClear();

    });

    document.getElementById('btn_config_current').addEventListener('click', (e) => {

        

        currProxyPidGetByCallback((result)=>{
            console.log("currProxyPid", result);
        });

        proxyConfigsGetByCallback((result)=>{
            console.log("current proxyConfigs", result);
            json = JSON.stringify(Array.from(result));
            document.getElementById('txt_input').value= json;
        });

        showCurrProxy();

    });

});

















