"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const app_1 = require("../../app");
const twitch_m3u8_1 = __importDefault(require("twitch-m3u8"));
const ipc_1 = __importDefault(require("../ipc"));
class PIP {
    toggleMouse() {
        mouseIgnored = !mouseIgnored;
        Object.values(pipWindows).forEach((win) => {
            if (!win.isDestroyed())
                win.setIgnoreMouseEvents(mouseIgnored);
        });
        return mouseIgnored;
    }
    open(event, id, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (pipWindows[id] && !pipWindows[id].isDestroyed()) {
                pipWindows[id].show();
                pipWindows[id].focus();
                return;
            }
            const isStream = (yield apiClient.streams.getStreamByUserName(id)) ? true : false;
            if (isStream) {
                yield twitch_m3u8_1.default.getStream(id).then((res) => {
                    (0, app_1.createPIPWindow)(res[1].url, id);
                });
            }
        });
    }
}
__decorate([
    (0, ipc_1.default)("pip", "toggleMouse")
], PIP.prototype, "toggleMouse", null);
__decorate([
    (0, ipc_1.default)("pip", "open")
], PIP.prototype, "open", null);
exports.default = PIP;
