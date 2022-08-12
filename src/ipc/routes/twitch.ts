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
            const follows = await apiClient.users.getFollows({ followedUser: i.id, limit: 1 });
            const isStream = await apiClient.streams.getStreamByUserId(i.id) ? true : false;
            info.push({
                "name": i.name,
                "displayName": i.displayName,
                "profile": i.profilePictureUrl,
                "id": i.id,
                "follows": follows.total,
                "isStream": isStream
            });
        }
        return info;
    }
}