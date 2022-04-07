const axios = require("axios")
const cheerio = require("cheerio")
const {ipcRenderer} = require("electron")

const channel_name = ["cotton__123", "lilpaaaaaa", "gosegugosegu", "vo_ine", "viichan6", "jingburger"]

channel_name.forEach(data => {
    axios.get(`https://twitch.tv/${data}`).then(res=>{
        const $ = cheerio.load(res.data)
        console.log(res.data)
        console.log($("#root > div > div.Layout-sc-nxg1ff-0.qViOJ > div.Layout-sc-nxg1ff-0.kXaHWh > main > div.root-scrollable.scrollable-area > div.simplebar-scroll-content > div > div > div.channel-root.channel-root--home.channel-root--unanimated > div.Layout-sc-nxg1ff-0.dzgehN > div.channel-root__info.channel-root__info--offline.channel-root__info--home > div > div.Layout-sc-nxg1ff-0.cJNGgb.home-header-sticky > div.Layout-sc-nxg1ff-0.JrhWA > div.Layout-sc-nxg1ff-0.ZNwec").html())
        document.getElementById("panel").append($(".Layout-sc-nxg1ff-0 .ZNwec"))
    }).catch(e=>console.log(e))
})

console.log(location.href)