import { app, BrowserWindow, Menu, Tray } from "electron/main";
import { showWindow } from "./utils/showWindow";
import { getRootFSPath } from "./rootfs";

let tray: Tray;

export function initTray(window: BrowserWindow) {
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
        if (window.isVisible() && window.isFocused()) window.hide();
        else showWindow(window);
    });
}
