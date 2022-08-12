const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

let video = document.createElement("video", {
    width: 480,
    height: 270,
});
document.getElementById("panel").prepend(video);

let hls = new Hls();
hls.loadSource(params.url);
hls.attachMedia(video);
hls.on(Hls.Events.MANIFEST_PARSED, () => {
    video.play();
});

main.onSetVolume((event, volume) => {
    video.volume = volume;
});