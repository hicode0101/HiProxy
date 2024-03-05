
function _$(elementId) {
    return document.getElementById(elementId);
}

function AddEventListener(idName, eventName, callback){

    document.getElementById(idName).addEventListener(eventName, callback);
}


