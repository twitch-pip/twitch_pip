const {ipcRenderer} = require("electron")
const remote = require('@electron/remote')

function window_close() {
    remote.getGlobal("backWin").webContents.send("PIPClose")
    ipcRenderer.send("closePIP")
}