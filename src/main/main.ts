import { app, BrowserWindow, nativeTheme } from "electron";
import { createWindow, mainWindow } from "./mainWindow";
import { showWindow } from "./utils/showWindow";

import "./ipc";
import "./updater";
import { Settings } from "./settings";

export let enableHardwareAcceleration = true;

const isLinux = process.platform === "linux";

function init() {
    const { disableSmoothScroll, hardwareVideoAcceleration } = Settings.store;

    const enabledFeatures = new Set(app.commandLine.getSwitchValue("enable-features").split(","));
    const disabledFeatures = new Set(app.commandLine.getSwitchValue("disable-features").split(","));
    app.commandLine.removeSwitch("enable-features");
    app.commandLine.removeSwitch("disable-features");

    if (hardwareVideoAcceleration) {
        enabledFeatures.add("AcceleratedVideoDecoder");

        if (isLinux) {
            enabledFeatures.add("AcceleratedVideoDecodeLinuxGL");
            enabledFeatures.add("AcceleratedVideoDecodeLinuxZeroCopyGL");
        }
    }

    if (disableSmoothScroll) {
        app.commandLine.appendSwitch("disable-smooth-scrolling");
    }

    app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

    // TODO: uncomment once support for OS media player protocols (i.e. MPRIS) is re-added

    // disabledFeatures.add("HardwareMediaKeyHandling");
    // disabledFeatures.add("MediaSessionService");

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
