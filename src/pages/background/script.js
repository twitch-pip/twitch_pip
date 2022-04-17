const {ipcRenderer} = require("electron")

let getOnePickStream;
let flag = true;

function setGetOnePick(){
    getOnePickStream = setInterval(()=>{
        if(flag) ipcRenderer.send("getOnePickStream")
    }, 30000)
}
setGetOnePick();

ipcRenderer.on("getOnePickStream_reply", (evt) => {
    clearInterval(getOnePickStream);
    getOnePickStream = setInterval(()=>{
        ipcRenderer.send("isStreamOffWhileOn");
    }, 30000)
})

ipcRenderer.on("PIPClose", (evt) => {
    flag = false;
    clearInterval(getOnePickStream)
    getOnePickStream = setInterval(()=>{
        ipcRenderer.send("isStreamOff");
    },30000)
})
ipcRenderer.on("isStreamOff_reply", (evt) => {
    flag = true;
    clearInterval(getOnePickStream);
    setGetOnePick();
})
ipcRenderer.on("isStreamOffWhileOn_reply", (evt) =>{
    clearInterval(getOnePickStream);
    setGetOnePick();
})