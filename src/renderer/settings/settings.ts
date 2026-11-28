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

const config: ZigZagSettingBase<any>[] = [
    new ZigZagRestartRequired(),
    new ZigZagSettingAction(`zig~zag desktop v${ZigZagDesktop.app.getVersion()}`, "Check for updates")
        .setDescription(`Commit ${COMMIT.slice(0, 7)}`)
        .setSetupFunction(async (setting) => {
            const status = await ZigZagDesktop.updater.getStatus();

            if (status.info && status.pendingRestart) {
                setting.description = `v${status.info.version} will be installed after closing zig~zag`;
            }

            if (status.pendingRestart) setting.label = `Restart now`;

            updateSettings();

            ZigZagDesktop.updater.onDownloadProgress((p) => {
                setting.label = `Downloading ${p.toFixed(0)}%`;
                setting.disabled = true;
                updateSettings();
            });

            ZigZagDesktop.updater.onDownloadCompleted((i) => {
                setting.label = `Restart now`;
                setting.disabled = false;

                setting.description = `v${i.version} will be installed after closing zig~zag`;
                updateSettings();
            });
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
                updateSettings();
                const { isUpdateAvailable, info } = await ZigZagDesktop.updater.checkForUpdates();

                if (!isUpdateAvailable) {
                    setting.label = "Up to date";
                    setting.disabled = false;
                    updateSettings();
                } else {
                    setting.label = "Downloading 0%";
                    updateSettings();
                }
            } else if (pendingRestart) {
                ZigZagDesktop.updater.applyUpdates();
            }
        }),
    new ZigZagSettingBoolean("Hardware video decoding", "hardwareVideoAcceleration")
        .setDescription("Uses your GPU to decode video ~ Improves performance but can cause graphical glitches")
        .setRequiresRestart(true),
    new ZigZagSettingBoolean("Tray icon", "tray")
        .setDescription("Adds a tray icon for zig~zag desktop")
        .setRequiresRestart(true),
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
