import { autoUpdater, UpdateInfo } from "electron-updater";
import { handle, handleSync, sendToRenderer } from "./utils/ipcUtils";
import { Settings } from "./settings";

let updateInfo: UpdateInfo | null = null;
let pendingRestart: boolean = false;
let updateDownloading: boolean = false;

autoUpdater.fullChangelog = true;
autoUpdater.allowDowngrade = true;
autoUpdater.allowPrerelease = Settings.store.downloadPreleaseBuilds;

Settings.addChangeListener("downloadPreleaseBuilds", () => {
    autoUpdater.allowPrerelease = Settings.store.downloadPreleaseBuilds;
})

autoUpdater.on("download-progress", (p) => {
    updateDownloading = true;
    sendToRenderer("updater:progress", p.percent);
});

autoUpdater.on("update-downloaded", (i) => {
    updateDownloading = false;
    pendingRestart = true;
    sendToRenderer("updater:downloaded", i);
});

handle("updater:enabled", async () => {
    return autoUpdater.isUpdaterActive();
})

handle("updater:check_for_updates", async () => {
    try {
        var res = await autoUpdater.checkForUpdates();
    } catch (err) {
        console.error(err);
        return { isUpdateAvailable: false };
    }

    if (res?.isUpdateAvailable && res.updateInfo) {
        updateInfo = res.updateInfo;
        updateDownloading = true;
        return { isUpdateAvailable: res.isUpdateAvailable, info: res.updateInfo }
    }
    return { isUpdateAvailable: false };
});

handle("updater:status", async () => {
    return { info: updateInfo, updateDownloading, pendingRestart };
});

handleSync("updater:apply", () => {
    if (pendingRestart) autoUpdater.quitAndInstall();
})
