import { BrowserWindow } from "electron";

export function showWindow(win: BrowserWindow) {
    if (win.isMinimized()) win.restore();
    win.show();
}
