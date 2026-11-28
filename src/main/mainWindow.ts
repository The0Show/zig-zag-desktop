import { app, BrowserWindow, BrowserWindowConstructorOptions, dialog, Menu, MenuItem, MessageBoxOptions } from "electron/main";
import { BrowserUserAgent } from "./constants";
import { relaunch } from "./utils/relaunch";
import { join } from "node:path";
import { destroyTray, initTray } from "./tray";
import { UrlTrust, validateUrl } from "./utils/validateUrl";
import { shell } from "electron/common";
import { Settings } from "./settings";

let isQuitting = false;

app.on("before-quit", () => {
    isQuitting = true;
});

export let mainWindow: BrowserWindow;

function buildBrowserWindowOptions() {
    const options: BrowserWindowConstructorOptions = {
        backgroundColor: "#000000",
        name: "com.the0show.zig-zag-desktop.MainWindow",
        title: "zig~zag desktop",
        webPreferences: {
            nodeIntegration: false,
            sandbox: true,
            contextIsolation: true,
            devTools: true,
            preload: join(__dirname, "preload.js"),
            spellcheck: true,
            backgroundThrottling: false
        },
        windowStatePersistence: true
    }
    return options;
}

function initMenuBar() {
    const menu = Menu.buildFromTemplate([
        {
            label: "File",
            type: "submenu",
            submenu: [
                // {
                //     label: "Sign out",
                //     accelerator: "Ctrl+Shift+W"
                // },
                {
                    label: "Quit",
                    role: "quit",
                    accelerator: "Ctrl+Shift+Q"
                }
            ]
        },
        {
            label: "View",
            type: "submenu",
            submenu: [
                {
                    label: "Zoom In",
                    role: "zoomIn",
                    accelerator: "Ctrl+="
                },
                {
                    label: "Zoom Out",
                    role: "zoomOut"
                },
                {
                    label: "Reset Zoom",
                    role: "resetZoom"
                }
            ]
        },
        {
            label: "Help",
            type: "submenu",
            submenu: [
                {
                    label: "Reload",
                    role: "forceReload"
                },
                {
                    type: "separator"
                },
                {
                    label: "Developer",
                    submenu: [
                        {
                            role: "toggleDevTools"
                        },
                        {
                            type: "separator"
                        },
                        {
                            label: "GPU Internals",
                            click: () => { openDebugPage("chrome://gpu") }
                        }
                    ]
                }
            ]
        }
    ]);

    Menu.setApplicationMenu(menu);
}

function openDebugPage(page: string) {
    const win = new BrowserWindow({
        autoHideMenuBar: true
    });

    win.on("close", () => {
        win.destroy();
    })

    win.loadURL(page);
}

function initNavigationGuard(win: BrowserWindow) {
    const onNavigate = (e: Electron.Event<{ url: string; isMainFrame: boolean }>) => {
        if (!e.isMainFrame) return;
        const trustLevel = validateUrl(e.url);
        if (trustLevel == UrlTrust.ZIG_ZAG) return;

        e.preventDefault();
    };

    win.webContents.on("will-navigate", onNavigate);
    win.webContents.on("will-redirect", onNavigate);

    win.webContents.setWindowOpenHandler(({ url, frameName, features }) => {
        try {
            var { protocol, hostname, pathname, searchParams } = new URL(url);
        } catch {
            return { action: "deny" };
        }

        if (url === "about:blank") return { action: "allow" };

        const trustLevel = validateUrl(url);

        if (trustLevel >= UrlTrust.TRUSTED) {
            shell.openExternal(url);
        } else {
            console.warn(`WARN: Not opening ${url} in browser as it is not trusted`);
        }

        return { action: "deny" };
    })
}

function initSettingsListeners(win: BrowserWindow) {
    Settings.addChangeListener("tray", (enable) => {
        if (enable) initTray(win);
        else destroyTray();
    })
}

function createMainWindow() {
    const win = (mainWindow = new BrowserWindow(buildBrowserWindowOptions()));

    win.on("close", (e) => {
        const useTray = Settings.store.minimizeToTray && Settings.store.tray;
        if (isQuitting || (process.platform != "darwin" && !useTray)) return;

        e.preventDefault();

        if (process.platform == "darwin") app.hide();
        else win.hide();

        return false;
    });

    win.on("focus", () => {
        win.flashFrame(false)
    })

    initSettingsListeners(win);
    initNavigationGuard(win);
    initMenuBar();
    initTray(win);

    win.webContents.session.setUserAgent(BrowserUserAgent);
    win.webContents.setUserAgent(BrowserUserAgent);

    win.loadURL("https://www.zig-zag.fm")
        .catch(error => showStartupError(error));

    return win;
}

export async function showStartupError(error: unknown) {
    console.error("FAILED TO START", error);

    const hasMainWindow = mainWindow && !mainWindow.isDestroyed();
    let parent = hasMainWindow ? mainWindow : null;

    const options: MessageBoxOptions = {
        type: "error",
        message: "zig~zag failed to start",
        detail: `${error}`,
        buttons: hasMainWindow ? ["Quit", "Dismiss"] : ["Quit"],
        defaultId: 0,
        cancelId: hasMainWindow ? 1 : 0
    };

    const { response } = await (parent ? dialog.showMessageBox(parent, options) : dialog.showMessageBox(options));

    if (response == 0) {
        return app.exit(1);
    }
}

export function createWindow() {
    try {
        mainWindow = createMainWindow();
    } catch (err) {
        return showStartupError(err);
    }

    mainWindow.webContents.on("unresponsive", async () => {
        const options: MessageBoxOptions = {
            type: "warning",
            message: "zig~zag is not responding",
            detail: `You can reload the window, wait to see if it recovers, or close the app.`,
            buttons: ["Relaunch", "Quit", "Keep waiting"],
        };

        const { response } = await dialog.showMessageBox(options);

        switch (response) {
            case 0: {
                relaunch();
                break;
            }

            case 1: {
                app.quit();
                break;
            }

            default: {
                break;
            }
        };
    })

    mainWindow.webContents.on("render-process-gone", async (event, details) => {
        const options: MessageBoxOptions = {
            type: "error",
            message: "Oh no!",
            detail: `zig~zag desktop unexpectedly terminated${details ? ` (#${details.exitCode ?? "<unknown>"} ${details.reason})` : ""}. Sorry about that.\nIf you'd like, you can relaunch zig~zag desktop.`,
            buttons: ["Relaunch", "Close"],
        };

        const { response } = await dialog.showMessageBox(options);

        if (response == 0) {
            relaunch();
            return;
        }
        app.quit();
    })
}
