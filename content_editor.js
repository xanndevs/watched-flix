/**
 * Author: xanndev
 * Adapted from mozilla docs
 */

// Select the node that will be observed for mutations

var css = `
  .WatchFlix-Button {
    width:auto;
    position:absolute;
    height:40px;
    width:40px;
    top:4px;
    background:#232323;
    border-radius:20px;
    border: 2px solid #919191;
    right:4px;
    padding:8px 7px 7px 7px;
    display:flex;
    justify-content:center;
    aling-items:middle;

    transform:scale(1);
    transition: all 100ms ease-in-out;
    transform-origin: 50% 50%;
    transition-delay: 25ms;
  }
  .WatchFlix-Button:hover {
    background:#2f2f2f;
  }

  .WatchFlix-Button:active {
    transform: scale(0.9);
  }

  .WatchFlix-Button-Image{
    position:relative;
    margin:0px;
    padding:0px;
    height:100%;
    width:100%;
    aspect-ratio:1;
  }

  .WatchFlix-Overlay{
    background: transparent;
    z-index: 99;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

    display:flex;
    align-items:center;
    justify-content:center;
    > h2 {
      color:white;
      text-shadow: #000000 2px 6px 5px;
      z-index:10;
      transform:scale(var(--overlayTextScale));
    }
  } 
  .WatchFlix-OverlayBackground{
    background: var(--overlayColor);
    opacity:var(--overlayOpacity);
    position:absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

`;
var style = document.createElement('style');

if (style.styleSheet) {
  style.styleSheet.cssText = css;
} else {
  style.appendChild(document.createTextNode(css));
}
document.getElementsByTagName('head')[0].appendChild(style);


const injectSettings = (isUpdate = 0) => {
  chrome.storage.sync.get("config", (response) => {
    config = response.config
    console.log(config);

    Object.keys(config).forEach((elem) => { document.documentElement.style.setProperty(["--", elem].join(""), config[elem][0]) })
  });
}

injectSettings();


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updatePage") {
    // Your logic here
    console.log("Received updatePage action");
    injectSettings(); // Call your internal function
  }
});

a = setInterval(() => {
  const mainView = document.querySelector("#main-view")
  if (document.querySelector(".profiles-gate-container") == null && mainView != null) {
    startWatching(mainView);
    clearInterval(a);
  }
}, 500);


