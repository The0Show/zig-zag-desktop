import { Settings } from "shared/settings";
import { invoke, sendSync } from "./ipc";
import { handleRenderer } from "./utils/ipcUtils";
import { UpdateDownloadedEvent } from "electron-updater";

type DownloadProgressCallback = (p: number) => void;
type DownloadCompletedCallback = (i: UpdateDownloadedEvent) => void;
let onDownloadProgress: DownloadProgressCallback = () => { };
let onDownloadCompleted: DownloadCompletedCallback = () => { };

type SetTrackGemmedCallback = (g: boolean) => void;
let onTrackGemmedCallback: SetTrackGemmedCallback = () => { };

handleRenderer("updater:progress", (e, p) => onDownloadProgress(p));
handleRenderer("updater:downloaded", (e, i) => onDownloadCompleted(i));
handleRenderer("player:set_gemmed", (e, g) => onTrackGemmedCallback(g));

export const ZigZagDesktop = {
    app: {
        relaunch: () => invoke("app:relaunch"),
        getVersion: () => sendSync("app:get_version")
    },
    tray: {
        setLoggedIn: (loggedIn: boolean) => invoke("tray:set_logged_in", loggedIn),
        setTrackGemmed: (gemmed: boolean) => invoke("tray:set_gemmed", gemmed),
    },
    player: {
        setTrackGemmed: (cb: SetTrackGemmedCallback) => {
            onTrackGemmedCallback = cb;
        }
    },
    updater: {
        applyUpdates: () => sendSync("updater:apply"),
        checkForUpdates: () => invoke("updater:check_for_updates"),
        getEnabled: () => invoke("updater:enabled"),
        getStatus: () => invoke("updater:status"),
        onDownloadProgress: (cb: DownloadProgressCallback) => {
            onDownloadProgress = cb;
        },
        onDownloadCompleted: (cb: DownloadCompletedCallback) => {
            onDownloadCompleted = cb;
        }
    },
    settings: {
        get: () => sendSync("settings:get"),
        set: (settings: Settings, path?: string) => invoke("settings:set", settings, path)
    }
}
