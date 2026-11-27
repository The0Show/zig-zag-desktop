import { Settings } from "shared/settings";
import { invoke, sendSync } from "./ipc";
import { handleRenderer } from "./utils/ipcUtils";

type DownloadProgressCallback = (p: number) => void;

let onDownloadProgress: DownloadProgressCallback = () => { };

handleRenderer("updater:progress", (e, p) => onDownloadProgress(p));

export const ZigZagDesktop = {
    app: {
        relaunch: () => invoke("app:relaunch"),
        getVersion: () => sendSync("app:get_version")
    },
    updater: {
        checkForUpdates: () => invoke("updater:check_for_updates"),
        onDownloadProgress: (cb: DownloadProgressCallback) => {
            onDownloadProgress = cb;
        }
    },
    settings: {
        get: () => sendSync("settings:get"),
        set: (settings: Settings, path?: string) => invoke("settings:set", settings, path)
    }
}
