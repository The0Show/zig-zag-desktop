import { app } from "electron/main";
import { handle, handleSync } from "./utils/ipcUtils";
import { relaunch } from "./utils/relaunch";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getVersionString } from "./version";

const RENDERER_JS_PATH = join(__dirname, "renderer.js");

handle("app:relaunch", relaunch);
handleSync("app:get_version", () => getVersionString())
handleSync("app:get_renderer_script", () => {
    return readFileSync(RENDERER_JS_PATH, "utf8")
})
