import { app } from "electron";
import ElectronStore from "electron-store";
import path from "path";

export const defaultChannels = ["viichan6", "gosegugosegu", "cotton__123", "lilpaaaaaa", "jingburger", "vo_ine"];

export const __public__ = path.join(app.getAppPath(), "public");
export const __asset__ = path.join(app.getAppPath(), "assets");
export const __store__ = new ElectronStore({
    schema: {
        order: {
            type: "array",
            default: defaultChannels,
        },
        chatting: {
            type: "boolean",
            default: true,
        },
        darktheme: {
            type: "boolean",
            default: true,
        },
        "auto-point": {
            type: "boolean",
            default: false,
        },
        "auto-run-pip": {
            type: "boolean",
            default: false,
        }
    }
});