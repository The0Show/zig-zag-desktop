import { app, BrowserWindow, Menu, MenuItem, Tray } from "electron/main";
import { showWindow } from "./utils/showWindow";
import { getRootFSPath } from "./rootfs";
import { Settings } from "./settings";
import { mainWindow } from "./mainWindow";
import { handle, sendToRenderer } from "./utils/ipcUtils";

let tray: Tray | undefined;

export function destroyTray() {
    tray?.destroy();
    tray = undefined;
}

const loggedOutMenu = Menu.buildFromTemplate([
    {
        label: "Show zig~zag",
        click() { showWindow(mainWindow) }
    },
    { type: "separator" },
    {
        label: "Quit",
        click() {
            app.quit();
        }
    }
]);

let loggedIn: boolean = true;
let gemmed: boolean = false;
const modes: { title: string, description: string }[] = [];

export function updateTrayMenu() {
    if (!tray) return;

    const menu = new Menu();

    menu.append(new MenuItem({ label: "Show zig~zag", click() { showWindow(mainWindow) } }));
    menu.append(new MenuItem({ type: "separator" }));

    if (loggedIn) {
        menu.append(new MenuItem({
            label: "Gem track",
            type: "checkbox",
            checked: gemmed,
            click(i) {
                sendToRenderer("player:set_gemmed", i.checked);
            }
        }));
        menu.append(new MenuItem({ type: "separator" }));
    }

    menu.append(new MenuItem({ label: "Quit", role: "quit", accelerator: "" }));

    tray.setContextMenu(menu);
}

export function initTray(window: BrowserWindow) {
    if (!Settings.store.tray) return;

    tray = new Tray(getRootFSPath("img/logoicon.png"));
    tray.setToolTip("zig~zag desktop");

    updateTrayMenu();

    tray.on("click", () => {
        if (window.isVisible() && !window.isMinimized()) window.hide();
        else showWindow(window);
    });
}

handle("tray:set_gemmed", async (event, p_gemmed) => {
    gemmed = p_gemmed;
    updateTrayMenu();
})
