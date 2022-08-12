import { app, IpcMainInvokeEvent } from "electron";
import { createPIPWindow } from "../../app";
import twitch from "twitch-m3u8";
import Channel from "../ipc";

export default class PIP {
    @Channel("pip", "toggleMouse")
    toggleMouse() {
        mouseIgnored = !mouseIgnored;
        Object.values(pipWindows).forEach((win) => {
            if (!win.isDestroyed())
                win.setIgnoreMouseEvents(mouseIgnored);
        });
        return mouseIgnored;
    }

    @Channel("pip", "open")
    async open(event: IpcMainInvokeEvent, id: string, ...args: any[]) {
        if (pipWindows[id] && !pipWindows[id].isDestroyed()) {
            pipWindows[id].show();
            pipWindows[id].focus();
            return;
        }
        const isStream = await apiClient.streams.getStreamByUserName(id) ? true : false;
        if (isStream) {
            await twitch.getStream(id).then((res) => {
                createPIPWindow(res[1].url, id);
            });
        }
    }
}