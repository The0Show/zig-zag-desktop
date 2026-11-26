import "./start";
import { spawnNodeModuleBin } from "./utils/spawn.mjs";
spawnNodeModuleBin("tsx", ["scripts/build/build.mts", "--", "--watch", "--dev"]);
