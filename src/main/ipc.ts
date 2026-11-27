import { app } from "electron/main";
import { handle, handleSync } from "./utils/ipcUtils";
import { relaunch } from "./utils/relaunch";

handle("app:relaunch", relaunch);
handleSync("app:get_version", () => app.getVersion())
