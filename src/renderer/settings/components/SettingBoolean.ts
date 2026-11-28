import ZigZagSettingConfigurable from "./SettingConfig";
import { markRestartRequired, Settings, updateSettings } from "../settings";

export default class ZigZagSettingBoolean extends ZigZagSettingConfigurable<ZigZagSettingBoolean> {
    private _button: HTMLButtonElement | null = null;
    private _label: HTMLSpanElement | null = null;
    private _toggle: HTMLSpanElement | null = null;
    private _handle: HTMLSpanElement | null = null;

    constructor(title: string, key: keyof typeof Settings.store) {
        super(title, key);
    }

    build(id: string): HTMLDivElement {
        const root = super.build(id);

        this._button = document.createElement("button");
        this._button.type = "button";
        this._button.role = "switch";
        this._button.setAttribute("aria-labelledby", id);
        this._button.classList.add(
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

        this._label = document.createElement("span");
        this._label.setAttribute("aria-hidden", "true");
        this._label.classList.add(
            "w-6",
            "text-right",
            "font-display",
            "text-micro",
            "font-normal",
            "tracking-wider"
        );
        this._button.appendChild(this._label);

        this._toggle = document.createElement("span");
        this._toggle.setAttribute("aria-hidden", "true");
        this._toggle.classList.add(
            "relative",
            "block",
            "h-4",
            "w-8",
            "rounded-[var(--border-radius)]",
            "border",
            "transition-colors",
            "duration-150",
            "group-hover:border-white/35"
        );

        this._handle = document.createElement("span");
        this._handle.classList.add(
            "absolute",
            "top-1/2",
            "left-px",
            "h-3",
            "w-3",
            "-translate-y-1/2",
            "rounded-[var(--border-radius)]",
            "transition-[translate,background-color]",
            "duration-150"
        );

        this._toggle.appendChild(this._handle);
        this._button.appendChild(this._toggle);

        this._button.onclick = async () => {
            this._onChangeCallback(this);

            Settings.store[this.key] = !Settings.store[this.key];
            this._changed = true;

            if (this.requiresRestart) {
                markRestartRequired();
            }

            updateSettings();
        }

        root.appendChild(this._button);
        return root;
    }

    update(): boolean {
        if (!super.update()) return false;

        if (!this._button || !this._label || !this._toggle || !this._handle) return false;

        const value = Settings.plain[this.key];
        this._button.setAttribute("aria-checked", JSON.stringify(value));

        this._label.classList.remove(
            "text-white/55",
            "text-white/90"
        );
        this._label.classList.add(value ? "text-white/90" : "text-white/55");
        this._label.innerText = value ? "ON" : "OFF";

        this._toggle.classList.remove("border-white/40", "border-white/20");
        this._toggle.classList.add(value ? "border-white/40" : "border-white/20");

        this._handle.classList.remove(
            "translate-x-4", "translate-x-0",
            "bg-white/90", "bg-white/45"
        );
        this._handle.classList.add(
            value ? "translate-x-4" : "translate-x-0",
            value ? "bg-white/90" : "bg-white/45"
        );

        this._button.disabled = this._disabledFunction(this);
        return true;
    }

    cleanup(): void {
        this._button = null;
        this._handle = null;
        this._label = null;
        this._toggle = null;

        super.cleanup();
    }
}
