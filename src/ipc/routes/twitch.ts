import { channel } from "diagnostics_channel";
import { app, BrowserWindow, IpcMainInvokeEvent } from "electron";
import { __store__ } from "../../constants";
import Channel from "../ipc";

export default class Twitch {
    @Channel("twitch", "streamerStates")
    async streamerStates(event: IpcMainInvokeEvent, ...args: any[]) {
        const streamers = __store__.get("order", []) as string[];
        const res = await apiClient.users.getUsersByNames(streamers);

        let info = [];
        for (const i of res) {
            let tmp = {
                "name": i.name,
                "displayName": i.displayName,
            };
            if (args[0] != "edit") {
                const follows = await apiClient.users.getFollows({ followedUser: i.id, limit: 1 });
                const isStream = await apiClient.streams.getStreamByUserId(i.id) ? true : false;
                Object.assign(tmp, {
                    "profile": i.profilePictureUrl,
                    "id": i.id,
                    "follows": follows.total,
                    "isStream": isStream
                });
            }
            info.push(tmp);
        }
        return info;
    }
}