import { ZIG_ZAG_HOSTNAMES } from "main/constants";

export enum UrlTrust {
    UNTRUSTED,
    TRUSTED,
    ZIG_ZAG,
}

const ALLOWED_PROTOCOLS = [
    "https:",
    "http:"
];

export function validateUrl(url: string): UrlTrust {
    if (!url || !URL.canParse(url)) return UrlTrust.UNTRUSTED;

    const { protocol, hostname } = new URL(url);
    if (protocol == "https:" && ZIG_ZAG_HOSTNAMES.includes(hostname)) return UrlTrust.ZIG_ZAG;

    if (ALLOWED_PROTOCOLS.includes(protocol)) return UrlTrust.TRUSTED;
    return UrlTrust.UNTRUSTED;
}
