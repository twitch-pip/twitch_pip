"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../constants");
const channel_1 = __importDefault(require("../channel"));
class Twitch {
    streamerStates(event, input, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            const streamers = constants_1.__store__.get("order", []);
            const res = yield apiClient.users.getUsersByNames(streamers);
            let info = [];
            for (const i of res) {
                let tmp = {
                    "name": i.name,
                    "displayName": i.displayName,
                };
                if (input != "edit") {
                    const follows = yield apiClient.users.getFollows({ followedUser: i.id, limit: 1 });
                    const isStream = (yield apiClient.streams.getStreamByUserId(i.id)) ? true : false;
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
        });
    }
}
__decorate([
    (0, channel_1.default)("twitch", "streamerStates")
], Twitch.prototype, "streamerStates", null);
exports.default = Twitch;
