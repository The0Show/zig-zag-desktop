import { invoke, sendSync } from "./ipc";

const ZigZagDesktop = {
    app: {
        relaunch: () => invoke("app:relaunch"),
        getVersion: () => sendSync("app:get_version")
    }
}

export default ZigZagDesktop;
