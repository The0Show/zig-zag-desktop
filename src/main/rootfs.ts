import { join } from "node:path";
import { STATIC_DIR } from "shared/paths";

export function getRootFSPath(path: string) {
    return join(STATIC_DIR, path);
}
