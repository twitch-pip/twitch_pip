import { ApiClient } from "@twurple/api";
import { ElectronAuthProvider } from "@twurple/auth-electron";
import { AuthProvider } from "@twurple/auth";
import { BrowserWindow, Tray } from "electron";

declare global {
    var authProvider: AuthProvider;
    var apiClient: ApiClient;

    var tray: Tray | null;
    var mainWindow: Electron.BrowserWindow | null;
    var pipWindows: { [key: string]: BrowserWindow };
    var chattingWindows: { [key: string]: BrowserWindow };

    var mouseIgnored: boolean;
    var previousStreamState: { [key: string]: boolean };
}

function initialize() {
    console.log("initializing global variables");

    global.authProvider = new ElectronAuthProvider({
        clientId: "f79abi79zcv9e3mhf459mih16p0h5c",
        redirectUri: "http://localhost/",
    });
    global.apiClient = new ApiClient({ authProvider });

    global.tray = null;
    global.mainWindow = null;
    global.pipWindows = {};
    global.chattingWindows = {};
    
    global.mouseIgnored = false;
    global.previousStreamState = {};
}
    
initialize();

export default {  };