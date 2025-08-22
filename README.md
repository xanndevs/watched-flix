# WatchFlix

A small browser extension that helps you keep track of what you've watched on Netflix. WatchFlix injects a quick "watched" button into Netflix's preview modal and overlays/hides watched titles on the Netflix home/browse UI. Data is synced using `chrome.storage.sync` so the watchlist follows you across signed-in Chrome profiles.


## Table of contents

* [Features](#features)
* [Tech stack](#tech-stack)
* [How it works (overview)](#how-it-works-overview)
* [Installation (developer)](#installation-developer)
* [Usage](#usage)
* [Selectors & inject points](#selectors--inject-points)
* [Contributing](#contributing)
* [License](#license)


## Features

* Add / remove Netflix titles to a synced watchlist from the preview modal.
* Injects a compact "WatchFlix" button into Netflix preview modal player controls.
* Visually marks watched titles on the Netflix browse/home UI with an overlay: "You have watched this!"
* Optionally hide watched tiles completely (configuration toggle).
* Lightweight CSS overlay with configurable color, opacity, and text scale.
* Uses `chrome.storage.sync` (with `defaultConfig`) so settings persist across browsers where sync is available.


## Tech stack

* Manifest v3 Chrome extension

* Plain JavaScript (ES modules for the background/service-worker)

* `chrome.*` extension APIs (`scripting`, `storage`, `tabs`, `action`, `runtime`, `sidePanel`)

* Simple CSS injection for extension UI elements


## How it works (overview)

1. **Content script** (`content_editor.js`) runs on Netflix pages and starts a `MutationObserver` on the main view (`#main-view`).
2. The observer watches for preview modals and title card changes. When a modal appears, WatchFlix injects a small circular button into the modal controls. Clicking it toggles the watched state for that title (adds or removes an entry in `showData`).
3. For browse/title-card elements the script checks `showData` and either overlays a semi-transparent badge saying "You have watched this!" or — if the `hideWatched` config flag is set — hides the tile visually (opacity/position).
4. Configuration values and the watchlist are stored in `chrome.storage.sync` so the extension updates across devices.


## Installation (developer / local testing)

1. Clone or download the repository.

```bash
git clone https://github.com/xanndevs/WatchFlix.git
cd WatchFlix
```

2. Open Chrome (or a Chromium-based browser) and go to `chrome://extensions/`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the extension folder (the folder that contains `manifest.json`).
5. Test on `https://www.netflix.com/` while signed in.


## Usage

* Open Netflix and hover over a title. Open the preview modal (click "More info" or use the hover preview).
* Click the circular WatchFlix button in the modal controls to mark the title as watched. The button image toggles between the WatchFlix icon and a tick icon.
* On the browse pages, watched titles will display the overlay text, or they will be hidden when `hideWatched` is enabled in settings.
* Open the extension popup (toolbar action / side panel) to access settings and a mini watchlist UI.

## Selectors & inject points (important)

The extension relies on Netflix DOM structure and uses a small set of selectors — these are fragile and may require updates if Netflix changes its markup.

* **Modal preview selector**:

  ```js
  const VIDEO_SELECTOR = '.focus-trap-wrapper.previewModal--wrapper.mini-modal';
  ```
* **Title card selector (browse tiles)**:

  ```js
  const SHOW_SELECTOR = '.title-card';
  ```
* To derive the title id from a modal link the content script matches `/title/(\d+)/` and from browse tiles it may match `/watch/(\d+)/` — the script includes fallback checks.

If you see the extension stop working, inspect the Netflix page HTML and update these selectors accordingly.


## Contributing

1. Fork the repo.
2. Create a branch: `feature/my-feature`.
3. Implement changes, keep DOM selectors and config clear.
4. Test on a dev Netflix account (or a safe test profile).
5. Open a pull request with a clear description.


## License

GNU General Public License v3.0
