"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__store__ = exports.__asset__ = exports.__public__ = exports.defaultChannels = void 0;
const electron_1 = require("electron");
const electron_store_1 = __importDefault(require("electron-store"));
const path_1 = __importDefault(require("path"));
exports.defaultChannels = ["viichan6", "gosegugosegu", "cotton__123", "lilpaaaaaa", "jingburger", "vo_ine"];
exports.__public__ = path_1.default.join(electron_1.app.getAppPath(), "public");
exports.__asset__ = path_1.default.join(electron_1.app.getAppPath(), "assets");
exports.__store__ = new electron_store_1.default({
    schema: {
        order: {
            type: "array",
            default: exports.defaultChannels,
        },
        channelPoints: {
            type: "boolean",
            default: false,
        },
        "auto-run-pip": {
            type: "boolean",
            default: false,
        }
    }
});
