import { Rectangle } from "electron/utility";

export interface Settings {
    tray: boolean;
    minimizeToTray: boolean;
    disableSmoothScroll: boolean;
    hardwareVideoAcceleration: boolean;
    downloadPreleaseBuilds: boolean;
}
