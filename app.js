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
exports.bootstrap = exports.initializeStore = exports.createTray = exports.createPointWindow = exports.createPIPWindow = void 0;
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const electron_store_1 = __importDefault(require("electron-store"));
const auth_electron_1 = require("@twurple/auth-electron");
const api_1 = require("@twurple/api");
const twitch_m3u8_1 = __importDefault(require("twitch-m3u8"));
const default_1 = require("./default");
require("./global");
const __public__ = path_1.default.join(__dirname, "public");
const __asset__ = path_1.default.join(__dirname, "assets");
const __store__ = new electron_store_1.default();
let tray;
let mainWindow;
let pips = {};
let points = {};
let mouseIgnored = false;
let prevStreamStatus = {};
const openNewStreamPIP = () => __awaiter(void 0, void 0, void 0, function* () {
    const autoRun = __store__.get("auto-run-pip", true);
    if (!autoRun)
        return;
    const streamers = __store__.get("order", []);
    const res = yield apiClient.users.getUsersByNames(streamers);
    for (const i of res) {
        const isStream = (yield apiClient.streams.getStreamByUserId(i.id)) ? true : false;
        if (prevStreamStatus[i.id] !== isStream) {
            prevStreamStatus[i.id] = isStream;
            if (isStream) {
                const stream = yield twitch_m3u8_1.default.getStream(i.name);
                if (!pips[i.name])
                    (0, exports.createPIPWindow)(stream[1].url, i.name);
            }
        }
    }
});
const createMainWindow = function () {
    var _a;
    mainWindow = new electron_1.BrowserWindow({
        width: 786,
        height: 585,
        frame: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path_1.default.join(__dirname, 'preload.js')
        },
        backgroundColor: "#0e0e10",
        icon: path_1.default.join(__public__, "images", "icon.jpg"),
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
    mainWindow.webContents.setWindowOpenHandler(function ({ url }) {
        electron_1.shell.openExternal(url);
        return {
            action: "deny",
        };
    });
    mainWindow.loadFile(path_1.default.join(__public__, "pages", "main.html"));
};
const createPIPWindow = function (url, channelName) {
    const window = new electron_1.BrowserWindow({
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
    window.loadURL("file://" + path_1.default.join(__public__, 'pages', `pip.html?url=${url}&name=${channelName}`));
    window.setAlwaysOnTop(true, "screen-saver");
    window.setVisibleOnAllWorkspaces(true);
    window.setAspectRatio(16 / 9);
    window.setResizable(true);
    window.setIgnoreMouseEvents(mouseIgnored);
    pips[channelName] = window;
    (0, exports.createPointWindow)(channelName);
};
exports.createPIPWindow = createPIPWindow;
const createPointWindow = function (channelName) {
    const window = new electron_1.BrowserWindow({
        show: false,
        autoHideMenuBar: true,
    });
    window.loadURL("https://twitch.tv/" + channelName);
    window.webContents.setAudioMuted(true);
    points[channelName] = window;
};
exports.createPointWindow = createPointWindow;
const createTray = function () {
    tray = new electron_1.Tray(path_1.default.join(__asset__, "icon.jpg"));
    tray.setToolTip("트위치 pip");
    tray.setContextMenu(electron_1.Menu.buildFromTemplate([
        { label: "종료", type: "normal", role: "quit" },
    ]));
    tray.on("click", () => mainWindow || createMainWindow());
};
exports.createTray = createTray;
const initializeStore = function () {
    __store__.has("order") || __store__.set("order", default_1.channels);
    __store__.has("channelPoints") || __store__.set("channelPoints", false);
    __store__.has("auto-run-pip") || __store__.set("auto-run-pip", false);
    // __store__.has("streamers") || __store__.set("streamers", channels);
};
exports.initializeStore = initializeStore;
const bootstrap = function () {
    global.authProvider = new auth_electron_1.ElectronAuthProvider({
        clientId: "m65puodpp4i8bvfrb27k1mrxr84e3z",
        redirectUri: "http://localhost/",
    });
    global.apiClient = new api_1.ApiClient({ authProvider: global.authProvider });
    (0, exports.createTray)();
    createMainWindow();
    (0, exports.initializeStore)();
    openNewStreamPIP();
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
require("./ipc");
electron_1.ipcMain.on("openSelectPIP", (event, arg) => __awaiter(void 0, void 0, void 0, function* () {
    if (pips[arg] && !pips[arg].isDestroyed()) {
        pips[arg].show();
        pips[arg].focus();
        return;
    }
    const isStream = (yield apiClient.streams.getStreamByUserName(arg)) ? true : false;
    if (isStream) {
        yield twitch_m3u8_1.default.getStream(arg).then((res) => {
            (0, exports.createPIPWindow)(res[1].url, arg);
        });
    }
}));
electron_1.ipcMain.on("toggleMouse", (event, arg) => {
    mouseIgnored = !mouseIgnored;
    Object.values(pips).forEach((win) => {
        if (!win.isDestroyed())
            win.setIgnoreMouseEvents(mouseIgnored);
    });
});
setInterval(openNewStreamPIP, 30 * 1000);
