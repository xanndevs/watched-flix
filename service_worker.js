// I can probably use extension locales and set a language picker ? but idk if I want to...
let defaultConfig = {
  overlayOpacity: [0.95, {type:"range", min:"0",max:"1",step:"0.05"}, "Overlay blur amount"/*  Or chrome.extension.locale???.en-EN.overlayOpacity */],
  overlayTextScale: [1, {type:"range", min:"0.5",max:"1.5",step:"0.05"}, "Overlay text scale"/*  Or chrome.extension.locale???.en-EN.overlayOpacity */],
  overlayColor: ["oklch(20.5% 0 0)", {type:"color"}, "Color of overlay"],
}

// Allow users to open the sidebar by clicking the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(async () => {
  for (const cs of chrome.runtime.getManifest().content_scripts) {
    for (const tab of await chrome.tabs.query({url: cs.matches})) {
      if (tab.url.match(/(chrome|chrome-extension):\/\//gi)) {
        continue;
      }
      const target = {tabId: tab.id, allFrames: cs.all_frames};
      if (cs.js[0]) chrome.scripting.executeScript({
        files: cs.js,
        injectImmediately: cs.run_at === 'document_start',
        world: cs.world, // requires Chrome 111+
        target,
      });
      if (cs.css[0]) chrome.scripting.insertCSS({
        files: cs.css,
        origin: cs.origin,
        target,
      });
    }
  }
});


// Check whether new version is installed

chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        chrome.storage.sync.set({ showData: [] }).then(() => {});
        chrome.storage.sync.set({ defaultConfig: defaultConfig }).then(() => {});
        chrome.storage.sync.set({ config: defaultConfig }).then(() => {});
    }else if(details.reason == "update"){
        chrome.storage.sync.set({ defaultConfig: defaultConfig }).then(() => {});
        
    }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: chrome.runtime.getURL("sidebar.html") });
});
