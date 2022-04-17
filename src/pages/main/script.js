const {ipcRenderer} = require("electron")
const store = require("../../../store")



function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.panel_item:not(.dragging)')]

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect()
    const offset = y - box.top - box.height / 2
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child }
    } else {
      return closest
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element
}
                     

function docId(element){
    return document.getElementById(element)
}

function beautyFollows(follows){
    let first = `${(follows+"").substring(0, (follows+"").length - 4)}`
    let second = `${(follows+"").substring((follows+"").length - 4, (follows+"").length - 3)}`
    if(second*1)return `팔로워 ${first}.${second}만명` 
    else return `팔로워 ${first}만명`
}

function restartApp(){
    ipcRenderer.send("restart_app");
}

store.store.get("order").forEach(e => {
    let div = document.createElement("div")
    div.id = e
    div.className = "panel_item"
    div.draggable = true
    docId("panel").append(div)
})

ipcRenderer.send("app_version");
ipcRenderer.on("app_version_reply", (evt, arg) => {
    ipcRenderer.removeAllListeners("app_version_reply");
    docId("version_num").innerText = "Version: " + arg.version;
})

ipcRenderer.on("update_downloaded", () => {
    ipcRenderer.removeAllListeners("update_downloaded");
    docId("version_update").innerHTML = "<a href='javascript:restartApp()'>Update is available</a>";
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

const draggables = document.querySelectorAll('.panel_item')
const containers = document.querySelectorAll('#panel')

draggables.forEach(draggable => {
  draggable.addEventListener('dragstart', () => {
    draggable.classList.add('dragging')
  })

  draggable.addEventListener('dragend', () => {
    draggable.classList.remove('dragging')
    store.store.set("order", Array.from(document.querySelectorAll('.panel_item')).map(e => e.id))
  })
})

containers.forEach(container => {
  container.addEventListener('dragover', e => {
    e.preventDefault()
    const afterElement = getDragAfterElement(container, e.clientY)
    const draggable = document.querySelector('.dragging')
    if (afterElement == null) {
      container.appendChild(draggable)
    } else {
      container.insertBefore(draggable, afterElement)
    }
  })
})