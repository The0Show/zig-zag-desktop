import { UpdateInfo } from "electron-updater";
import { Settings } from "./settings";

export interface IpcEventsInput {
    "app:relaunch": [],
    "app:get_renderer_script": [],
    "app:get_version": [],
    "settings:get": [],
    "settings:set": [settings: Settings, path?: string]
    "updater:check_for_updates": [],
    "updater:progress": [progress: number]
}

export interface IpcEventsOutput {
    "app:relaunch": void,
    "app:get_renderer_script": string,
    "app:get_version": string,
    "settings:get": Settings,
    "settings:set": void,
    "updater:check_for_updates": { isUpdateAvailable: boolean, info?: UpdateInfo },
    "updater:progress": void;
}

export type IpcEvents = keyof IpcEventsInput | keyof IpcEventsOutput;
