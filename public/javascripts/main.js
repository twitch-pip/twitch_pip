// Event Listeners
this.chatting.checked = storage.get("chatting");
this.darktheme.checked = storage.get("darktheme");

this.refresh.addEventListener("click", () => {
    loadOrder();
    loadStates();
    updateItems();
});

this.mouse.addEventListener("click", async () => {
    let state = await pip.toggleMouse();
    this.mouse.children[0].src = `../images/mouse${state ? "_off" : "_on"}.png`;
});

this.chatting.addEventListener("click", () => {
    storage.set("chatting", this.chatting.checked);
});

this.darktheme.addEventListener("click", () => {
    storage.set("darktheme", this.darktheme.checked);
});

this.edit.addEventListener("click", () => {
    window.location.href = "./edit.html";
});

this.panel.addEventListener("dragover", e => {
    e.preventDefault();
    const afterElement = getDragAfterElement(container, e.clientY);
    const draggable = document.querySelector(".dragging");
    if (afterElement === null) {
        this.panel.appendChild(draggable);
    } else {
        this.panel.insertBefore(draggable, afterElement);
    }
});

// Functions
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
    const units = ["", "만", "억"];
    let unit = 0;
    while (follows > 0) {
        const upperUnit = Math.floor(follows / 10000);
        console.log(follows, upperUnit, unit);
        if (upperUnit === 0) {
            follows = (unit === 0) ? follows : follows.toFixed(1);
            return `팔로워 ${follows + units[unit]}명`;
        }
        follows = follows / 10000;
        unit++;
    }
}

function loadOrder() {
    const container = document.querySelector("#panel");
    const order = storage.get("order");

    container.replaceChildren(
        ...order.map(x => {
            if (document.getElementById(x))
                return document.getElementById(x);
            let div = document.createElement("div");
            div.id = x;
            div.className = "panel_item";
            div.draggable = true;
            div.addEventListener("click", function (ev) {
                this.removeEventListener("click", arguments.callee);
                pip.open(x);
                setTimeout((element) => {
                    element.addEventListener("click", function () {
                        pip.open(x);
                    });
                }, 3000, this);
            });
            div.addEventListener("dragstart", () => {
                draggable.classList.add("dragging");
            });
            div.addEventListener("dragend", () => {
                draggable.classList.remove("dragging");
                storage.set("order", Array.from(document.querySelectorAll(".panel_item")).map(e => e.id));
            });
            return div;
        })
    );
}

async function loadStates() {
    let info = await twitch.streamerStates();

    info.forEach(data => {
        const item = document.getElementById(data.name);

        let div = document.createElement("div");
        div.className = "info";

        let profile = document.createElement("img");
        profile.className = "profile";
        profile.src = data.profile;
        div.append(profile);

        let name_panel = document.createElement("div");
        //name_panel.className = "name_panel"

        let name = document.createElement("p");
        name.innerText = data.displayName;
        name.className = "name";
        name_panel.append(name);

        let follows = document.createElement("p");
        follows.className = "follows";
        follows.innerText = beautyFollows(data.follows);
        name_panel.append(follows);
        div.append(name_panel);

        let isStream = document.createElement("div");
        isStream.className = "is_stream";

        let streamCircle = document.createElement("span");
        streamCircle.className = "stream_circle";
        if (data.isStream) streamCircle.classList.add("stream_on");
        else streamCircle.classList.add("stream_off");
        isStream.append(streamCircle);

        item.replaceChildren(div, isStream);
    });
}

// Runner
(async () => {
    let version = await app.getVersion();
    this.version_num.innerText = version;
})();

storage.onDidChange("order", () => {
    loadOrder();
    loadStates();
});

loadOrder();
loadStates();

update.onDownloaded(() => {
    this.version_update.innerHTML = "<a href='javascript:update.install()'>Update is available</a>";
});