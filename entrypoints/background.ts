//import { directProxy } from "@/utils/base";

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });
  

  browser.runtime.onInstalled.addListener((e: any) => {
    console.log("onInstalled");
    //console.info("onInstalled");
    console.debug(JSON.stringify(e));

    if (e.reason === 'install') {
      proxyConfigsInit();
      //browser.tabs.create({ url: "/options.html" });
    }

    directProxy(()=>{});

  });

  browser.runtime.onStartup.addListener((event: any) => {
    console.log("onStartup", new Date().toLocaleTimeString());

    //directProxy(()=>{});

    browser.storage.local.get(["useLastProxy"]).then((result : any)=>  {
      console.log("useLastProxy is ", result.useLastProxy);
      
      if(result.useLastProxy == true){
        console.log("openCurrProxy");
        openCurrProxy(()=>{});
      }else{
        directProxy(()=>{});
      }
      
  });

  });

  
  /*
  browser.runtime.openOptionsPage((event: any) => {
    console.log("openOptionsPage", new Date().toLocaleTimeString());
  });
  */

});
