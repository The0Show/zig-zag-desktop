import { app } from "electron/main";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const appDir = dirname(process.execPath);

export const PORTABLE = existsSync(join(appDir, "._sc_"));

// TODO: expose as command line flag?
export const DATA_DIR =
    process.env.DATA_DIR || (PORTABLE ? join(appDir, "Data") : join(app.getPath("userData")));
mkdirSync(DATA_DIR, { recursive: true });

export const SESSION_DATA_DIR = join(DATA_DIR, "Session");
app.setPath("sessionData", SESSION_DATA_DIR)

export const SETTINGS_DATA_DIR = join(DATA_DIR, "Settings");
mkdirSync(SETTINGS_DATA_DIR, { recursive: true });

export const USER_AGENT = `zig~zag desktop/${app.getVersion()} (https://github.com/The0Show/zig-zag-desktop)`;
const VersionString = `AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${process.versions.chrome.split(".")[0]}.0.0.0 Safari/537.36`;
const BrowserUserAgents = {
    darwin: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ${VersionString}`,
    linux: `Mozilla/5.0 (X11; Linux x86_64) ${VersionString}`,
    windows: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) ${VersionString}`
};

export const BrowserUserAgent =
    `${USER_AGENT} ${BrowserUserAgents[process.platform] || BrowserUserAgents.windows}`;

// dimensions shamefully stolen from Vesktop, which were shamelessly stolen from Discord Desktop
export const MIN_WIDTH = 940;
export const MIN_HEIGHT = 500;
export const DEFAULT_WIDTH = 1280;
export const DEFAULT_HEIGHT = 720;

export const ZIG_ZAG_HOSTNAMES = ["www.zig-zag.fm"];
