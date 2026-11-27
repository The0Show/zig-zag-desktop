export interface IpcEventsInput {
    "app:relaunch": [],
    "app:get_version": []
}

export interface IpcEventsOutput {
    "app:relaunch": void,
    "app:get_version": string
}

export type IpcEvents = keyof IpcEventsInput | keyof IpcEventsOutput;
