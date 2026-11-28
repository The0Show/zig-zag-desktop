import { app } from "electron/main";

export function getVersionString() {
    return `v${app.getVersion()}${IS_DEV ? " (dev)" : ""}`
}
