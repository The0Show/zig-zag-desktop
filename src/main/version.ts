import { app } from "electron/main";

export function getVersionString() {
    return `${app.getVersion()}${IS_DEV ? " (dev)" : ""}`
}
