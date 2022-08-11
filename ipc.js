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
const electron_1 = require("electron");
const electron_store_1 = __importDefault(require("electron-store"));
require("./global");
const __store__ = new electron_store_1.default();
electron_1.ipcMain.handle("streamerStatus", (evt) => __awaiter(void 0, void 0, void 0, function* () {
    const streamers = __store__.get("order", []);
    const res = yield apiClient.users.getUsersByNames(streamers);
    let info = [];
    for (const i of res) {
        const follows = yield apiClient.users.getFollows({ followedUser: i.id, limit: 1 });
        const isStream = yield apiClient.streams.getStreamByUserId(i.id);
        info.push({
            "name": i.name,
            "displayName": i.displayName,
            "profile": i.profilePictureUrl,
            "id": i.id,
            "follows": follows.total,
            "isStream": isStream ? true : false
        });
    }
    return info;
}));
electron_1.ipcMain.on("closeWindow", (event, arg) => {
    const window = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (!window)
        return;
    window.close();
});
electron_1.ipcMain.on("minimizeWindow", (event, arg) => {
    const window = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (!window)
        return;
    window.minimize();
});
electron_1.ipcMain.on("appInfo", (event) => {
    event.reply("appInfo", {
        name: electron_1.app.getName(),
        version: electron_1.app.getVersion(),
        language: electron_1.app.getLocale(),
    });
});
