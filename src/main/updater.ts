import { autoUpdater } from "electron-updater";
import { handle } from "./utils/ipcUtils";

autoUpdater.fullChangelog = true;

autoUpdater.on("download-progress", (p) => {

});

// autoUpdater.on("update-downloaded", () => {
//     autoUpdater.quitAndInstall();
// })

handle("updater:check_for_updates", async () => {
    const res = await autoUpdater.checkForUpdates();

    if (res?.isUpdateAvailable && res.updateInfo) {
        return { isUpdateAvailable: res.isUpdateAvailable, info: res.updateInfo }
    }
    return { isUpdateAvailable: false };
});
