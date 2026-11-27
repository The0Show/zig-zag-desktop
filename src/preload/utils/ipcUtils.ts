import { ipcRenderer, IpcRendererEvent } from "electron/renderer";
import { IpcEvents, IpcEventsInput, IpcEventsOutput } from "shared/IpcEvents";

export function handleRenderer<T extends IpcEvents>(event: T, cb: (event: IpcRendererEvent, ...args: IpcEventsInput[T]) => IpcEventsOutput[T]) {
    ipcRenderer.on(event, (e, ...args: IpcEventsInput[T]) => {
        cb(e, ...args);
    })
}
