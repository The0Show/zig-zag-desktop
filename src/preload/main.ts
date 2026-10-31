import { ipcRenderer } from "electron/renderer";

type ZigZagSetting =
    {
        name: string,
        help?: string
        type: "toggle",
        var: string
    } |
    {
        name: string,
        help?: string
        type: "action",
        label: string,
        action: Function
    };

const config: ZigZagSetting[] = [
    {
        name: "zig~zag desktop v1.0.0",
        type: "action",
        label: "Check for updates",
        action: () => {
            alert("update check goes here")
        }
    },
    {
        name: "Keep open",
        help: "Keeps zig~zag desktop open when the window is closed",
        type: "toggle",
        var: "zz_minimize_to_tray"
    },
    {
        name: "Song notifications",
        help: "Send a desktop notification when the song changes",
        type: "toggle",
        var: "zz_song_notification"
    },
    {
        name: "Enable MPRIS",
        help: "Allows most Linux desktops to display the current song",
        type: "toggle",
        var: "zz_unix_enable_mpris"
    }
];

function updateToggleVisualState(p_toggle: HTMLButtonElement, p_value: boolean) {
    const label = p_toggle.children.item(0) as HTMLSpanElement;
    label.classList.remove(
        "text-white/55",
        "text-white/90"
    );
    label.classList.add(p_value ? "text-white/90" : "text-white/55");
    label.innerText = p_value ? "ON" : "OFF";

    const toggle = p_toggle.children.item(1) as HTMLSpanElement;
    toggle.classList.remove("border-white/40", "border-white/20");
    toggle.classList.add(p_value ? "border-white/40" : "border-white/20");

    const handle = toggle.children.item(0) as HTMLSpanElement;
    handle.classList.remove(
        "translate-x-4", "translate-x-0",
        "bg-white/90", "bg-white/45"
    );
    handle.classList.add(
        p_value ? "translate-x-4" : "translate-x-0",
        p_value ? "bg-white/90" : "bg-white/45"
    )
}

