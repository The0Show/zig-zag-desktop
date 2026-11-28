import { Settings } from "shared/settings";

export type ZigZagSettingCallback<T, K> = (setting: T) => K;

type SetupCallback<T> = ZigZagSettingCallback<T, void>;
type UpdateCallback<T> = ZigZagSettingCallback<T, Promise<boolean>>;
type CleanupCallback<T> = ZigZagSettingCallback<T, void>;
type DisabledPredicate<T> = ZigZagSettingCallback<T, boolean>;
type VisiblePredicate<T> = ZigZagSettingCallback<T, boolean>;

export default class ZigZagSettingBase<T> {
    protected _root: HTMLDivElement | null = null;

    protected _settingNameElem: HTMLSpanElement | null = null;
    protected _settingHelpElem: HTMLSpanElement | null = null;

    protected _setupFunction: SetupCallback<T> = () => { };
    protected _updateFunction: UpdateCallback<T> = async () => true;
    protected _cleanupFunction: CleanupCallback<T> = () => { };
    protected _disabledFunction: DisabledPredicate<T> = () => false;
    protected _visibleFunction: VisiblePredicate<T> = () => true;

    title: string;
    description: string | null = null;

    constructor(title: string) {
        this.title = title;
    }

    setDescription(description: string) {
        this.description = description;
        return this;
    }

    setSetupFunction(cb: SetupCallback<T>) {
        this._setupFunction = cb;
        return this;
    }

    setUpdateFunction(cb: UpdateCallback<T>) {
        this._updateFunction = cb;
        return this;
    }

    setCleanupFunction(cb: CleanupCallback<T>) {
        this._cleanupFunction = cb;
        return this;
    }

    setDisabledFunction(cb: DisabledPredicate<T>) {
        this._disabledFunction = cb;
        return this;
    }

    setVisibleFunction(cb: VisiblePredicate<T>) {
        this._visibleFunction = cb;
        return this;
    }

    build(id: string) {
        this._root = document.createElement("div");
        this._root.classList.add("flex", "items-center", "justify-between", "gap-3", "py-1.5");
        this._root.hidden = !this._visibleFunction(this as any); // ugh

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
        this._setupFunction(this as any); // ugh

        return this._root;
    }

    shouldUpdate() {
        return this._root != null;
    }

    update(): boolean {
        if (!this._updateFunction(this as any)) return false; // ugh

        if (!this.shouldUpdate()) return false;

        this._root!.hidden = !this._visibleFunction(this as any); // ugh

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

        this._cleanupFunction(this as any); // ugh
    }
}
