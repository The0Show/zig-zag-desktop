import { ipcRenderer } from "electron/renderer";
import { IpcEvents, IpcEventsInput, IpcEventsOutput } from "shared/IpcEvents";

export function invoke<T extends IpcEvents>(event: T, ...args: IpcEventsInput[T]) {
    return ipcRenderer.invoke(event, ...args) as Promise<IpcEventsOutput[T]>;
}

export function sendSync<T extends IpcEvents>(event: T, ...args: IpcEventsInput[T]) {
    return ipcRenderer.sendSync(event, ...args) as IpcEventsOutput[T];
}