async function buildSettings(p_parent: HTMLDivElement) {
    for (var i = 0; i < config.length; i++) {
        const setting = config[i];
        const LABEL_ID = `_zzd_${i}_`;

        const root = document.createElement("div");
        root.classList.add("flex", "items-center", "justify-between", "gap-3", "py-1.5");

        const labelContainer = document.createElement("div");
        labelContainer.classList.add("flex", "min-w-0", "flex-col", "gap-0.5");

        const settingNameElem = document.createElement("span");
        settingNameElem.id = LABEL_ID;
        settingNameElem.classList.add("text-xs", "text-white/85");
        settingNameElem.innerText = setting.name;
        labelContainer.appendChild(settingNameElem);

        if (setting.help) {
            const settingHelpElem = document.createElement("span");
            settingHelpElem.classList.add("text-micro", "text-white/40");
            settingHelpElem.innerText = setting.help;
            labelContainer.appendChild(settingHelpElem);
        }

        root.appendChild(labelContainer);

        switch (setting.type) {
            case "toggle": {
                const cvar = await ipcRenderer.invoke("cvar-get", setting.var);

                const button = document.createElement("button");
                button.type = "button";
                button.role = "switch";
                button.setAttribute("aria-checked", cvar ? "true" : "false");
                button.setAttribute("aria-labelledby", LABEL_ID);
                button.classList.add(
                    "group",
                    "flex",
                    "shrink-0",
                    "cursor-pointer",
                    "items-center",
                    "gap-1.5",
                    "bg-transparent",
                    "p-0",
                    "transition-opacity",
                    "duration-150",
                    "focus-visible:outline",
                    "focus-visible:outline-1",
                    "focus-visible:outline-offset-2",
                    "focus-visible:outline-white/30",
                    "active:opacity-80",
                    "disabled:pointer-events-none",
                    "disabled:opacity-30"
                );

                const buttonLabel = document.createElement("span");
                buttonLabel.setAttribute("aria-hidden", "true");
                buttonLabel.classList.add(
                    "w-6",
                    "text-right",
                    "font-display",
                    "text-micro",
                    "font-normal",
                    "tracking-wider",
                    cvar ? "text-white/90" : "text-white/55"
                );
                buttonLabel.innerText = cvar ? "ON" : "OFF";
                button.appendChild(buttonLabel);

                const toggle = document.createElement("span");
                toggle.setAttribute("aria-hidden", "true");
                toggle.classList.add(
                    "relative",
                    "block",
                    "h-4",
                    "w-8",
                    "rounded-[var(--border-radius)]",
                    "border",
                    "transition-colors",
                    "duration-150",
                    cvar ? "border-white/40" : "border-white/20",
                    "group-hover:border-white/35"
                );
                if (cvar) toggle.classList.add("bg-transparent");

                const handle = document.createElement("span");
                handle.classList.add(
                    "absolute",
                    "top-1/2",
                    "left-px",
                    "h-3",
                    "w-3",
                    "-translate-y-1/2",
                    "rounded-[var(--border-radius)]",
                    "transition-[translate,background-color]",
                    "duration-150",
                    cvar ? "translate-x-4" : "translate-x-0",
                    cvar ? "bg-white/90" : "bg-white/45"
                );

                toggle.appendChild(handle);
                button.appendChild(toggle);

                button.onclick = async () => {
                    const currentValue = await ipcRenderer.invoke("cvar-get", setting.var);
                    const newValue = await ipcRenderer.invoke("cvar-set", setting.var, !currentValue);

                    updateToggleVisualState(button, newValue);
                }

                root.appendChild(button);
                break;
            }
            case "action": {
                const container = document.createElement("div");
                container.classList.add(
                    "flex",
                    "items-center",
                    "gap-2"
                );

                const button = document.createElement("button");
                button.type = "button";
                button.setAttribute("aria-expanded", "false");
                button.classList.add(
                    "shrink-0",
                    "rounded-[1px]",
                    "border",
                    "border-white/20",
                    "px-2",
                    "py-0.5",
                    "text-xxs",
                    "text-white/70",
                    "transition-colors",
                    "duration-150",
                    "hover:border-white/40",
                    "hover:text-white/90",
                    "focus-visible:outline",
                    "focus-visible:outline-1",
                    "focus-visible:outline-white/30",
                    "active:bg-white/10",
                    "disabled:cursor-not-allowed",
                    "disabled:opacity-50",
                    "disabled:hover:border-white/20",
                    "disabled:hover:text-white/70"
                );
                button.innerText = setting.label;
                button.onclick = setting.action.bind(button);

                container.appendChild(button)
                root.appendChild(container);
                break;
            }
        }

        p_parent.appendChild(root);
    }
}

const LOADING_INDICATOR = 'div[aria-label="Loading"]';

const NEXT_BUTTON = `button[data-testid="next-button"]`;
const PREVIOUS_BUTTON = `button[aria-label="Previous"]`;
const RANDOM_BUTTON = `button[data-testid="explore-button"]`;

const NAVIGATION_OPTIONS_TRIGGER = `span[data-testid="next-button-arrow"]`;
const NAVIGATION_OPTION_NAVIGATE = `button[data-action-id="main-map-similar"]`;
const NAVIGATION_OPTION_COMMUNITY = `button[data-action-id="community-shuffle"]`;
const NAVIGATION_OPTION_SURPRISE = `button[data-action-id="gems-shuffle"]`;

const TRACK_PROGRESS = `div[data-testid="progress-bar"]`;

const TRACK_LIST = `div[data-testid="current-release-tracks-list"]`;
const CURRENT_TRACK = `div[role="button"][data-chosen="true"]`;
const CURRENT_TRACK_COVER = `img[class="h-full w-full object-cover cover-frame-img"]`;
const CURRENT_TRACK_ALBUM = `a[data-testid="current-release-title-link"]`;

const NAVIGATION_OPTIONS = {
    "navigate": NAVIGATION_OPTION_NAVIGATE,
    "community": NAVIGATION_OPTION_COMMUNITY,
    "surprise": NAVIGATION_OPTION_SURPRISE,
}

var MutationObserver = window.MutationObserver || (window as any).WebKitMutationObserver;
var observeDOM = (obj: HTMLElement, callback: EventListenerOrEventListenerObject) => {
    if (!obj || obj.nodeType !== 1) {
        return console.log("nope");
    }

    if (MutationObserver) {
        // define a new observer
        var mutationObserver = new MutationObserver(callback);

        // have the observer observe for changes in children
        mutationObserver.observe(obj, { childList: true, subtree: true, attributes: true });
        return mutationObserver;
    } else if (window.addEventListener) { // browser support fallback
        obj.addEventListener('DOMNodeInserted', callback, false);
        obj.addEventListener('DOMNodeRemoved', callback, false);
    }
};

