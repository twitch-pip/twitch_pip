const {ipcRenderer} = require("electron")

let info = ipcRenderer.sendSync("getIsedolInfo")

info.forEach(element => {
    console.log(element)
})