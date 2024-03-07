
chrome.runtime.onInstalled.addListener((e) => {
    console.log("onInstalled");
    //console.info("onInstalled");
    console.debug(JSON.stringify(e));

    if (e.reason === 'install') {
        //proxyConfigsInit();
        chrome.tabs.create({url: "ui/options.html"});  
    }

    loaded();

});


chrome.proxy.onProxyError.addListener(function (details) {
    console.error(JSON.stringify(details));
});

chrome.runtime.onStartup.addListener((event) => {
    console.log("onStartup");
    
    loaded();

});

chrome.runtime.getPlatformInfo((platformInfo) => {
    console.debug(new Date().toString());
    console.debug(JSON.stringify(platformInfo));

});


chrome.action.onClicked.addListener((tab) => {
    console.log("action clicked", JSON.stringify(tab));

});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.debug("sw-onMessage", message);
});




function reDrawIcon(outColor, innerColor) {
    console.log(outColor, innerColor);

    const canvas = new OffscreenCanvas(16, 16);
    const context = canvas.getContext('2d');
    context.scale(16, 16);
    context.clearRect(0, 0, 1, 1);
    //context.fillStyle = '#00FF00';
    //circleDraw(context, "#4477bb");
    //circleDraw(context, "#4477bb","#00FF00");
    circleDraw(context, outColor, innerColor);
    context.setTransform(1, 0, 0, 1, 0, 0);
    const imageData = context.getImageData(0, 0, 16, 16);
    chrome.action.setIcon({ imageData: imageData }, () => { /* ... */ });

}

function circleDraw(ctx, outerCircleColor, innerCircleColor) {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = outerCircleColor;
    ctx.beginPath();
    ctx.arc(0.5, 0.5, 0.5, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    if (innerCircleColor != null) {
        ctx.fillStyle = innerCircleColor;
    } else {
        ctx.globalCompositeOperation = "destination-out";
    }

    ctx.beginPath();
    ctx.arc(0.5, 0.5, 0.25, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

function loaded() {
    
    console.log("loaded");
    console.debug(new Date().toString());


    chrome.proxy.settings.set({ value: { mode: "direct" }, scope: "regular" });

    reDrawIcon("#9b9b9b");

}





