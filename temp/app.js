"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = exports.createTray = exports.createChattingWindow = exports.createPIPWindow = void 0;
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const twitch_m3u8_1 = __importDefault(require("twitch-m3u8"));
const constants_1 = require("./constants");
require("./global");
require("./ipc");
require("./updater");
const openStreamingPIP = () => __awaiter(void 0, void 0, void 0, function* () {
    const autoRun = constants_1.__store__.get("auto-run-pip", true);
    if (!autoRun)
        return;
    const streamers = constants_1.__store__.get("order", []);
    const res = yield apiClient.users.getUsersByNames(streamers);
    for (const i of res) {
        const isStream = (yield apiClient.streams.getStreamByUserId(i.id)) ? true : false;
        if (previousStreamState[i.id] !== isStream) {
            previousStreamState[i.id] = isStream;
            if (isStream) {
                const stream = yield twitch_m3u8_1.default.getStream(i.name);
                if (!pipWindows[i.name])
                    (0, exports.createPIPWindow)(stream[1].url, i.name);
            }
        }
    }
});
const createMainWindow = function () {
    var _a;
    if (mainWindow && !mainWindow.isDestroyed())
        return;
    mainWindow = new electron_1.BrowserWindow({
        width: 786,
        height: 585,
        frame: false,
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            preload: path_1.default.join(electron_1.app.getAppPath(), 'preload.js')
        },
        backgroundColor: "#0e0e10",
        icon: path_1.default.join(constants_1.__public__, "images", "icon.jpg"),
        resizable: true,
    });
    mainWindow.setMenu(electron_1.Menu.buildFromTemplate([
        ...((_a = electron_1.Menu.getApplicationMenu()) === null || _a === void 0 ? void 0 : _a.items) || [],
        {
            label: "PIP",
            submenu: [
                {
                    label: "Ignore Mouse",
                    click: () => {
                        Object.values(pipWindows).forEach((win) => win.setIgnoreMouseEvents(true));
                    }
                },
                {
                    label: "Attend Mouse",
                    click: () => {
                        Object.values(pipWindows).forEach((win) => win.setIgnoreMouseEvents(false));
                    }
                }
            ]
        },
        {
            label: "Debug",
            submenu: [
                {
                    label: "Config Editor",
                    click: () => {
                        constants_1.__store__.openInEditor();
                    }
                }
            ]
        },
    ]));
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
    mainWindow.webContents.setWindowOpenHandler(function ({ url }) {
        electron_1.shell.openExternal(url);
        return {
            action: "deny",
        };
    });
    mainWindow.loadFile(path_1.default.join(constants_1.__public__, "pages", "main.html"));
};
const createPIPWindow = function (url, channelName) {
    if (pipWindows[channelName] && !pipWindows[channelName].isDestroyed())
        return;
    const window = new electron_1.BrowserWindow({
        width: 480,
        height: 270,
        webPreferences: {
            contextIsolation: true,
            preload: path_1.default.join(electron_1.app.getAppPath(), 'preload.js')
        },
        frame: false,
        resizable: false,
        skipTaskbar: true,
        x: electron_1.screen.getPrimaryDisplay().workAreaSize.width - 480 - 10,
        y: electron_1.screen.getPrimaryDisplay().workAreaSize.height - 270 - 10,
    });
    window.loadURL("file://" + path_1.default.join(constants_1.__public__, 'pages', `pip.html?url=${url}&name=${channelName}`));
    window.setAlwaysOnTop(true, "screen-saver");
    window.setVisibleOnAllWorkspaces(true);
    window.setAspectRatio(16 / 9);
    window.setResizable(true);
    window.setIgnoreMouseEvents(mouseIgnored);
    window.on("closed", () => {
        var _a, _b;
        console.log((_a = chattingWindows[channelName]) === null || _a === void 0 ? void 0 : _a.closable);
        if (!chattingWindows[channelName])
            return;
        if (chattingWindows[channelName].isDestroyed())
            return;
        ((_b = chattingWindows[channelName]) === null || _b === void 0 ? void 0 : _b.closable) && chattingWindows[channelName].close();
    });
    pipWindows[channelName] = window;
    if (constants_1.__store__.get("chatting", false))
        (0, exports.createChattingWindow)(channelName);
};
exports.createPIPWindow = createPIPWindow;
const createChattingWindow = function (channelName) {
    if (!constants_1.__store__.get("chatting", false))
        return;
    if (chattingWindows[channelName] && !chattingWindows[channelName].isDestroyed())
        return;
    let options = "";
    if (constants_1.__store__.get("darktheme", false))
        options += "&darkpopout";
    const window = new electron_1.BrowserWindow({
        width: 340,
        height: 677,
        title: `${channelName}'s Live Chatting`,
        icon: path_1.default.join(constants_1.__public__, "images", "favicon-twitch.png"),
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            preload: path_1.default.join(electron_1.app.getAppPath(), 'preload.js')
        },
    });
    window.loadURL(`https://www.twitch.tv/embed/${channelName}/chat?parent=localhost${options}`);
    window.webContents.setAudioMuted(true);
    chattingWindows[channelName] = window;
};
exports.createChattingWindow = createChattingWindow;
const createTray = function () {
    tray = new electron_1.Tray(path_1.default.join(constants_1.__asset__, "icon.jpg"));
    tray.setToolTip("트위치 pip");
    tray.setContextMenu(electron_1.Menu.buildFromTemplate([
        { label: "종료", type: "normal", role: "quit" },
        { label: "PIP 창", type: "submenu", submenu: [
                { label: "투명도 조절", type: "submenu", submenu: [
                        { label: "10%", type: "normal", click: () => {
                                Object.values(pipWindows).filter(x => !x.isDestroyed()).forEach((win) => win.setOpacity(.1));
                            } },
                        { label: "20%", type: "normal", click: () => {
                                Object.values(pipWindows).filter(x => !x.isDestroyed()).forEach((win) => win.setOpacity(.2));
                            } },
                        { label: "30%", type: "normal", click: () => {
                                Object.values(pipWindows).filter(x => !x.isDestroyed()).forEach((win) => win.setOpacity(.3));
                            } },
                        { label: "40%", type: "normal", click: () => {
                                Object.values(pipWindows).filter(x => !x.isDestroyed()).forEach((win) => win.setOpacity(.4));
                            } },
                        { label: "50%", type: "normal", click: () => {
                                Object.values(pipWindows).filter(x => !x.isDestroyed()).forEach((win) => win.setOpacity(.5));
                            } },
                        { label: "60%", type: "normal", click: () => {
                                Object.values(pipWindows).filter(x => !x.isDestroyed()).forEach((win) => win.setOpacity(.6));
                            } },
                        { label: "70%", type: "normal", click: () => {
                                Object.values(pipWindows).filter(x => !x.isDestroyed()).forEach((win) => win.setOpacity(.7));
                            } },
                        { label: "80%", type: "normal", click: () => {
                                Object.values(pipWindows).filter(x => !x.isDestroyed()).forEach((win) => win.setOpacity(.8));
                            } },
                        { label: "90%", type: "normal", click: () => {
                                Object.values(pipWindows).filter(x => !x.isDestroyed()).forEach((win) => win.setOpacity(.9));
                            } },
                        { label: "100%", type: "normal", click: () => {
                                Object.values(pipWindows).filter(x => !x.isDestroyed()).forEach((win) => win.setOpacity(1));
                            } },
                    ] },
                { label: "소리 조절", type: "submenu", submenu: [
                        { label: "10%", type: "normal", click: () => {
                                Object.values(pipWindows).filter(x => !x.isDestroyed()).forEach((win) => win.webContents.send("setVolume", .1));
                            } },
                        { label: "20%", type: "normal", click: () => {
                                Object.values(pipWindows).filter(x => !x.isDestroyed()).forEach((win) => win.webContents.send("setVolume", .2));
                            } },
                        { label: "30%", type: "normal", click: () => {
                                Object.values(pipWindows).filter(x => !x.isDestroyed()).forEach((win) => win.webContents.send("setVolume", .3));
                            } },
                        { label: "40%", type: "normal", click: () => {
                                Object.values(pipWindows).filter(x => !x.isDestroyed()).forEach((win) => win.webContents.send("setVolume", .4));
                            } },
                        { label: "50%", type: "normal", click: () => {
                                Object.values(pipWindows).filter(x => !x.isDestroyed()).forEach((win) => win.webContents.send("setVolume", .5));
                            } },
                        { label: "60%", type: "normal", click: () => {
                                Object.values(pipWindows).filter(x => !x.isDestroyed()).forEach((win) => win.webContents.send("setVolume", .6));
                            } },
                        { label: "70%", type: "normal", click: () => {
                                Object.values(pipWindows).filter(x => !x.isDestroyed()).forEach((win) => win.webContents.send("setVolume", .7));
                            } },
                        { label: "80%", type: "normal", click: () => {
                                Object.values(pipWindows).filter(x => !x.isDestroyed()).forEach((win) => win.webContents.send("setVolume", .8));
                            } },
                        { label: "90%", type: "normal", click: () => {
                                Object.values(pipWindows).filter(x => !x.isDestroyed()).forEach((win) => win.webContents.send("setVolume", .9));
                            } },
                        { label: "100%", type: "normal", click: () => {
                                Object.values(pipWindows).filter(x => !x.isDestroyed()).forEach((win) => win.webContents.send("setVolume", 1));
                            } },
                    ] }
            ] },
    ]));
    tray.on("click", () => mainWindow || createMainWindow());
};
exports.createTray = createTray;
const bootstrap = function () {
    (0, exports.createTray)();
    createMainWindow();
    openStreamingPIP();
};
exports.bootstrap = bootstrap;
if (!electron_1.app.requestSingleInstanceLock())
    electron_1.app.quit();
electron_1.app.on("ready", exports.bootstrap);
electron_1.app.on("activate", () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});
electron_1.app.on("window-all-closed", (event) => {
    event.preventDefault();
});
electron_1.app.on("second-instance", () => {
    if (!mainWindow)
        return createMainWindow();
    if (!mainWindow.isVisible())
        mainWindow.show();
    mainWindow.focus();
});
setInterval(openStreamingPIP, 30 * 1000);
