import { app, BrowserWindow, Menu, Tray } from "electron/main";
import { showWindow } from "./utils/showWindow";
import { getRootFSPath } from "./rootfs";
import { Settings } from "./settings";

let tray: Tray;

export function initTray(window: BrowserWindow) {
    if (!Settings.store.tray) return;

    const menu = Menu.buildFromTemplate([
        {
            label: "Show zig~zag",
            click() { showWindow(window) }
        },
        { type: "separator" },
        {
            label: "Quit",
            click() {
                app.quit();
            }
        }
    ])

    tray = new Tray(getRootFSPath("img/logoicon.png"));
    tray.setToolTip("zig~zag desktop");
    tray.setContextMenu(menu);
    tray.on("click", () => {
        if (window.isVisible() && !window.isMinimized()) window.hide();
        else showWindow(window);
    });
}
