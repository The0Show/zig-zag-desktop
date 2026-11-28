import { UpdateDownloadedEvent, UpdateInfo } from "electron-updater";
import { Settings } from "./settings";

export interface IpcEventsInput {
    "app:relaunch": [];
    "app:get_renderer_script": [];
    "app:get_version": [];
    "settings:get": [];
    "settings:set": [settings: Settings, path?: string];
    "updater:apply": [];
    "updater:check_for_updates": [];
    "updater:downloaded": [info: UpdateDownloadedEvent];
    "updater:enabled": [];
    "updater:status": [];
    "updater:progress": [progress: number];
}

export interface IpcEventsOutput {
    "app:relaunch": void;
    "app:get_renderer_script": string;
    "app:get_version": string;
    "settings:get": Settings;
    "settings:set": void;
    "updater:apply": void;
    "updater:check_for_updates": { isUpdateAvailable: boolean, info?: UpdateInfo };
    "updater:downloaded": void;
    "updater:enabled": boolean;
    "updater:status": { info?: UpdateInfo, pendingRestart: boolean };
    "updater:progress": void;
}

export type IpcEvents = keyof IpcEventsInput | keyof IpcEventsOutput;
