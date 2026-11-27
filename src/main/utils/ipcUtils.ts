import { ipcMain, IpcMainEvent, IpcMainInvokeEvent, WebFrameMain } from "electron/main";
import { IpcEvents, IpcEventsInput, IpcEventsOutput } from "shared/IpcEvents";

export function validate(frame: WebFrameMain | null, event: string) {
    if (!frame) throw new Error(`ipc[${event}]: No sender frame`);
    if (!frame.url) {
        console.warn(`WARN ipc[${event}]: Frame has no URL, accepting event anyways!`)
        return;
    };

    try {
        var { hostname, protocol } = new URL(frame.url);
    } catch {
        throw new Error(`ipc[${event}]: Invalid URL ${frame.url}`);
    }
}

export function handle<T extends IpcEvents>(event: T, cb: (event: IpcMainInvokeEvent, ...args: IpcEventsInput[T]) => IpcEventsOutput[T]) {
    ipcMain.handle(event, (e, ...args: IpcEventsInput[T]) => {
        validate(e.senderFrame, event);
        return cb(e, ...args);
    })
}

export function handleSync<T extends IpcEvents>(event: T, cb: (event: IpcMainEvent, ...args: IpcEventsInput[T]) => IpcEventsOutput[T]) {
    ipcMain.on(event, (e, ...args: IpcEventsInput[T]) => {
        validate(e.senderFrame, event);
        e.returnValue = cb(e, ...args);
    })
}
