import { autoUpdater, UpdateInfo } from "electron-updater";
import { handle, handleSync, sendToRenderer } from "./utils/ipcUtils";
import { Settings } from "./settings";

let updateInfo: UpdateInfo | null = null;
let updateDownloaded: boolean = false;

autoUpdater.fullChangelog = true;
autoUpdater.allowPrerelease = Settings.store.downloadPreleaseBuilds;

Settings.addChangeListener("downloadPreleaseBuilds", () => {
    autoUpdater.allowPrerelease = Settings.store.downloadPreleaseBuilds;
})

autoUpdater.on("download-progress", (p) => {
    sendToRenderer("updater:progress", p.percent);
});

autoUpdater.on("update-downloaded", (i) => {
    updateDownloaded = true;
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
        return { isUpdateAvailable: res.isUpdateAvailable, info: res.updateInfo }
    }
    return { isUpdateAvailable: false };
});

handle("updater:status", async () => {
    return { info: updateInfo, pendingRestart: updateDownloaded };
});

handleSync("updater:apply", () => {
    if (updateDownloaded) autoUpdater.quitAndInstall();
})
