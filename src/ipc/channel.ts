import { ipcMain } from "electron";

export default function Channel(path: string, channel: string): any {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        if (target[propertyKey] && typeof target[propertyKey] === 'function')
            ipcMain?.handle([path, channel].join('.'), target[propertyKey]);
        else if (target.descriptor && typeof target.descriptor.value === 'function')
            ipcMain?.handle([path, channel].join('.'), target.descriptor.value);
        else if (descriptor && typeof descriptor.value === 'function')
            ipcMain?.handle([path, channel].join('.'), descriptor.value);
    };
}
