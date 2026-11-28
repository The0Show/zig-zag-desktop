import { autoUpdater, UpdateInfo } from "electron-updater";
import { handle, handleSync, sendToRenderer } from "./utils/ipcUtils";

let updateInfo: UpdateInfo;
let updateDownloaded: boolean = false;

autoUpdater.autoInstallOnAppQuit = false;
autoUpdater.fullChangelog = true;

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
    const res = await autoUpdater.checkForUpdates();

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
