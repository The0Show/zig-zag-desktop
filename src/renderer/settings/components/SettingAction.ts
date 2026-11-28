import { updateSettings } from "../settings";
import ZigZagSettingBase from "./SettingBase";

type ZigZagActionCallback = (setting: ZigZagSettingAction) => void;
export default class ZigZagSettingAction extends ZigZagSettingBase<ZigZagSettingAction> {
    private _container: HTMLDivElement | null = null;
    private _button: HTMLButtonElement | null = null;

    label: string;
    disabled: boolean = false;
    action: ZigZagActionCallback = () => { };

    constructor(title: string, label: string) {
        super(title);
        this.label = label;
    }

    setAction(action: ZigZagActionCallback) {
        this.action = action;
        return this;
    }

    build(id: string): HTMLDivElement {
        const root = super.build(id)

        this._container = document.createElement("div");
        this._container.classList.add(
            "flex",
            "items-center",
            "gap-2"
        );

        this._button = document.createElement("button");
        this._button.type = "button";
        this._button.setAttribute("aria-expanded", "false");
        this._button.classList.add(
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
        this._button.innerText = this.label;
        this._button.onclick = () => {
            this.action(this);
            updateSettings();
        };

        this._container.appendChild(this._button)
        root.appendChild(this._container);

        return root;
    }

    update(): boolean {
        if (!super.update()) return false;

        if (!this._button) return false;
        this._button.innerText = this.label;
        this._button.disabled = this.disabled ? true : this.disabledFunction(this);
        return true;
    }

    cleanup(): void {
        this._container = null;
        this._button = null;

        super.cleanup();
    }
}
