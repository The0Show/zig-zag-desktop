import { app, BrowserWindow, nativeTheme } from "electron";
import { createWindow, mainWindow } from "./mainWindow";
import { showWindow } from "./utils/showWindow";
import "./ipc";

export let enableHardwareAcceleration = true;

function init() {
    const enabledFeatures = new Set(app.commandLine.getSwitchValue("enable-features").split(","));
    const disabledFeatures = new Set(app.commandLine.getSwitchValue("disable-features").split(","));
    app.commandLine.removeSwitch("enable-features");
    app.commandLine.removeSwitch("disable-features");

    app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

    disabledFeatures.add("HardwareMediaKeyHandling");
    disabledFeatures.add("MediaSessionService");

    disabledFeatures.forEach(feat => enabledFeatures.delete(feat));

    if (enabledFeatures.size) {
        const featuresArray = [...enabledFeatures].filter(Boolean);
        app.commandLine.appendSwitch("enable-features", featuresArray.join(","));

        console.log("Enabled Chromium features:", featuresArray.join(", "))
    }

    if (disabledFeatures.size) {
        const featuresArray = [...disabledFeatures].filter(Boolean);
        app.commandLine.appendSwitch("disable-features", featuresArray.join(","));

        console.log("Disabled Chromium features:", featuresArray.join(", "))
    }

    app.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
        if (!mainWindow) return;
        showWindow(mainWindow);
    })

    app.whenReady().then(async () => {
        bootstrap();

        app.on("activate", () => {
            if (BrowserWindow.getAllWindows().length == 0) createWindow();
        })
    })
}

async function bootstrap() {
    createWindow();
}

if (!app.requestSingleInstanceLock({ IS_DEV })) {
    if (IS_DEV) {
        console.log("zig~zag desktop is already running. Quitting previous instance...");
        init();
    } else {
        console.log("zig~zag desktop is already running. Quitting...");
        app.quit();
    }
} else {
    init();
}

export let darwinURL: string | undefined;
app.on("open-url", (_, url) => {
    if (mainWindow) {
        showWindow(mainWindow);
    } else {
        darwinURL = url;
    }
});
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
