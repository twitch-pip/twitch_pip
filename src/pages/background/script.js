const {ipcRenderer} = require("electron")

let getOnePickStream;
let flag = false;
let login = false;

function setGetOnePick(){
    getOnePickStream = setInterval(()=>{
        if(login) ipcRenderer.send("getOnePickStream")
    }, 30000)
}
setGetOnePick();

ipcRenderer.on("login", ()=>{
    login = true;
})

ipcRenderer.on("getOnePickStream_reply", () => {
    flag = true;
    clearInterval(getOnePickStream);
    getOnePickStream = setInterval(()=>{
        ipcRenderer.send("isStreamOffWhileOn");
    }, 30000)
})

ipcRenderer.on("PIPClose", () => {
    clearInterval(getOnePickStream)
    getOnePickStream = setInterval(()=>{
        ipcRenderer.send("isStreamOff");
    },30000)
})
ipcRenderer.on("isStreamOff_reply", () => {
    flag = false;
    clearInterval(getOnePickStream);
    setGetOnePick();
})
ipcRenderer.on("selectOtherStream", () => {
    if(flag) {
        clearInterval(getOnePickStream);
        getOnePickStream = setInterval(()=>{
            ipcRenderer.send("isStreamOffWhileOn");
        }, 30000)
    }
})