import { SettingsStore } from "shared/utils/SettingsStore";
import ZigZagSettingBase from "./components/SettingBase";
import ZigZagSettingBoolean from "./components/SettingBoolean";
import ZigZagSettingAction from "./components/SettingAction";
import ZigZagRestartRequired from "./components/RestartRequired";

export const Settings = new SettingsStore(ZigZagDesktop.settings.get());
Settings.addGlobalChangeListener((o, p) => ZigZagDesktop.settings.set(o, p));

export let isRestartRequired = false;

export function markRestartRequired() {
    isRestartRequired = true;
    updateSettings();
}

const updater = new ZigZagSettingAction(`zig~zag desktop ${ZigZagDesktop.app.getVersion()}`, IS_DEV ? "Development build" : "Check for updates")
    .setDisabledFunction(() => IS_DEV)
    .setDescription(`Build ${COMMIT.slice(0, 7)} ~ ${BUILD_TIMESTAMP}`)
    .setSetupFunction(async (setting) => {
        ZigZagDesktop.updater.onDownloadProgress((p) => {
            setting.label = `Downloading ${p.toFixed(0)}%`;
            setting.disabled = true;
            setting.update();
        });

        ZigZagDesktop.updater.onDownloadCompleted((i) => {
            setting.label = `Restart now`;
            setting.description = `v${i.version} will be installed after closing zig~zag`;
            setting.disabled = false;
            setting.update();
        });
    })
    .setCleanupFunction(async (setting) => {
        ZigZagDesktop.updater.onDownloadProgress(() => { });
        ZigZagDesktop.updater.onDownloadCompleted(() => { });
        setting.label = IS_DEV ? "Development build" : "Check for updates";
    })
    .setUpdateFunction(async (setting) => {
        const { info, pendingRestart, updateDownloading } = await ZigZagDesktop.updater.getStatus();
        if (info && pendingRestart) {
            setting.label = `Restart now`;
            setting.description = `v${info.version} will be installed after closing zig~zag`;
            setting.disabled = false;
        } else if (updateDownloading) {
            setting.disabled = true;
            setting.update();
        } else {
            setting.description = `Build ${COMMIT.slice(0, 7)} ~ ${BUILD_TIMESTAMP}`;
            setting.disabled = false;
        }

        return true;
    })
    .setAction(async (setting) => {
        const enabled = await ZigZagDesktop.updater.getEnabled();

        if (!enabled) {
            window.open("https://github.com/The0Show/zig-zag-desktop/releases");
            return;
        };

        const { info, pendingRestart } = await ZigZagDesktop.updater.getStatus();

        if (!info) {
            setting.disabled = true;
            setting.update();
            const { isUpdateAvailable, info } = await ZigZagDesktop.updater.checkForUpdates();

            if (!isUpdateAvailable) {
                setting.label = "Up to date";
                setting.disabled = false;
                setting.update();
            } else {
                setting.label = "Downloading 0%";
                setting.disabled = true;
                setting.update();
            }
        } else if (pendingRestart) {
            ZigZagDesktop.updater.applyUpdates();
        }
    })

const config: ZigZagSettingBase<any>[] = [
    new ZigZagRestartRequired(),
    updater,
    new ZigZagSettingBoolean("Enable prerelease builds", "downloadPreleaseBuilds")
        .setChangedFunction(() => {
            updater.label = "Check for updates";
        }),
    new ZigZagSettingBoolean("Hardware video decoding", "hardwareVideoAcceleration")
        .setDescription("Uses your GPU to decode video ~ improves performance but can cause graphical glitches")
        .setRequiresRestart(true),
    new ZigZagSettingBoolean("Tray icon", "tray")
        .setDescription("Adds a tray icon for zig~zag desktop"),
    new ZigZagSettingBoolean("Minimize to tray", "minimizeToTray")
        .setDescription("Closing the window will keep zig~zag desktop open in the tray instead of closing")
        .setDisabledFunction(() => !Settings.store.tray),
    new ZigZagSettingBoolean("Disable smooth scrolling", "disableSmoothScroll")
        .setRequiresRestart(true)
]

export function updateSettings() {
    for (var i = 0; i < config.length; i++) {
        const setting = config[i];

        setting.update();
    }
}

export function cleanupSettings() {
    for (var i = 0; i < config.length; i++) {
        const setting = config[i];

        setting.cleanup();
    }
}

export async function buildSettings(p_parent: HTMLDivElement) {
    for (var i = 0; i < config.length; i++) {
        const setting = config[i];
        const LABEL_ID = `_zzd_${i}_`;

        p_parent.appendChild(setting.build(LABEL_ID));
    }

    updateSettings();
}
