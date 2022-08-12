"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("@twurple/api");
const auth_electron_1 = require("@twurple/auth-electron");
function initialize() {
    console.log("initializing global variables");
    global.authProvider = new auth_electron_1.ElectronAuthProvider({
        clientId: "f79abi79zcv9e3mhf459mih16p0h5c",
        redirectUri: "http://localhost/",
    });
    global.apiClient = new api_1.ApiClient({ authProvider });
    global.tray = null;
    global.mainWindow = null;
    global.pipWindows = {};
    global.pointWindows = {};
    global.mouseIgnored = false;
    global.previousStreamState = {};
}
initialize();
exports.default = {};
