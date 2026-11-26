import { spawnNodeModuleBin } from "./utils/spawn.mjs";

const flags = [process.cwd(), "--enable-source-maps"];

if (process.env.ELECTRON_LAUNCH_FLAGS) {
    flags.push(...process.env.ELECTRON_LAUNCH_FLAGS.split(" "));
}

spawnNodeModuleBin("electron", flags);
