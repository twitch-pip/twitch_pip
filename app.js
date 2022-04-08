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

const channel_name = ["cotton__123", "lilpaaaaaa", "gosegugosegu", "vo_ine", "viichan6", "jingburger"]
let win


function createWindow() {
    win = new BrowserWindow({
        width: 1280,
        height: 1080,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true
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


ipcMain.on("getIsedolInfo", async (evt)=>{
    let info = []
    let res = await apiClient.users.getUsersByNames(channel_name)
        for(var i of res){
            let follows = await apiClient.users.getFollows({ followedUser: i.id, limit: 1 });
            let isStream = await apiClient.streams.getStreamByUserId(i.id)
            //let data = await apiClient.channels.getChannelInfo(i);
            info.push({"name":i.name, "displayName":i.displayName, "profile":i.profilePictureUrl, "id":i.id, "follows":follows.total, "isStream":isStream?true:false});
        }
        evt.returnValue = info
        
})