class ZigZagHooks {
    builtSettings = false;

    constructor() {
        ipcRenderer.on("set-navigate-mode", (_ev, val: keyof typeof NAVIGATION_OPTIONS) => {
            this.changeNavigateMode(val);
        })
        ipcRenderer.on("next-requested", (_ev) => {
            this.performNavigation();
        });
        ipcRenderer.on("previous-requested", () => {
            this.performPrevious();
        });
        ipcRenderer.on("explore-requested", () => {
            this.performExplore();
        });

        const progressElement = document.querySelector(TRACK_PROGRESS) as HTMLDivElement;
        observeDOM(progressElement, () => {
            ipcRenderer.invoke("progress-update", parseInt(progressElement.getAttribute("aria-valuenow")));
            ipcRenderer.invoke("metadata-update", { length: parseInt(progressElement.getAttribute("aria-valuemax")) });
        });

        setInterval(() => {
            const trackListElement = document.querySelector(TRACK_LIST) as HTMLDivElement;
            if (trackListElement) {
                const currentTrackElement = document.querySelector(CURRENT_TRACK) as HTMLDivElement;
                const currentTrackCover = currentTrackElement.querySelector(CURRENT_TRACK_COVER) as HTMLImageElement;
                const currentTrackAlbum = currentTrackElement.querySelector(CURRENT_TRACK_ALBUM) as HTMLAnchorElement;
                const currentTrackArtist = document.querySelector('section[data-testid="artist-section"]').querySelector(`span[class="font-display text-xs text-neutral-200"]`) as HTMLSpanElement;
                const button = currentTrackElement.querySelectorAll("button")[1];

                ipcRenderer.invoke(
                    "metadata-update",
                    {
                        title: button.innerText,
                        // album: currentTrackAlbum.innerText,
                        artist: currentTrackArtist.innerText,
                        cover: currentTrackCover.src
                    }
                );
            }
        }, 200);

        setInterval(() => {
            const settingsButton = document.getElementById("user-profile-tab-settings");
            if (settingsButton && settingsButton.getAttribute("aria-selected") == "true") {
                if (!this.builtSettings) {
                    const settingsRoot = document.querySelector(`div[data-testid="user-settings-inline"]`) as HTMLDivElement;
                    const evaluator = document.evaluate('//h4[text()="App"]', settingsRoot);
                    const appSettingsRoot = evaluator.iterateNext().parentElement;

                    appSettingsRoot.querySelector("div").remove();

                    buildSettings(appSettingsRoot as HTMLDivElement);
                    this.builtSettings = true;
                }
            } else {
                this.builtSettings = false;
            }
        }, 300);
    }

    performNavigation() {
        (document.querySelector(NEXT_BUTTON) as HTMLButtonElement).click();
    }

    performPrevious() {
        (document.querySelector(PREVIOUS_BUTTON) as HTMLButtonElement).click();
    }

    performExplore() {
        (document.querySelector(RANDOM_BUTTON) as HTMLButtonElement).click();
    }

    changeNavigateMode(p_mode: keyof typeof NAVIGATION_OPTIONS) {
        document.querySelector(NAVIGATION_OPTIONS_TRIGGER).dispatchEvent(new MouseEvent("mouseover", { view: window, bubbles: true, cancelable: true }));
        requestAnimationFrame(() => {
            const but = (document.querySelector(NAVIGATION_OPTIONS[p_mode]) as HTMLButtonElement);
            but.disabled = false;
            but.click();
        })
    }
}

function awaitZigZagLoad() {
    console.log("awaiting load!")
    const interval = setInterval(() => {
        if (document.querySelector(LOADING_INDICATOR) == null) {
            clearInterval(interval);

            ipcRenderer.invoke("frontend-loaded");
            new ZigZagHooks();
        }
    }, 1_000)
}

if (document.readyState == "complete") {
    awaitZigZagLoad();
} else {
    document.onreadystatechange = () => {
        if (document.readyState == "complete") {
            awaitZigZagLoad();
        }
    }
}
