import { contextBridge, webFrame } from "electron/renderer";
import { ZigZagDesktop } from "./ZigZagDesktop";
import { sendSync } from "./ipc";

contextBridge.exposeInMainWorld("ZigZagDesktop", ZigZagDesktop);

async function loadRenderer() {
    await webFrame.executeJavaScript(sendSync("app:get_renderer_script"));
}

Promise.all([loadRenderer()]).catch((error) => {
    console.error("Failed to initialize renderer:", error);
})
