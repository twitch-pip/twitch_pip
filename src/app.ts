import path from "path";
import { app, BrowserWindow, ipcMain, Tray, Menu, shell } from "electron";
import ElectronStore from "electron-store";
import { autoUpdater } from "electron-updater";
import { ElectronAuthProvider } from "@twurple/auth-electron";
import { ApiClient } from "@twurple/api";
import twitch from "twitch-m3u8";
import { channels } from "./default";
import "./global";

const __public__ = path.join(__dirname, "public");
const __asset__ = path.join(__dirname, "assets");
const __store__ = new ElectronStore();

let tray: Tray | null;
let mainWindow: BrowserWindow | null;
let pips: { [key: string]: BrowserWindow } = {};
let points: { [key: string]: BrowserWindow } = {};
let mouseIgnored = false;
let prevStreamStatus: { [key: string]: boolean } = {};

const openNewStreamPIP = async () => {
    const autoRun = __store__.get("auto-run-pip", true);
    if (!autoRun) return;
    const streamers = __store__.get("order", []);
    const res = await apiClient.users.getUsersByNames(streamers);

    for (const i of res) {
        const isStream = await (apiClient as ApiClient).streams.getStreamByUserId(i.id) ? true : false;
        if (prevStreamStatus[i.id] !== isStream) {
            prevStreamStatus[i.id] = isStream;
            if (isStream) {
                const stream = await twitch.getStream(i.name);
                if (!pips[i.name])
                    createPIPWindow(stream[1].url, i.name);
            }
        }
    }
}

const createMainWindow = function() {
    mainWindow = new BrowserWindow({
        width: 786,
        height: 585,
        frame: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        },
        backgroundColor: "#0e0e10",
        icon: path.join(__public__, "images", "icon.jpg"),
        resizable: true,
    });

    mainWindow.setMenu(Menu.buildFromTemplate([
        ...Menu.getApplicationMenu()?.items || [],
        {
            label: "PIP",
            submenu: [
                {
                    label: "Ignore Mouse",
                    click: () => {
                        Object.values(pips).forEach((win) => win.setIgnoreMouseEvents(true));
                    }
                },
                {
                    label: "Attend Mouse",
                    click: () => {
                        Object.values(pips).forEach((win) => win.setIgnoreMouseEvents(false));
                    }
                }
            ]
        },
        {
            label: "Debug",
            submenu: [
                {
                    label: "Show point windows",
                    click: () => {
                        Object.values(points).forEach((win) => win.show());
                    }
                },
                {
                    label: "Hide point windows",
                    click: () => {
                        Object.values(points).forEach((win) => win.hide());
                    }
                },
                {
                    label: "Config Editor",
                    click: () => {
                        __store__.openInEditor();
                    }
                }
            ]
        },
    ]));

    mainWindow.on("closed", () => {
        mainWindow = null;
    });

    mainWindow.webContents.setWindowOpenHandler(function({ url }) {
        shell.openExternal(url);
        return {
            action: "deny",
        }
    });

    mainWindow.loadFile(path.join(__public__, "pages", "main.html"));
}

