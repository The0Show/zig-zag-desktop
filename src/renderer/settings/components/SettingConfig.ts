import { Settings } from "../settings";
import ZigZagSettingBase, { ZigZagSettingCallback } from "./SettingBase";

type OnChangedCallback<T> = ZigZagSettingCallback<T, void>;

export default class ZigZagSettingConfigurable<T> extends ZigZagSettingBase<T> {
    protected _changed: boolean = false;
    protected _onChangeCallback: OnChangedCallback<T> = () => { };

    readonly key: keyof typeof Settings.store;
    requiresRestart: boolean = false;

    constructor(title: string, key: keyof typeof Settings.store) {
        super(title);

        this.key = key;
    }

    setChangedFunction(cb: OnChangedCallback<T>) {
        this._onChangeCallback = cb;
        return this;
    }

    update(): boolean {
        if (!super.update()) return false;

        if (this._changed && this.requiresRestart) {
            this._settingNameElem!.style.color = "yellow";
        }

        return true;
    }

    setRequiresRestart(requiresRestart: boolean) {
        this.requiresRestart = requiresRestart;
        return this;
    }
}
