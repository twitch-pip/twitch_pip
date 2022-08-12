const { ipcRenderer } = require("electron");
const store = require("../javascripts/store");

let video = document.createElement("video");
video.width = 480;
video.height = 270;
document.getElementById("panel").prepend(video);

function window_close() {
    ipcRenderer.send("closeWindow", params.name);
}

const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

let hls = new Hls();
hls.loadSource(params.url);
hls.attachMedia(video);
hls.on(Hls.Events.MANIFEST_PARSED, () => {
    video.play();
});

ipcRenderer.on("setVolume", (event, volume) => {
    video.volume = volume;
});