export const createPIPWindow = function(url: string, channelName: string) {
    if (pips[channelName] && !pips[channelName].isDestroyed()) return;
    const window = new BrowserWindow({
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
    window.loadURL("file://" + path.join(__public__, 'pages', `pip.html?url=${url}&name=${channelName}`));
    window.setAlwaysOnTop(true, "screen-saver");
    window.setVisibleOnAllWorkspaces(true);
    window.setAspectRatio(16 / 9);
    window.setResizable(true);
    window.setIgnoreMouseEvents(mouseIgnored);

    pips[channelName] = window;

    createPointWindow(channelName);
}

export const createPointWindow = function(channelName: string) {
    if (!__store__.get("channelPoints", false)) return;
    if (points[channelName] && !points[channelName].isDestroyed()) return;
    const window = new BrowserWindow({
        show: false,
        autoHideMenuBar: true,
    });
    window.loadURL("https://twitch.tv/" + channelName);
    window.webContents.setAudioMuted(true);

    points[channelName] = window;
}

export const createTray = function() {
    tray = new Tray(path.join(__asset__, "icon.jpg"));

    tray.setToolTip("트위치 pip");
    tray.setContextMenu(Menu.buildFromTemplate([
        { label: "종료", type: "normal", role: "quit" },
        { label: "포인트 창", type: "submenu", submenu: [
            { label: "열기", type: "normal", click: () => {
                Object.values(points).filter(x => !x.isDestroyed()).forEach((win) => win.show());
            } },
            { label: "닫기", type: "normal", click: () => {
                Object.values(points).filter(x => !x.isDestroyed()).forEach((win) => win.hide());
            } },
        ] },
        { label: "PIP 창", type: "submenu", submenu: [
            { label: "투명도 조절", type: "submenu", submenu: [
                { label: "10%", type: "normal", click: () => {
                    Object.values(pips).filter(x => !x.isDestroyed()).forEach((win) => win.setOpacity(.1));
                } },
                { label: "20%", type: "normal", click: () => {
                    Object.values(pips).filter(x => !x.isDestroyed()).forEach((win) => win.setOpacity(.2));
                } },
                { label: "30%", type: "normal", click: () => {
                    Object.values(pips).filter(x => !x.isDestroyed()).forEach((win) => win.setOpacity(.3));
                } },
                { label: "40%", type: "normal", click: () => {
                    Object.values(pips).filter(x => !x.isDestroyed()).forEach((win) => win.setOpacity(.4));
                } },
                { label: "50%", type: "normal", click: () => {
                    Object.values(pips).filter(x => !x.isDestroyed()).forEach((win) => win.setOpacity(.5));
                } },
                { label: "60%", type: "normal", click: () => {
                    Object.values(pips).filter(x => !x.isDestroyed()).forEach((win) => win.setOpacity(.6));
                } },
                { label: "70%", type: "normal", click: () => {
                    Object.values(pips).filter(x => !x.isDestroyed()).forEach((win) => win.setOpacity(.7));
                } },
                { label: "80%", type: "normal", click: () => {
                    Object.values(pips).filter(x => !x.isDestroyed()).forEach((win) => win.setOpacity(.8));
                } },
                { label: "90%", type: "normal", click: () => {
                    Object.values(pips).filter(x => !x.isDestroyed()).forEach((win) => win.setOpacity(.9));
                } },
                { label: "100%", type: "normal", click: () => {
                    Object.values(pips).filter(x => !x.isDestroyed()).forEach((win) => win.setOpacity(1));
                } },
            ] },
            { label: "소리 조절", type: "submenu", submenu: [
                { label: "10%", type: "normal", click: () => {
                    Object.values(pips).filter(x => !x.isDestroyed()).forEach((win) => win.webContents.send("setVolume", .1));
                } },
                { label: "20%", type: "normal", click: () => {
                    Object.values(pips).filter(x => !x.isDestroyed()).forEach((win) => win.webContents.send("setVolume", .2));
                } },
                { label: "30%", type: "normal", click: () => {
                    Object.values(pips).filter(x => !x.isDestroyed()).forEach((win) => win.webContents.send("setVolume", .3));
                } },
                { label: "40%", type: "normal", click: () => {
                    Object.values(pips).filter(x => !x.isDestroyed()).forEach((win) => win.webContents.send("setVolume", .4));
                } },
                { label: "50%", type: "normal", click: () => {
                    Object.values(pips).filter(x => !x.isDestroyed()).forEach((win) => win.webContents.send("setVolume", .5));
                } },
                { label: "60%", type: "normal", click: () => {
                    Object.values(pips).filter(x => !x.isDestroyed()).forEach((win) => win.webContents.send("setVolume", .6));
                } },
                { label: "70%", type: "normal", click: () => {
                    Object.values(pips).filter(x => !x.isDestroyed()).forEach((win) => win.webContents.send("setVolume", .7));
                } },
                { label: "80%", type: "normal", click: () => {
                    Object.values(pips).filter(x => !x.isDestroyed()).forEach((win) => win.webContents.send("setVolume", .8));
                } },
                { label: "90%", type: "normal", click: () => {
                    Object.values(pips).filter(x => !x.isDestroyed()).forEach((win) => win.webContents.send("setVolume", .9));
                } },
                { label: "100%", type: "normal", click: () => {
                    Object.values(pips).filter(x => !x.isDestroyed()).forEach((win) => win.webContents.send("setVolume", 1));
                } },
            ] }
        ] },
    ]));
    tray.on("click", () => mainWindow || createMainWindow());
}

export const initializeStore = function() {
    __store__.has("order") || __store__.set("order", channels);
    __store__.has("channelPoints") || __store__.set("channelPoints", false);
    __store__.has("auto-run-pip") || __store__.set("auto-run-pip", false);
    // __store__.has("streamers") || __store__.set("streamers", channels);
}

export const bootstrap = function() {
    global.authProvider = new ElectronAuthProvider({
        clientId: "f79abi79zcv9e3mhf459mih16p0h5c",
        redirectUri: "http://localhost/",
    });
    global.apiClient = new ApiClient({ authProvider: global.authProvider });
    createTray();
    createMainWindow();
    initializeStore();
    openNewStreamPIP();
}

if (!app.requestSingleInstanceLock())
    app.quit();

app.on("ready", bootstrap);

app.on("activate", () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});

app.on("window-all-closed", (event: any) => {
    event.preventDefault();
});

app.on("second-instance",() => {
    if(!mainWindow)
        return createMainWindow();
    if(!mainWindow.isVisible()) mainWindow.show();
    mainWindow.focus();
});

import './ipc';

ipcMain.on("openSelectPIP", async (event, arg) => {
    if (pips[arg] && !pips[arg].isDestroyed()) {
        pips[arg].show();
        pips[arg].focus();
        return;
    }
    const isStream = await apiClient.streams.getStreamByUserName(arg) ? true : false;
    if(isStream){
        await twitch.getStream(arg).then((res) => {
            createPIPWindow(res[1].url, arg);
        });
    }
});

ipcMain.on("toggleMouse", (event, arg) => {
    mouseIgnored = !mouseIgnored;
    Object.values(pips).forEach((win) => {
        if (!win.isDestroyed())
            win.setIgnoreMouseEvents(mouseIgnored);
    });
});

setInterval(openNewStreamPIP, 30 * 1000);