//import { directProxy } from "@/utils/base";

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });
  proxyConfigsInit();

  browser.runtime.onInstalled.addListener((e: any) => {
    console.log("onInstalled");
    //console.info("onInstalled");
    console.debug(JSON.stringify(e));

    if (e.reason === 'install') {
      //proxyConfigsInit();
      //browser.tabs.create({ url: "/options.html" });
    }

    directProxy();

  });

  browser.runtime.onStartup.addListener((event: any) => {
    console.log("onStartup");

    proxyConfigsInit();
    directProxy();

  });

  

});
