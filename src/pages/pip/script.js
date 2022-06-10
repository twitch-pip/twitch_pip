const { ipcRenderer } = require("electron");
const store = require("../../../store");

function docId(element){
    return document.getElementById(element);
}

const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

function window_close() {
    ipcRenderer.send("closePIP");
}

let video = document.createElement("video");
video.width = 480;
video.height = 270;
let hls = new Hls();
hls.loadSource(params.url);
hls.attachMedia(video);
hls.on(Hls.Events.MANIFEST_PARSED, ()=>{
    video.play();
});
docId("panel").prepend(video);

getStream = setInterval(()=>{
    ipcRenderer.send("isStreamOffWhileOn", params.name);
}, 30000);