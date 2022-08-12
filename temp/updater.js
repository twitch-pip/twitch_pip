"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_updater_1 = require("electron-updater");
electron_1.app.on("ready", () => {
    electron_updater_1.autoUpdater.checkForUpdates();
});
electron_updater_1.autoUpdater.on("update-downloaded", () => {
    mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send("update.downloaded");
});
electron_updater_1.autoUpdater.on("checking-for-update", () => {
    console.log("checking-for-update");
    mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send("update.checking");
}).on("update-available", () => {
    console.log("update-available");
    mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send("update.available");
}).on("update-not-available", () => {
    console.log("update-not-available");
    mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send("update.notAvailable");
});
