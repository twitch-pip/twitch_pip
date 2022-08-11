const { ipcRenderer } = require("electron");
const storage = require("../javascripts/store");

// Constants
const draggables = document.querySelectorAll(".panel_item");
const containers = document.querySelectorAll("#panel");

ipcRenderer.__proto__.sendAsync = function (channel, ...args) {
    return new Promise((resolve, reject) => {
        this.send(channel, ...args);
        this.once(channel, (evt, data) => {
            resolve(data);
        });
    });
}


// Event Listeners
this.channelPoints.checked = storage.get("channelPoints");

this.refresh.addEventListener("click", () => {
    location.reload();
});

this.mouse.addEventListener("click", () => {
    ipcRenderer.send("toggleMouse");
});

this.channelPoints.addEventListener("click", () => {
    ipcRenderer.send("getChannelPoints");
});

// Functions
function install() {
    ipcRenderer.send("updateInstall");
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".panel_item:not(.dragging)")];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function beautyFollows(follows) {
    let first = `${(follows + "").substring(0, (follows + "").length - 4)}`;
    let second = `${(follows + "").substring((follows + "").length - 4, (follows + "").length - 3)}`;
    if (second * 1) return `팔로워 ${first}.${second}만명`;
    else return `팔로워 ${first}만명`;
}

function openSelect(id) {
    console.log(id);
    ipcRenderer.send("openSelectPIP", id);
}

// Runner
storage.get("order").forEach(x => {
    let div = document.createElement("div");
    div.id = x;
    div.className = "panel_item";
    div.draggable = true;
    div.addEventListener("click", function (ev) {
        this.removeEventListener("click", arguments.callee);
        openSelect(x);
        setTimeout((element) => {
            element.addEventListener("click", function () {
                openSelect(x);
            });
        }, 3000, this);
    });
    this.panel.append(div);
});

draggables.forEach(draggable => {
    draggable.addEventListener("dragstart", () => {
        draggable.classList.add("dragging");
    });

    draggable.addEventListener("dragend", () => {
        draggable.classList.remove("dragging");
        storage.set("order", Array.from(document.querySelectorAll(".panel_item")).map(e => e.id));
    });
});

containers.forEach(container => {
    container.addEventListener("dragover", e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(container, e.clientY);
        const draggable = document.querySelector(".dragging");
        if (afterElement === null) {
            container.appendChild(draggable);
        } else {
            container.insertBefore(draggable, afterElement);
        }
    });
});

(async () => {
    let info = await ipcRenderer.invoke("streamerStatus");

    console.log(info);

    info.forEach(element => {
        let div = document.createElement("div");
        div.className = "info";
    
        let profile = document.createElement("img");
        profile.className = "profile";
        profile.src = element.profile;
        div.append(profile);
    
        let name_panel = document.createElement("div");
        //name_panel.className = "name_panel"
    
        let name = document.createElement("p");
        name.innerText = element.displayName;
        name.className = "name";
        name_panel.append(name);
    
        let follows = document.createElement("p");
        follows.className = "follows";
        follows.innerText = beautyFollows(element.follows);
        name_panel.append(follows);
        div.append(name_panel);
    
        this[element.name].append(div);
    
        let isStream = document.createElement("div");
        isStream.className = "is_stream";
    
        let streamCircle = document.createElement("span");
        streamCircle.className = "stream_circle";
        if (element.isStream) streamCircle.classList.add("stream_on");
        else streamCircle.classList.add("stream_off");
        isStream.append(streamCircle);
        this[element.name].append(isStream);
    });
})();

ipcRenderer.send("appInfo");
ipcRenderer.once("appInfo", (evt, arg) => {
    this.version_num.innerText = "Version: " + arg.version;
});

ipcRenderer.once("updateDownloaded", () => {
    this.version_update.innerHTML = "<a href='javascript:install()'>Update is available</a>";
});