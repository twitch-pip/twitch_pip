import { app } from "electron";
import Channel from "../ipc";

export default class App {
    @Channel("app", "getVersion")
    getVersion() {
        return app.getVersion();
    }

    @Channel("app", "quit")
    quit() {
        app.quit();
    }
}