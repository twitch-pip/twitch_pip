const { contextBridge, ipcRenderer } = require('electron');
const ElectronStore = require("electron-store");
const __store__ = new ElectronStore();

const whitelist = [];

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});

contextBridge.exposeInMainWorld('app', {
    getVersion: () => ipcRenderer.invoke('app.getVersion'),
    quit: () => ipcRenderer.invoke('app.quit'),
});

contextBridge.exposeInMainWorld('storage', {
    get: (key) => __store__.get(key),
    set: (key, value) => __store__.set(key, value),
    has: (key) => __store__.has(key),
    reset: () => __store__.reset(),
    onDidChange: (key, callback) => __store__.onDidChange(key, callback),
    onDidAnyChange: (callback) => __store__.onDidAnyChange(callback),
    openInEditor: () => __store__.openInEditor(),
});

contextBridge.exposeInMainWorld('electron', {
    window: {
        close: () => ipcRenderer.invoke('window.close'),
        minimize: () => ipcRenderer.invoke('window.minimize'),
        maximize: () => ipcRenderer.invoke('window.maximize'),
    },
    ipc: {
        on: (channel, callback) => {
            if (!whitelist.includes(channel)) return;
            ipcRenderer.on(channel, callback);
        },
    }
});

contextBridge.exposeInMainWorld('main', {
    onSetVolume: (callback) => ipcRenderer.on('setVolume', callback),
});

contextBridge.exposeInMainWorld('pip', {
    toggleMouse: () => ipcRenderer.invoke('pip.toggleMouse'),
    open: (id) => ipcRenderer.invoke('pip.open', id),
});

contextBridge.exposeInMainWorld('twitch', {
    streamerStates: (input) => ipcRenderer.invoke('twitch.streamerStates', input),
});

contextBridge.exposeInMainWorld('update', {
    install: () => ipcRenderer.invoke('update.install'),
    onDownloaded: (callback) => ipcRenderer.on('update.downloaded', callback),
});