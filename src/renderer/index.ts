import "./settings/settings";

const interval = setInterval(() => {
    console.log("waiting for load...");
    const canvas = document.querySelector(`div[data-testid="floating-youtube-embed"]`);
    if (canvas) {
        console.log("loaded!");
        clearInterval(interval);
        require("./hooks/playerHook");
        require("./hooks/settingsHook");
    }
}, 300);
