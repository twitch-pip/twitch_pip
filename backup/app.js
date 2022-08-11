const electron = require("electron");
const path = require("path");
const { ElectronAuthProvider } = require("@twurple/auth-electron");
const { ApiClient } = require("@twurple/api");
const { app, BrowserWindow, ipcMain, Tray, Menu } = electron;
const store = require("./store");
const { autoUpdater } = require("electron-updater");
const twitch = require("twitch-m3u8");

const page_dir = path.join(__dirname, "/src/");
const clientId = "m65puodpp4i8bvfrb27k1mrxr84e3z"; // 공개돼도 되는 값.
const redirectUri = "http://localhost/";
const authProvider = new ElectronAuthProvider({
    clientId,
    redirectUri,
});
const apiClient = new ApiClient({ authProvider });

const lock = app.requestSingleInstanceLock();

const channel_name = ["viichan6", "gosegugosegu", "cotton__123", "lilpaaaaaa", "jingburger", "vo_ine"];
let mainWin;
let tray;
let backWin;
let PIPWin = {};
let trayIcon;
let pointsWin = {};

function createMainWindow() {
    mainWin = new BrowserWindow({
        width: 756,
        height: 585,
        frame: false,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            backgroundColor: "#0e0e10",
        },
        icon: path.join(page_dir, "assets/icon.jpg"),
        resizable: false,
    });
    mainWin.setMenu(null);
    mainWin.loadFile(path.join(page_dir, "pages/main/index.html"));
    // mainWin.webContents.openDevTools()
    autoUpdater.checkForUpdates();
    mainWin.on("closed", () => {
        mainWin = null;
    });
    mainWin.webContents.on("new-window", function(e, url) {
        e.preventDefault();
        electron.shell.openExternal(url);
    });
}

function createBackground() {
    backWin = new BrowserWindow({
        show: false,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        },
    });

    backWin.loadFile(path.join(page_dir, "pages/background/index.html"));
}

function createPIPWin(url, name) {
    PIPWin.name = new BrowserWindow({
        width: 480,
        height: 270,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        },
        frame: false,
        resizable: false,
        skipTaskbar: true,
        x: 1390,
        y: 710,
    });
    PIPWin.setMenu(null);
    PIPWin.loadURL("file://" + path.join(page_dir, `pages/pip/index.html?url=${url}&name=${name}`));
    PIPWin.setAlwaysOnTop(true, "screen-saver");
    PIPWin.setVisibleOnAllWorkspaces(true);

    createPointsWin(name);
}

function createPointsWin(name){
    pointsWin.name = new BrowserWindow({
        show: false,
    });
    pointsWin.loadURL("https://twitch.tv/" + name);
    pointsWin.webContents.setAudioMuted(true);
}

if(!lock){
    app.quit();
} else{
    app.on("second-instance",() => {
        if(mainWin){
            if(mainWin.isMinimized() || !mainWin.isVisible()) mainWin.show();
            mainWin.focus();
        }else if(!mainWin){
            createMainWindow();
        }
    });
}

app.on("ready", async () => {
    createMainWindow();
    createBackground();
    trayIcon = (process.platform === "darwin")?"assets/icon2.png":"assets/icon.jpg";
    tray = new Tray(path.join(page_dir, trayIcon));
    const contextMenu = Menu.buildFromTemplate([
        { label: "Exit", type: "normal", role: "quit" },
    ]);
    tray.setToolTip("이세계 아이돌 트위치 방송 PIP");
    tray.setContextMenu(contextMenu);

    tray.on("click", () => {
        if (!mainWin) createMainWindow();
    });

    //store.store.delete("order");
    if (!store.store.get("order")){
        store.store.set("order", channel_name);
        app.setLoginItemSettings({
            openAtLogin: true
        });
    }
    if (store.store.get("channelPoints") === null) store.store.set("channelPoint", true);
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (backWin === null) createBackground();
    if (mainWin === null) createMainWindow();
});

ipcMain.on("getIsedolInfo", async (evt) => {
    const info = [];
    const res = await apiClient.users.getUsersByNames(channel_name);
    for (const i of res) {
        const follows = await apiClient.users.getFollows({ followedUser: i.id, limit: 1 });
        const isStream = await apiClient.streams.getStreamByUserId(i.id);
        // let data = await apiClient.channels.getChannelInfo(i);
        info.push({ "name": i.name,
            "displayName": i.displayName,
            "profile": i.profilePictureUrl,
            "id": i.id,
            "follows": follows.total,
            "isStream": isStream ? true : false });
    }
    backWin.webContents.send("login");
    evt.returnValue = info;
});

ipcMain.on("getOnePickStream", async (evt) => {
    const isStream = await apiClient.streams.getStreamByUserName(store.store.get("order")[ 0 ]) ? true : false;
    if (isStream) {
        await twitch.getStream(store.store.get("order")[ 0 ]).then((res) => {
            createPIPWin(res[ 1 ].url, store.store.get("order")[0]);
        });
        evt.sender.send("getOnePickStream_reply", isStream);
    }
});

ipcMain.on("openSelectPIP", async (evt, arg) => {
    const isStream = await apiClient.streams.getStreamByUserName(arg) ? true : false;
    if(isStream){
        await twitch.getStream(arg).then((res) => {
            createPIPWin(res[ 1 ].url, arg);
        });
    }
});

ipcMain.on("closePIP", (evt, arg) => {
    if(arg === store.store.get("order"))
        backWin.webContents.send("PIPClose");
    PIPWin.arg.close();
    pointsWin.arg.close();
    PIPWin.arg = null;
    pointsWin.arg = null;
});

ipcMain.on("isStreamOff", async (evt) => {
    const isStream = await apiClient.streams.getStreamByUserName(store.store.get("order")[ 0 ]) ? true : false;
    if (!isStream) evt.sender.send("isStreamOff_reply");
});

ipcMain.on("isStreamOffWhileOn", async (evt, arg) => {
    const isStream = await apiClient.streams.getStreamByUserName(arg) ? true : false;
    if (!isStream) {
        backWin.webContents.send("isStreamOff_reply");
        PIPWin.arg.close();
        pointsWin.arg.close();
        PIPWin.arg = null;
        pointsWin.arg = null;
    }
});

ipcMain.on("app_version", (evt) => {
    evt.sender.send("app_version_reply", { version: app.getVersion() });
});

autoUpdater.on("update-downloaded", () => {
    mainWin.webContents.send("update_downloaded");
});

ipcMain.on("restart_app", () => {
    autoUpdater.quitAndInstall();
});

ipcMain.on("getChannelPoints", (evt) => {
    store.store.set("channelPoints", !store.store.get("channelPoints"));
});

ipcMain.once("openPIPWithAppOpen", async () => {
    if (await apiClient.streams.getStreamByUserName(store.store.get("order")[ 0 ]) ? true : false) {
        await twitch.getStream(store.store.get("order")[ 0 ]).then((res) => {
            createPIPWin(res[ 1 ].url, store.store.get("order")[0]);
        });
        backWin.webContents.send("getOnePickStream_reply", true);
    }
});

ipcMain.on("closeMainWin", () => {
    mainWin.close();
    mainWin = null;
});

ipcMain.on("minimizeMainWin", () => {
    mainWin.minimize();
});