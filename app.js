const electron = require("electron")
const path = require("path")
const { ElectronAuthProvider } = require("@twurple/auth-electron")
const {ApiClient} = require("@twurple/api")
const { app, BrowserWindow, ipcMain, Tray, Menu } = electron
const firstRun = require("electron-first-run");
const store = require("./store")

const isFirstRun = firstRun()
const page_dir = path.join(__dirname, "/src/")
const clientId = "m65puodpp4i8bvfrb27k1mrxr84e3z" //공개돼도 되는 값.
const redirectUri = "http://localhost/"
const authProvider = new ElectronAuthProvider({
    clientId,
    redirectUri
})
const apiClient = new ApiClient({ authProvider });

const channel_name = ["viichan6", "gosegugosegu", "cotton__123", "lilpaaaaaa", "vo_ine", "jingburger"]
let mainWin, tray, backWin

function createMainWindow() {
    mainWin = new BrowserWindow({
        width: 756,
        height: 585,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        },
        //resizable:false
    })
    //win.setMenu(null);
    mainWin.loadFile(path.join(page_dir, "pages/main/index.html"));
    //win.webContents.openDevTools()
    
    mainWin.on("closed", () => {
        mainWin = null;
    })
}

function createBackground(){
    backWin = new BrowserWindow({
        show:false,
        webPreferences: { 
            nodeIntegration: true
        }
    })

    backWin.loadFile(path.join(page_dir, "pages/background/index.html"));
}

app.on("ready", ()=>{
    createMainWindow();
    createBackground();
    tray = new Tray(path.join(page_dir, "assets/icon.jpg"));
    const contextMenu = Menu.buildFromTemplate([
        {label: "Exit", type: "normal", role: "quit"},
    ])
    tray.setToolTip("이세계 아이돌 트위치 방송 PIP");
    tray.setContextMenu(contextMenu)
    
    tray.on("click", () => {
        if(!mainWin) createMainWindow();
    })
    if(isFirstRun) store.store.set("order", channel_name);
    //firstRun.clear()
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit()
})

app.on("activate", () => {
    if (backWin === null) createBackground()
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