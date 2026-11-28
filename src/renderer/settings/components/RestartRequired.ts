import { isRestartRequired } from "../settings";
import ZigZagSettingAction from "./SettingAction"

export default class ZigZagRestartRequired extends ZigZagSettingAction {
    constructor() {
        super("Some settings will apply after restarting zig~zag desktop.", "Restart now");
        this.setAction(() => ZigZagDesktop.app.relaunch());
        this.setVisibleFunction(() => isRestartRequired);
    }

    build(id: string): HTMLDivElement {
        super.build(id);

        this._settingNameElem!.style.color = "yellow";
        this._settingNameElem!.classList.add("italic")

        return this._root!;
    }
}
