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
        chrome.storage.sync.set({ showData: [] }).then(() => {
      });
    }else if(details.reason == "update"){
        //var thisVersion = chrome.runtime.getManifest().version;
        //console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    }
});