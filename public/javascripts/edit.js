const containers = document.getElementById("panel");

this.back.addEventListener("click", () => {
    window.location.href = './main.html';
});

(async () => {
    let info = await twitch.streamerStates("edit");

    for (let name of storage.get('order')) {
        let div = document.createElement("div");
        div.className = "info";
        div.id = name

        let remove = document.createElement("button");
        remove.className = "remove";
        remove.innerHTML = "X";
        remove.addEventListener("click", () => {
            storage.set("order", storage.get("order").filter((e) => e !== name));
            location.reload();
        });
        div.append(remove);

        let profile = document.createElement("p");
        profile.className = "profile";
        div.append(profile);
        
        console.log(div)

        containers.append(div);
    }

    let users = [];
    for (let element of await info){
        let div = document.getElementById(element.name);
        div.children[1].innerText = `${element.displayName} ( ${element.name} )`;
        users.push(element.name);
    }
    storage.get('order').filter(x => !users.includes(x)).forEach(x => {
        document.getElementById(x).children[1].innerText = "존재하지 않는 유저입니다.";
    });
})();