declare global {
    export var ZigZagDesktop: typeof import("preload/ZigZagDesktop").ZigZagDesktop;

    export var IS_DEV: boolean;
    export var COMMIT: string;
    export var BUILD_TIMESTAMP: string;
}

export { };
