import { BrowserWindow, Notification, Tray } from "electron";
import { app, ipcMain, Menu } from "electron/main";
import { join } from "path";
import { platform } from "process";
import { ConVar, ConVarRegistry, FCVarFlags } from "./Console";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { pack, unpack } from "msgpackr"
import DBus from "./dbus";

const ICON_PATH = join(process.cwd(), "dist", "img", "logoicon.png");
const STORE_PATH = join(app.getPath('userData'), "Config")

if (!existsSync(STORE_PATH)) {
    mkdirSync(STORE_PATH)
}

ConVar.restoreFunction = (cvar) => {
    const PATH = join(STORE_PATH, cvar.varName);
    if (existsSync(PATH)) {
        return unpack(readFileSync(PATH));
    }
}

ConVar.storeFunction = (cvar, value) => {
    const PATH = join(STORE_PATH, cvar.varName);
    writeFileSync(PATH, pack(value));
    return true;
}

ConVar.resetFunction = (cvar) => {
    const PATH = join(STORE_PATH, cvar.varName);
    if (existsSync(PATH)) {
        rmSync(PATH);
    }
}

const has_displayed_tray_infobox = new ConVar<boolean>("has_displayed_tray_infobox", false, FCVarFlags.FCVAR_ARCHIVE);

const window_width = new ConVar<number>("window_width", 1080, FCVarFlags.FCVAR_ARCHIVE);
const window_height = new ConVar<number>("window_height", 720, FCVarFlags.FCVAR_ARCHIVE);
const window_maximized = new ConVar<boolean>("window_maximized", false, FCVarFlags.FCVAR_ARCHIVE);

const zz_minimize_to_tray = new ConVar<boolean>("zz_minimize_to_tray", true, FCVarFlags.FCVAR_ARCHIVE);
const zz_song_notification = new ConVar<boolean>("zz_song_notification", false, FCVarFlags.FCVAR_ARCHIVE);
const zz_unix_enable_mpris = new ConVar<boolean>("zz_unix_enable_mpris", true, FCVarFlags.FCVAR_ARCHIVE);

export default class ZigZagApp {
    splashWindow: BrowserWindow;
    mainWindow: BrowserWindow;
    tray: Tray;
    dbus: DBus;

    position: number = 0;

    startup(p_splash: boolean = true) {
        this.createIpcHandlers();

        if (p_splash) this.createSplashWindow();

        this.createMainWindow(true);
        this.createTray();
        this.createDbus();
    }

    private _setMenuBar(p_window: BrowserWindow) {
        const devMenu = Menu.buildFromTemplate([
            { label: "Devtools", click: () => this.mainWindow.webContents.toggleDevTools() }
        ]);
        p_window.setMenu(devMenu);
    }

    createTray() {
        this.tray = new Tray(ICON_PATH);

        const navigateMenu = Menu.buildFromTemplate([
            { label: "navigate", click: () => { this.mainWindow.webContents.send("set-navigate-mode", "navigate") } },
            { label: "community", click: () => { this.mainWindow.webContents.send("set-navigate-mode", "community") } },
            { label: "surprise me", click: () => { this.mainWindow.webContents.send("set-navigate-mode", "surprise") } },
        ]);

        const trayMenu = Menu.buildFromTemplate([
            { label: "show zig~zag", click: this.createMainWindow.bind(this, true) },
            { type: "separator" },
            { id: "doNavigate", label: "navigate", click: () => { this.mainWindow.webContents.send("next-requested") } },
            { label: "nav mode", submenu: navigateMenu },
            { type: "separator" },
            { label: "explore random", click: () => { this.mainWindow.webContents.send("explore-requested") } },
            { label: "previous", click: () => { this.mainWindow.webContents.send("previous-requested") } },
            { type: "separator" },
            { label: "quit", click: this.shutdown.bind(this) }
        ]);

        this.tray.on("click", this.createMainWindow.bind(this, true))
        this.tray.setContextMenu(trayMenu);
    }

    createSplashWindow() {
        this.splashWindow = new BrowserWindow({
            title: "zig~zag",
            skipTaskbar: true,
            width: 540,
            height: 370,
            center: true,
            frame: false,
            webPreferences: {
                preload: join(process.cwd(), "dist", "preload", "splash.js")
            }
        });

        this._setMenuBar(this.splashWindow);
        this.splashWindow.loadFile(join("./www", "splash.html"));
    }

    createMainWindow(p_show: boolean = false) {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.show();
            return;
        }

        this.mainWindow = new BrowserWindow({
            title: "zig~zag",
            width: window_width.value,
            height: window_height.value,
            show: p_show,
            center: true,
            webPreferences: {
                preload: join(process.cwd(), "dist", "preload", "main.js")
            }
        })
        this.mainWindow.webContents.toggleDevTools();
        if (window_maximized.value) this.mainWindow.maximize();

        this.mainWindow.on("maximize", () => {
            window_maximized.value = true;
        })
        this.mainWindow.on("unmaximize", () => {
            window_maximized.value = false;
        })
        this.mainWindow.on("resize", () => {
            if (!window_maximized.value) {
                window_width.value = this.mainWindow.getSize()[0];
                window_height.value = this.mainWindow.getSize()[1];
            }
        })
        this.mainWindow.on("close", (ev) => {
            ev.preventDefault();
            this.mainWindow.hide();

            if (!has_displayed_tray_infobox.value) {
                new Notification({
                    title: "hey, over here!",
                    body: "zig~zag desktop has been minimized to the tray.\nClick on the icon to re-open the window, or right click for more options.",
                    icon: ICON_PATH,
                }).show();
                has_displayed_tray_infobox.value = true;
            }
        });
        this.mainWindow.webContents.on("preload-error", (ev, err) => {
            console.error(err);
        })
        this.mainWindow.webContents.on("did-navigate-in-page", (ev, url) => {
            if (url.includes("track~")) {
                this.dbus.updateMetadata({
                    length: 0,
                    trackId: url.replace("https://www.zig-zag.fm/", "").split("/")[1].replace("track~", "")
                });
            }
        })

        this._setMenuBar(this.mainWindow);

        this.mainWindow.webContents.userAgent = this.mainWindow.webContents.userAgent + " zig~zag desktop";
        this.mainWindow.loadURL("https://zig-zag.fm");
    }

    createIpcHandlers() {
        ipcMain.handle("frontend-loaded", () => {
            this.mainWindow.show();
            this.splashWindow.close();
        })

        ipcMain.handle("progress-update", (ev, pos) => {
            this.position = pos;
        })

        ipcMain.handle("metadata-update", (ev, data) => {
            this.dbus.updateMetadata(data);
        })

        ipcMain.handle("cvar-get", async (ev, cvar) => {
            return ConVarRegistry.get(cvar).value;
        })

        ipcMain.handle("cvar-set", async (ev, cvar, value) => {
            ConVarRegistry.get(cvar).value = value;
            return value;
        })
    }

    createDbus() {
        this.dbus = new DBus();

        this.dbus.player.getPosition = () => {
            return this.position * 1000 * 1000;
        }

        this.dbus.player.on("next", this.mainWindow.webContents.send.bind("next-requested"));
    }

    shutdown() {
        this.mainWindow.destroy();
        app.quit();
    }
}

const zigZag = new ZigZagApp();
app.whenReady().then(() => {
    zigZag.startup(false);

    app.on("activate", () => {
        zigZag.mainWindow.show();
    })

    app.on("window-all-closed", () => {

    })
})
