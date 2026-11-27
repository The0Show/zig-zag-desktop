import { SettingsStore } from "shared/utils/SettingsStore";

interface ZigZagSettingBase {
    title: string;
    description?: string;
    logic?(element: HTMLDivElement): void;
    clean?(): void;
    disabled?(): boolean;
    invisible?(): boolean;
}

interface ZigZagSettingAction extends ZigZagSettingBase {
    type: "action";
    label: string;
    action(button: HTMLButtonElement): void;
}

interface ZigZagSettingConfigurable extends ZigZagSettingBase {
    key: keyof typeof Settings.store;
}

interface ZigZagSettingBoolean extends ZigZagSettingConfigurable {
    type: "boolean";
}

type ZigZagSetting = ZigZagSettingAction | ZigZagSettingBoolean;

export const Settings = new SettingsStore(ZigZagDesktop.settings.get());
Settings.addGlobalChangeListener((o, p) => ZigZagDesktop.settings.set(o, p));

const config: ZigZagSetting[] = [
    {
        type: "action",
        title: `zig~zag desktop v${ZigZagDesktop.app.getVersion()}`,
        description: `${COMMIT}`,
        label: "Check for updates",
        logic(elem) {
            ZigZagDesktop.updater.onDownloadProgress((p) => {
                elem.querySelector("button")!.innerText = `Downloading ${p.toFixed(0)}%`
            })
        },
        async action(button) {
            button.disabled = true;
            const { isUpdateAvailable, info } = await ZigZagDesktop.updater.checkForUpdates();

            if (!isUpdateAvailable) {
                button.innerText = "Up to date";
                button.disabled = false;
            } else {

            }
        }
    },
    {
        key: "tray",
        type: "boolean",
        title: "Tray icon",
        description: "Adds a tray icon for zig~zag"
    }
]

function updateToggleVisualState(p_toggle: HTMLButtonElement, p_value: boolean) {
    const label = p_toggle.children.item(0) as HTMLSpanElement;
    label.classList.remove(
        "text-white/55",
        "text-white/90"
    );
    label.classList.add(p_value ? "text-white/90" : "text-white/55");
    label.innerText = p_value ? "ON" : "OFF";

    const toggle = p_toggle.children.item(1) as HTMLSpanElement;
    toggle.classList.remove("border-white/40", "border-white/20");
    toggle.classList.add(p_value ? "border-white/40" : "border-white/20");

    const handle = toggle.children.item(0) as HTMLSpanElement;
    handle.classList.remove(
        "translate-x-4", "translate-x-0",
        "bg-white/90", "bg-white/45"
    );
    handle.classList.add(
        p_value ? "translate-x-4" : "translate-x-0",
        p_value ? "bg-white/90" : "bg-white/45"
    )
}

export async function buildSettings(p_parent: HTMLDivElement) {
    for (var i = 0; i < config.length; i++) {
        const setting = config[i];
        const LABEL_ID = `_zzd_${i}_`;

        const root = document.createElement("div");
        root.classList.add("flex", "items-center", "justify-between", "gap-3", "py-1.5");

        const labelContainer = document.createElement("div");
        labelContainer.classList.add("flex", "min-w-0", "flex-col", "gap-0.5");

        const settingNameElem = document.createElement("span");
        settingNameElem.id = LABEL_ID;
        settingNameElem.classList.add("text-xs", "text-white/85");
        settingNameElem.innerText = setting.title;
        labelContainer.appendChild(settingNameElem);

        if (setting.description) {
            const settingHelpElem = document.createElement("span");
            settingHelpElem.classList.add("text-micro", "text-white/40");
            settingHelpElem.innerText = setting.description;
            labelContainer.appendChild(settingHelpElem);
        }

        root.appendChild(labelContainer);

        switch (setting.type) {
            case "boolean": {
                const cvar = Settings.plain[setting.key];

                const button = document.createElement("button");
                button.type = "button";
                button.role = "switch";
                button.setAttribute("aria-checked", cvar ? "true" : "false");
                button.setAttribute("aria-labelledby", LABEL_ID);
                button.classList.add(
                    "group",
                    "flex",
                    "shrink-0",
                    "cursor-pointer",
                    "items-center",
                    "gap-1.5",
                    "bg-transparent",
                    "p-0",
                    "transition-opacity",
                    "duration-150",
                    "focus-visible:outline",
                    "focus-visible:outline-1",
                    "focus-visible:outline-offset-2",
                    "focus-visible:outline-white/30",
                    "active:opacity-80",
                    "disabled:pointer-events-none",
                    "disabled:opacity-30"
                );

                const buttonLabel = document.createElement("span");
                buttonLabel.setAttribute("aria-hidden", "true");
                buttonLabel.classList.add(
                    "w-6",
                    "text-right",
                    "font-display",
                    "text-micro",
                    "font-normal",
                    "tracking-wider",
                    cvar ? "text-white/90" : "text-white/55"
                );
                buttonLabel.innerText = cvar ? "ON" : "OFF";
                button.appendChild(buttonLabel);

                const toggle = document.createElement("span");
                toggle.setAttribute("aria-hidden", "true");
                toggle.classList.add(
                    "relative",
                    "block",
                    "h-4",
                    "w-8",
                    "rounded-[var(--border-radius)]",
                    "border",
                    "transition-colors",
                    "duration-150",
                    cvar ? "border-white/40" : "border-white/20",
                    "group-hover:border-white/35"
                );
                if (cvar) toggle.classList.add("bg-transparent");

                const handle = document.createElement("span");
                handle.classList.add(
                    "absolute",
                    "top-1/2",
                    "left-px",
                    "h-3",
                    "w-3",
                    "-translate-y-1/2",
                    "rounded-[var(--border-radius)]",
                    "transition-[translate,background-color]",
                    "duration-150",
                    cvar ? "translate-x-4" : "translate-x-0",
                    cvar ? "bg-white/90" : "bg-white/45"
                );

                toggle.appendChild(handle);
                button.appendChild(toggle);

                button.onclick = async () => {
                    Settings.store[setting.key] = !Settings.store[setting.key];

                    updateToggleVisualState(button, Settings.store[setting.key]);
                }

                root.appendChild(button);
                break;
            }
            case "action": {
                const container = document.createElement("div");
                container.classList.add(
                    "flex",
                    "items-center",
                    "gap-2"
                );

                const button = document.createElement("button");
                button.type = "button";
                button.setAttribute("aria-expanded", "false");
                button.classList.add(
                    "shrink-0",
                    "rounded-[1px]",
                    "border",
                    "border-white/20",
                    "px-2",
                    "py-0.5",
                    "text-xxs",
                    "text-white/70",
                    "transition-colors",
                    "duration-150",
                    "hover:border-white/40",
                    "hover:text-white/90",
                    "focus-visible:outline",
                    "focus-visible:outline-1",
                    "focus-visible:outline-white/30",
                    "active:bg-white/10",
                    "disabled:cursor-not-allowed",
                    "disabled:opacity-50",
                    "disabled:hover:border-white/20",
                    "disabled:hover:text-white/70"
                );
                button.innerText = setting.label;
                button.onclick = setting.action.bind(root, button);

                container.appendChild(button)
                root.appendChild(container);
                break;
            }
        }

        if (setting.logic) setting.logic(root);
        p_parent.appendChild(root);
    }
}
