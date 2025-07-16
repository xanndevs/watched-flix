/**
 * Author: xanndev
 * Adapted from mozilla docs
 */

// Select the node that will be observed for mutations
a = setInterval(() => {
  const mainView = document.querySelector("#main-view")
  if (document.querySelector(".profiles-gate-container") == null && mainView != null) {
    startWatching(mainView);
    clearInterval(a);
  }

}, 500);


const startWatching = (elem) => {


  let targetNode = elem.parentElement.parentElement;
  let SELECTOR = ".focus-trap-wrapper.previewModal--wrapper.mini-modal";

  // Options for the observer (which mutations to observe)
  const config = { attributes: true, childList: true, subtree: true };

  // Callback function to execute when mutations are observed
  const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach(elem => {
          if (elem.matches(SELECTOR)) {
            console.log("LAAAAAAAAAAAAAAAAAAAAAA")
            handleButtonInjection(elem);
            return;
          }
        })

      } else if (mutation.type === "attributes") {
        //console.log(`The ${mutation.attributeName} attribute was modified.`);
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations

  observer.observe(targetNode, config);

  const handleButtonInjection = (elem) => {
    const buttons = elem.querySelector(".previewModal--player_container.has-smaller-buttons.mini-modal.not-playable");

    const watchedButton = document.createElement("button");

    watchedButton.style = `
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
    `; 

    const imageUrl = chrome.runtime.getURL("src/WatchedFlix_transparent.png");

    const imageElem = document.createElement('img'); imageElem.src = imageUrl;
        imageElem.style = `
      position:relative;
      margin:0px;
      padding:0px;
      height:100%;
      width:100%;
      aspect-ratio:1;
    `;
    
    watchedButton.appendChild(imageElem);


    buttons.appendChild(watchedButton);
  }

}