const startWatching = (elem) => {

  let targetNode = elem.parentElement.parentElement;
  let VIDEO_SELECTOR = ".focus-trap-wrapper.previewModal--wrapper.mini-modal";
  let SHOW_SELECTOR = ".title-card";

  // Options for the observer (which mutations to observe)
  const config = { attributes: true, childList: true, subtree: true };

  // Callback function to execute when mutations are observed
  const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach(elem => {
          if (elem.matches(VIDEO_SELECTOR)) {
            //console.log("Test")
            handleButtonInjection(elem, getShowDataFromModal(elem));
            return;
          }

        })

      } else if (mutation.type === "attributes") {
        //console.log(`The ${mutation.attributeName} attribute was modified.`);
      }

      const targetElement = mutation.target;
      targetElement.querySelectorAll(SHOW_SELECTOR).forEach((elem) => {
        handleOverlayInjection(elem, getShowDataFromTitle(elem));
      })

    }


  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);

  const handleButtonInjection = (elem, showData) => {
    const watchFlixIconURL = chrome.runtime.getURL("src/WatchFlix-short-transparent.png");
    const tickIconURL = chrome.runtime.getURL("src/Tick-transparent.png");

    const buttons = elem.querySelector(".previewModal--player_container.has-smaller-buttons.mini-modal");

    const watchedButton = document.createElement("button");

    watchedButton.classList.add("WatchFlix-Button");
    watchedButton.addEventListener("click", (e) => {

      if (watchedButton.children[0].src == tickIconURL) {
        watchedButton.children[0].src = watchFlixIconURL;
        handleRemoveShow(showData);
      }
      else {
        watchedButton.children[0].src = tickIconURL;
        handleAddShow(showData);
      }
    });

    const imageElem = document.createElement('img');
    imageElem.classList.add("WatchFlix-Button-Image")

    chrome.storage.sync.get(null, (elem) => {
      elem = elem.showData;
      elem = elem.map((e) => e[0]);


      if (elem.indexOf(showData[0]) > -1) {
        imageElem.src = tickIconURL;
      }
      else {
        imageElem.src = watchFlixIconURL;
      }
    })



    watchedButton.appendChild(imageElem);
    buttons.appendChild(watchedButton);
  }


  const handleOverlayInjection = (titleElem, showData) => {
    chrome.storage.sync.get(null, (elem) => {
      elem = elem.showData;
      elem = elem.map((e) => e[0]);

      if (elem.includes(showData)) {
        //console.log("Found the target element!")
        if (titleElem.querySelector(".WatchFlix-Overlay") != null) {
          return;
        }

        const container = document.createElement("div");
        container.classList.add("WatchFlix-Overlay");

        const overlay = document.createElement("div");
        overlay.classList.add("WatchFlix-OverlayBackground");

        const text = document.createElement('h2');
        text.innerText = "You have watched this!";


        container.appendChild(overlay);
        container.appendChild(text);
        titleElem.appendChild(container);


      }
      //Does not include the thing... if it has the overlay, just remove it.
      else {
        overlay = titleElem.querySelector(".WatchFlix-Overlay");
        if (overlay != null) {
          overlay.remove();
        }
      }

    })


  }
  const getShowDataFromModal = (elem) => {
    let showId = elem.querySelector("div.focus-trap-wrapper.previewModal--wrapper.mini-modal > div > div.previewModal--info > a")
    showId = showId.href.match(/\/title\/(\d+)/)[1]



    const titleElement = elem.querySelector("div.focus-trap-wrapper.previewModal--wrapper.mini-modal > div > div.previewModal--player_container.has-smaller-buttons.mini-modal > div.videoMerchPlayer--boxart-wrapper")
    
    const altValues = Array.from(titleElement.querySelectorAll('[alt]'))
    .map(el => el.getAttribute('alt'))
    .find(alt => alt?.trim());
    
    const showImageElement = elem.querySelector("div.focus-trap-wrapper.previewModal--wrapper.mini-modal > div > div.previewModal--player_container.has-smaller-buttons.mini-modal > div.videoMerchPlayer--boxart-wrapper > img:nth-child(1)")
    const showUrl = showImageElement.src;



    return [showId, altValues, showUrl];
  }

  const getShowDataFromTitle = (elem) => {
    const showURL = elem.querySelector("div.ptrack-content > a")
    if (showURL) {

      match = showURL.href.match(/\/watch\/(\d+)/);
      if (match != null) {
        //console.log(match[1]);
        return match[1];
      }
    }
    return null;
  }

  const handleAddShow = (data) => {
    chrome.storage.sync.get(null, (elem) => {
      elem = elem.showData;

      elem.push(data);

      chrome.storage.sync.set({ showData: elem })
    })
  }
  const handleRemoveShow = (data) => {
    // WIP
    chrome.storage.sync.get(null, (elem) => {
      elem = elem.showData;
      let tempElem = elem.map((e) => e[0]);
      const index = tempElem.indexOf(data[0]);
      if (index > -1) { // only splice array when item is found
        elem.splice(index, 1); // 2nd parameter means remove one item only
      }
      chrome.storage.sync.set({ showData: elem }).then(() => {
        //console.log("Value is removed");
      });


    });
  }



}

window.addEventListener("popstate", () => {
  a = setInterval(() => {
    const mainView = document.querySelector("#main-view")
    if (document.querySelector(".profiles-gate-container") == null && mainView != null) {
      startWatching(mainView);
      clearInterval(a);
    }
  }, 500);
});
