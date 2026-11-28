import { Settings } from "shared/settings";
import { invoke, sendSync } from "./ipc";
import { handleRenderer } from "./utils/ipcUtils";
import { UpdateDownloadedEvent } from "electron-updater";

type DownloadProgressCallback = (p: number) => void;
type DownloadCompletedCallback = (i: UpdateDownloadedEvent) => void;

let onDownloadProgress: DownloadProgressCallback = () => { };
let onDownloadCompleted: DownloadCompletedCallback = () => { };

handleRenderer("updater:progress", (e, p) => onDownloadProgress(p));
handleRenderer("updater:downloaded", (e, i) => onDownloadCompleted(i));

export const ZigZagDesktop = {
    app: {
        relaunch: () => invoke("app:relaunch"),
        getVersion: () => sendSync("app:get_version")
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
