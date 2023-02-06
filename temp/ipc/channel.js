"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
function Channel(path, channel) {
    return (target, propertyKey, descriptor) => {
        if (target[propertyKey] && typeof target[propertyKey] === 'function')
            electron_1.ipcMain === null || electron_1.ipcMain === void 0 ? void 0 : electron_1.ipcMain.handle([path, channel].join('.'), target[propertyKey]);
        else if (target.descriptor && typeof target.descriptor.value === 'function')
            electron_1.ipcMain === null || electron_1.ipcMain === void 0 ? void 0 : electron_1.ipcMain.handle([path, channel].join('.'), target.descriptor.value);
        else if (descriptor && typeof descriptor.value === 'function')
            electron_1.ipcMain === null || electron_1.ipcMain === void 0 ? void 0 : electron_1.ipcMain.handle([path, channel].join('.'), descriptor.value);
    };
}
exports.default = Channel;
