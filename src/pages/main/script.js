const {ipcRenderer} = require("electron")
const store = require("../../../store")

function docId(element){
    return document.getElementById(element)
}

store.store.get("order").forEach(e => {
    let div = document.createElement("div")
    div.id = e
    div.className = "panel_item"
    docId("panel").append(div)
})

let info = ipcRenderer.sendSync("getIsedolInfo")

info.forEach(element => {
    let profile = document.createElement("img")
    profile.className = "profile"
    profile.src = element.profile
    docId(element.name).append(profile)
    console.log(element)
})