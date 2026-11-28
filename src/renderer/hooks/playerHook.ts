const GEM_BUTTON_SELECTOR = `button[data-testid="gem-button"]`;
const GEM_BUTTON = document.querySelector(GEM_BUTTON_SELECTOR) as HTMLButtonElement;

ZigZagDesktop.player.setTrackGemmed((g) => {
    if (!GEM_BUTTON) return;

    const isCurrentlyGemmed = GEM_BUTTON.getAttribute("aria-pressed") == "true";
    if (isCurrentlyGemmed == g) console.warn("Gem desync :(");

    GEM_BUTTON.click();
})

const observer = new MutationObserver(mutations => {
    ZigZagDesktop.tray.setTrackGemmed(GEM_BUTTON!.getAttribute("aria-pressed") == "true")
});
observer.observe(GEM_BUTTON!, { attributes: true });
