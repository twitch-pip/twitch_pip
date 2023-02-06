"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const channel_1 = __importDefault(require("../channel"));
class Window {
    close(event, ...args) {
        const window = electron_1.BrowserWindow.fromWebContents(event.sender);
        if (!window || window.isDestroyed())
            return;
        window.close();
    }
    minimize(event, ...args) {
        const window = electron_1.BrowserWindow.fromWebContents(event.sender);
        if (!window || window.isDestroyed())
            return;
        window.minimize();
    }
    maximize(event, ...args) {
        const window = electron_1.BrowserWindow.fromWebContents(event.sender);
        if (!window || window.isDestroyed())
            return;
        window.maximize();
    }
}
__decorate([
    (0, channel_1.default)("window", "close")
], Window.prototype, "close", null);
__decorate([
    (0, channel_1.default)("window", "minimize")
], Window.prototype, "minimize", null);
__decorate([
    (0, channel_1.default)("window", "maximize")
], Window.prototype, "maximize", null);
exports.default = Window;
