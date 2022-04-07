const electron = require("electron")
const path = require("path")
const { ElectronAuthProvider } = require("@twurple/auth-electron")
const {ApiClient} = require("@twurple/api")
const { app, BrowserWindow, ipcMain } = electron

const page_dir = path.join(__dirname, "/src/pages/")
const clientId = "m65puodpp4i8bvfrb27k1mrxr84e3z"
const redirectUri = "http://localhost/"
const authProvider = new ElectronAuthProvider({
    clientId,
    redirectUri
})
const apiClient = new ApiClient({ authProvider });

let win


function createWindow() {
    win = new BrowserWindow({
        width: 1280,
        height: 1080,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    
    win.loadFile(path.join(page_dir, "/main/index.html"))
    win.webContents.openDevTools()
    win.on("closed", () => {
        win = null
    })
}

app.on("ready", ()=>{
    createWindow()
    
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit()
})

app.on("activate", () => {
    if (win === null) createWindow()
})

