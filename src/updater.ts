import { app } from "electron";
import { autoUpdater } from "electron-updater";

app.on("ready", () => {
    autoUpdater.checkForUpdates();
});

autoUpdater.on("update-downloaded", () => {
    mainWindow?.webContents.send("update.downloaded");
})

autoUpdater.on("checking-for-update", () => {
    console.log("checking-for-update");
    mainWindow?.webContents.send("update.checking");
}).on("update-available", () => {
    console.log("update-available");
    mainWindow?.webContents.send("update.available");
}).on("update-not-available", () => {
    console.log("update-not-available");
    mainWindow?.webContents.send("update.notAvailable");
}).on("error", (err) => {
    console.log("error", err);
    mainWindow?.webContents.send("update.error", err);
}).on("download-progress", (progressObj) => {
    console.log("download-progress", progressObj);
    mainWindow?.webContents.send("update.progress", progressObj);
}).on("update-downloaded", () => {
    console.log("update-downloaded");
});