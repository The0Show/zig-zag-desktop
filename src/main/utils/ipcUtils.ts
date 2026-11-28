import { ipcMain, IpcMainEvent, IpcMainInvokeEvent, WebFrameMain } from "electron/main";
import { ZIG_ZAG_HOSTNAMES } from "main/constants";
import { mainWindow } from "main/mainWindow";
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

    if (!ZIG_ZAG_HOSTNAMES.includes(hostname)) throw new Error(`ipc[${event}]: Disallowed hostname ${hostname}`);
}

export function handle<T extends IpcEvents>(event: T, cb: (event: IpcMainInvokeEvent, ...args: IpcEventsInput[T]) => Promise<IpcEventsOutput[T]>) {
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

export function sendToRenderer<T extends IpcEvents>(event: T, ...args: IpcEventsInput[T]) {
    if (!mainWindow) return;
    mainWindow.webContents.send(event, ...args);
}
