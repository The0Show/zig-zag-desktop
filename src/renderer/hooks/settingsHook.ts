import { buildSettings } from "renderer/settings/settings";

let builtSettings = false;

setInterval(() => {
    const settingsButton = document.getElementById("user-profile-tab-settings");
    if (settingsButton && settingsButton.getAttribute("aria-selected") == "true") {
        if (!builtSettings) {
            const settingsRoot = document.querySelector(`div[data-testid="user-settings-inline"]`) as HTMLDivElement;
            const evaluator = document.evaluate('//h4[text()="App"]', settingsRoot);
            const appSettingsRoot = evaluator.iterateNext()!.parentElement;

            if (!appSettingsRoot) return;

            appSettingsRoot.querySelector("div")!.remove();

            buildSettings(appSettingsRoot as HTMLDivElement);
            builtSettings = true;
        }
    } else {
        builtSettings = false;
    }
}, 300);
