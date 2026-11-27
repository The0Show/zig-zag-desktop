import { app } from "electron/main";
import { handle, handleSync } from "./utils/ipcUtils";
import { relaunch } from "./utils/relaunch";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const RENDERER_JS_PATH = join(__dirname, "renderer.js");

handle("app:relaunch", relaunch);
handleSync("app:get_version", () => app.getVersion())
handleSync("app:get_renderer_script", () => {
    return readFileSync(RENDERER_JS_PATH, "utf8")
})
