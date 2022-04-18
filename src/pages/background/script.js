const {ipcRenderer} = require("electron")

let getOnePickStream;
let flag = false;

function setGetOnePick(){
    getOnePickStream = setInterval(()=>{
        ipcRenderer.send("getOnePickStream")
    }, 30000)
}
setGetOnePick();

ipcRenderer.on("getOnePickStream_reply", (evt) => {
    flag = true;
    clearInterval(getOnePickStream);
    getOnePickStream = setInterval(()=>{
        ipcRenderer.send("isStreamOffWhileOn");
    }, 30000)
})

ipcRenderer.on("PIPClose", (evt) => {
    clearInterval(getOnePickStream)
    getOnePickStream = setInterval(()=>{
        ipcRenderer.send("isStreamOff");
    },30000)
})
ipcRenderer.on("isStreamOff_reply", (evt) => {
    flag = false;
    clearInterval(getOnePickStream);
    setGetOnePick();
})
ipcRenderer.on("selectOtherStream", (evt) => {
    if(flag) {
        clearInterval(getOnePickStream);
        getOnePickStream = setInterval(()=>{
            ipcRenderer.send("isStreamOffWhileOn");
        }, 30000)
    }
})