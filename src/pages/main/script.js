const {ipcRenderer} = require("electron")
const store = require("../../../store")

function docId(element){
    return document.getElementById(element)
}

function beautyFollows(follows){
    let first = `${(follows+"").substring(0, (follows+"").length - 4)}`
    let second = `${(follows+"").substring((follows+"").length - 4, (follows+"").length - 3)}`
    if(second*1)return `팔로워 ${first}.${second}만명` 
    else return `팔로워 ${first}만명`
}

store.store.get("order").forEach(e => {
    let div = document.createElement("div")
    div.id = e
    div.className = "panel_item"
    docId("panel").append(div)
})

let info = ipcRenderer.sendSync("getIsedolInfo")

info.forEach(element => {
    let div = document.createElement("div")
    div.className = "info"

    let profile = document.createElement("img")
    profile.className = "profile"
    profile.src = element.profile
    div.append(profile)

    let name_panel = document.createElement("div")
    //name_panel.className = "name_panel"
    
    let name = document.createElement("p")
    name.innerText = element.displayName
    name.className = "name"
    name_panel.append(name)

    let follows = document.createElement("p")
    follows.className = "follows"
    follows.innerText = beautyFollows(element.follows)
    name_panel.append(follows)
    div.append(name_panel)

    docId(element.name).append(div)

    let isStream = document.createElement("div")
    isStream.className = "is_stream"

    let streamCircle = document.createElement("span")
    streamCircle.className = "stream_circle"
    if(element.isStream) streamCircle.classList.add("stream_on")
    else streamCircle.classList.add("stream_off")
    isStream.append(streamCircle)
    docId(element.name).append(isStream)
})