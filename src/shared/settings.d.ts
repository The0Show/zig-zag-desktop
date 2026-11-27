import { Rectangle } from "electron/utility";

export interface Settings {
    tray: boolean;
    disableSmoothScroll: boolean;
    hardwareAcceleration: boolean;
    hardwareVideoAcceleration: boolean;
}
