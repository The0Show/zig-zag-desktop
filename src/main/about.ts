import { getVersionString } from "./version";
import { BrowserWindow, dialog, MessageBoxOptions } from "electron/main";

export default function displayAboutWindow(win: BrowserWindow) {
    const options: MessageBoxOptions = {
        title: "About",
        message: "zig~zag desktop",
        detail: `${getVersionString()}\n${BUILD_TIMESTAMP}\n\n(c) 2026 the0show\nNot affiliated with zig-zag.fm SAS.`,
        type: "info",
        buttons: ["Close"]
    }

    if (win && !win.isDestroyed()) dialog.showMessageBox(win, options);
    else dialog.showMessageBox(options);
}
