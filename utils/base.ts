
export function everywherefunc(){
    console.log("every-where-func");
}



export function directProxy() {

    browser.proxy.settings.set({ value: { mode: "direct" }, scope: "regular" });

    showCurrProxy();
    reDrawIcon("#9b9b9b", "");
    

}

export function systemProxy() {

    browser.proxy.settings.set({ value: { mode: "system" }, scope: "regular" });

    showCurrProxy();
    reDrawIcon("#000000", "");
    

}




export function showCurrProxy() {
    browser.proxy.settings.get({ 'incognito': false }, function (config: any) {
        console.log(JSON.stringify(config));
    });
}

export async function proxyConfigsInit() {
  console.log("proxyConfigsInit");

  let currProxyPid = await currProxyPidGet();
  console.log("currProxyPid", currProxyPid);

  //storageClear();

  
  let proxyConfigsMap = getDefaultConfigs();

  await proxyConfigsSet(proxyConfigsMap);

  //proxyConfigsMap = await proxyConfigsGet();
  ///console.log(proxyConfigsMap);

}


export async function openCurrProxy() {
    let currProxyPid = await currProxyPidGet();
    console.log("currProxyPid", currProxyPid);

    proxyConfigsGetByCallback((result: Map<string,any>)=>{
        let proxyConfigs = result;
        if(proxyConfigs instanceof Map){
            if (currProxyPid != undefined && proxyConfigs.has(currProxyPid) == true) {
                let proxyConfig = proxyConfigs.get(currProxyPid);
                changeProxy(proxyConfig);
            } else {
                directProxy();
            }
        }else{
            console.error("proxyConfigs is not a map");
            directProxy();
        }
        
    });
    

}

export function changeProxy(proxyConfig: any) {

    var _config = {
        mode: proxyConfig.mode,
        rules: proxyConfig.rules
    };

    console.log("proxy.settings.set", _config);
    browser.proxy.settings.set({ value: _config, scope: 'regular' }, console.log("porxy switched"));


    reDrawIcon(proxyConfig.color, "");
    showCurrProxy();
}



export function reDrawIcon(outColor: string, innerColor: string) {
  console.log(outColor, innerColor);

  const canvas = new OffscreenCanvas(16, 16);
  const context = canvas.getContext('2d');
  if (!context) {
      console.error('Failed to get 2D rendering context');
      return;
  }
  context.scale(16, 16);
  context.clearRect(0, 0, 1, 1);
  //context.fillStyle = '#00FF00';
  //circleDraw(context, "#4477bb");
  //circleDraw(context, "#4477bb","#00FF00");
  circleDraw(context, outColor, innerColor);
  context.setTransform(1, 0, 0, 1, 0, 0);
  const imageData = context.getImageData(0, 0, 16, 16);
  //chrome.action.setIcon({ imageData: imageData }, () => { /* ... */ });
  browser.action.setIcon({ imageData: imageData }, () => { /* ... */ });

}

export function circleDraw(ctx: OffscreenCanvasRenderingContext2D, outerCircleColor: string, innerCircleColor: string) {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = outerCircleColor;
  ctx.beginPath();
  ctx.arc(0.5, 0.5, 0.5, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();

  if (innerCircleColor != null && innerCircleColor != "") {
      ctx.fillStyle = innerCircleColor;
  } else {
      ctx.globalCompositeOperation = "destination-out";
  }

  ctx.beginPath();
  ctx.arc(0.5, 0.5, 0.25, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
}
