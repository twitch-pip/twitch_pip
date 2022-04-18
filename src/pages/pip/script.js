const {ipcRenderer} = require("electron")
const store = require("../../../store")

function window_close() {
    ipcRenderer.send("closePIP")
}