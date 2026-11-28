import { Settings } from "shared/settings";

type ZigZagSettingCallback<T, K> = (setting: T) => K;

export default class ZigZagSettingBase<T> {
    protected _root: HTMLDivElement | null = null;

    protected _settingNameElem: HTMLSpanElement | null = null;
    protected _settingHelpElem: HTMLSpanElement | null = null;

    title: string;
    description: string | null = null;

    setupFunction: ZigZagSettingCallback<T, void> = () => { };
    updateFunction: ZigZagSettingCallback<T, Promise<boolean>> = async () => true;
    cleanupFunction: ZigZagSettingCallback<T, void> = () => { };
    disabledFunction: ZigZagSettingCallback<T, boolean> = () => false;
    visibleFunction: ZigZagSettingCallback<T, boolean> = () => true;

    constructor(title: string) {
        this.title = title;
    }

    setDescription(description: string) {
        this.description = description;
        return this;
    }

    setSetupFunction(cb: ZigZagSettingCallback<T, void>) {
        this.setupFunction = cb;
        return this;
    }

    setUpdateFunction(cb: ZigZagSettingCallback<T, Promise<boolean>>) {
        this.updateFunction = cb;
        return this;
    }

    setCleanupFunction(cb: ZigZagSettingCallback<T, void>) {
        this.cleanupFunction = cb;
        return this;
    }

    setDisabledFunction(cb: ZigZagSettingCallback<T, boolean>) {
        this.disabledFunction = cb;
        return this;
    }

    setVisibleFunction(cb: ZigZagSettingCallback<T, boolean>) {
        this.visibleFunction = cb;
        return this;
    }

    build(id: string) {
        this._root = document.createElement("div");
        this._root.classList.add("flex", "items-center", "justify-between", "gap-3", "py-1.5");
        this._root.hidden = !this.visibleFunction(this as any); // ugh

        const labelContainer = document.createElement("div");
        labelContainer.classList.add("flex", "min-w-0", "flex-col", "gap-0.5");

        this._settingNameElem = document.createElement("span");
        this._settingNameElem.id = id;
        this._settingNameElem.classList.add("text-xs", "text-white/85");
        this._settingNameElem.innerText = this.title;
        labelContainer.appendChild(this._settingNameElem);

        if (this.description) {
            this._settingHelpElem = document.createElement("span");
            this._settingHelpElem.classList.add("text-micro", "text-white/40");
            this._settingHelpElem.innerText = this.description;
            labelContainer.appendChild(this._settingHelpElem);
        }

        this._root.appendChild(labelContainer);
        this.setupFunction(this as any); // ugh

        return this._root;
    }

    shouldUpdate() {
        return this._root != null;
    }

    update(): boolean {
        if (!this.updateFunction(this as any)) return false; // ugh

        if (!this.shouldUpdate()) return false;

        this._root!.hidden = !this.visibleFunction(this as any); // ugh

        this._settingNameElem!.innerText = this.title;
        if (this.description && this._settingHelpElem) {
            this._settingHelpElem.innerText = this.description;
        }

        return true;
    }

    cleanup() {
        this._settingNameElem = null;
        this._settingHelpElem = null;
        this._root = null;

        this.cleanupFunction(this as any); // ugh
    }
}
