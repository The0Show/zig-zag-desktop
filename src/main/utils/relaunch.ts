import { app } from "electron/main";

export async function relaunch() {
    if (app.isPackaged && process.env.APPIMAGE) {
        // app.relaunch() would start the binary inside the AppImage mount, which is gone once we exit
        app.relaunch({
            execPath: process.env.APPIMAGE,
            args: [...process.argv.slice(1), "--appimage-extract-and-run"] // without this, AppImage won't relaunch https://github.com/electron-userland/electron-builder/issues/4650
        });
    } else {
        app.relaunch();
    }

    app.quit();
}
