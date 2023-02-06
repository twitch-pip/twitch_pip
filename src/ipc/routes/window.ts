import { app, BrowserWindow, IpcMainInvokeEvent } from "electron";
import Channel from "../channel";

export default class Window {
    @Channel("window", "close")
    close(event: IpcMainInvokeEvent, ...args: any[]) {
        const window = BrowserWindow.fromWebContents(event.sender);
        if (!window || window.isDestroyed()) return;
        window.close();
    }

    @Channel("window", "minimize")
    minimize(event: IpcMainInvokeEvent, ...args: any[]) {
        const window = BrowserWindow.fromWebContents(event.sender);
        if (!window || window.isDestroyed()) return;
        window.minimize();
    }

    @Channel("window", "maximize")
    maximize(event: IpcMainInvokeEvent, ...args: any[]) {
        const window = BrowserWindow.fromWebContents(event.sender);
        if (!window || window.isDestroyed()) return;
        window.maximize();
    }
}