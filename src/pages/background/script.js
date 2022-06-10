const { ipcRenderer } = require("electron");

let getStream;
let on = false;
let login = false;

getStream = setInterval(()=>{
    if(login) ipcRenderer.send("getOnePickStream");
}, 30000);

ipcRenderer.on("login", ()=>{
    login = true;
});

ipcRenderer.on("getOnePickStream_reply", () => {
    on = true;
    clearInterval(getStream);
});

ipcRenderer.on("PIPClose", () => {
    clearInterval(getStream);
    getStream = setInterval(()=>{
        ipcRenderer.send("isStreamOff");
    },30000);
});
ipcRenderer.on("isStreamOff_reply", () => {
    on = false;
    clearInterval(getStream);
    getStream = setInterval(()=>{
        if(login) ipcRenderer.send("getOnePickStream");
    }, 30000);
});
ipcRenderer.on("selectOtherStream", () => {
    if(on) {
        clearInterval(getStream);
        getStream = setInterval(()=>{
            ipcRenderer.send("isStreamOff");
        }, 30000);
    }
});