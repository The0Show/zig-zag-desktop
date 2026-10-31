import ZigZagApp from "./app";
import Player from "mpris-service";

type TrackMetadata = {
    trackId?: string,
    title?: string,
    album?: string,
    artist?: string,
    cover?: string,
    length?: number
};

export default class DBus {
    private static _instance: DBus;

    app: ZigZagApp
    player: any;

    constructor() {
        DBus._instance = this;

        this.player = new Player({
            name: "zigzag",
            identity: "zig~zag desktop",
            supportedInterfaces: ['player']
        });

        this.player.playbackStatus = 'Playing';
    }

    updateMetadata(p_metadata: TrackMetadata) {
        this.player.metadata = {
            "mpris:trackid": p_metadata.trackId ? this.player.objectPath(`track/${p_metadata.trackId}`) : this.player.metadata["mpris:trackid"] ?? this.player.objectPath(`track/0`),
            "mpris:length": p_metadata.length ? p_metadata.length * 1000 * 1000 : this.player.metadata["mpris:length"],
            "mpris:artUrl": p_metadata.cover ?? this.player.metadata["mpris:artUrl"],
            'xesam:title': p_metadata.title ?? this.player.metadata["xesam:title"],
            'xesam:album': p_metadata.album ?? this.player.metadata["xesam:album"],
            'xesam:artist': p_metadata.artist ? [p_metadata.artist] : this.player.metadata["xesam:artist"]
        }
        console.log(this.player.metadata);
    }

    static getInstance() {
        return this._instance;
    }
}
