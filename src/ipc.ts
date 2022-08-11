import { app, BrowserWindow, ipcMain } from "electron";
import ElectronStore from "electron-store";
import twitch from "twitch-m3u8";
import { createPIPWindow } from "./app";
import "./global";

const __store__ = new ElectronStore();

ipcMain.handle("streamerStatus", async (evt) => {
    const streamers = __store__.get("order", []);
    const res = await apiClient.users.getUsersByNames(streamers);
    
    let info = [];
    for (const i of res) {
        const follows = await apiClient.users.getFollows({ followedUser: i.id, limit: 1 });
        const isStream = await apiClient.streams.getStreamByUserId(i.id);
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
});

ipcMain.on("closeWindow", (event, arg) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) return;
    window.close();
});

ipcMain.on("minimizeWindow", (event, arg) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) return;
    window.minimize();
});

ipcMain.on("appInfo", (event) => {
    event.reply("appInfo", {
        name: app.getName(),
        version: app.getVersion(),
        language: app.getLocale(),
    });
});
