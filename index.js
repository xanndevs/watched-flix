const showData = () => {
  chrome.storage.sync.get("showData", function (allShows) {
    let list = [];
    console.log(allShows);
    console.log(allShows["showData"]);
    allShows["showData"].forEach((element) => {
      list.push(new Modal(...element));
      //let listItem = document.createElement("img");
      //listItem.src = element[2];
      //listItem.alt = element[1];
      //listItem.classList.add(
      //  "h-auto",
      //  "w-full",
      //  "max-w-64",
      //  "aspect-auto",
      //  "rounded-lg",
      //  "cursor-pointer"
      //);
      //list.push(listItem);
    });

    document.getElementById("content").replaceChildren(...list);
  });
};

//when storage sync changes
chrome.storage.onChanged.addListener(function (changes, area) {
  if (area === "sync" && changes.showData) {
    showData();
  }
});

class Modal {
  constructor(id, title, imageUrl) {
    this.isClicked = false;

    this.element = document.createElement("div");
    this.element.id = id;
    this.element.classList.add(
      "h-auto",
      "w-full",
      "max-w-64",
      "rounded-lg",
      "cursor-pointer",
      "overflow-hidden",
      "relative",
    );

    this.imageDiv = document.createElement("div");
    this.imageDiv.classList.add(
      "h-auto",
      "w-full",
      "aspect-auto",
      "rounded-lg",
      "relative",

    );

    this.image = document.createElement("img");
    this.image.src = imageUrl;
    this.image.alt = title;
    this.image.classList.add("h-auto", "w-full", "aspect-auto");

    this.imageDiv.appendChild(this.image);

    this.element.appendChild(this.imageDiv);

    this.buttons = document.createElement("div");
    this.buttons.classList.add(
      "absolute",
      "top-[100%]",
      "left-0",
      "w-full",
      "h-[33.33%]",
      "flex",
      "justify-between",

      "rounded-t-lg",
      "bg-[rgba(0,0,0,0.9)]",
      "transition-all",
      "duration-150",
      "ease-in-out",
    );

    this.removeIcon = document.createElement("img");
    this.removeIcon.src = "src/delete.svg";
    this.removeIcon.classList.add("h-6", "w-6");
    this.removeIcon.style.filter = "brightness(0) saturate(100%) invert(100%) sepia(100%) saturate(0%) hue-rotate(148deg) brightness(102%) contrast(103%)";

    this.redirectIcon = document.createElement("img");
    this.redirectIcon.src = "src/redirect.svg";
    this.redirectIcon.classList.add("h-6", "w-6");
    this.redirectIcon.style.filter = "brightness(0) saturate(100%) invert(100%) sepia(100%) saturate(0%) hue-rotate(148deg) brightness(102%) contrast(103%)";

    this.redirectActionButton = document.createElement("a");
    this.redirectActionButton.href = `https://www.netflix.com/title/${id}`;
    this.redirectActionButton.target = "_blank";
    this.redirectActionButton.classList.add(
      "border-none",
      "bg-transparent",
      "flex",
      "flex-1",
      "h-full",
      "relative",
      "justify-center",
      "items-center",
      "hover:bg-[rgba(255,255,255,0.1)]",
      "transition-all",
      "active:scale-90",
      "rounded-lg",
    );

    this.redirectActionButton.appendChild(this.redirectIcon);

    this.buttons.appendChild(this.redirectActionButton);

    this.removeActionButton = document.createElement("button");
    this.removeActionButton.classList.add(
      "border-none",
      "bg-transparent",
      "justify-center",
      "flex",
      "flex-1",
      "h-full",
      "relative",
      "items-center",
      "hover:bg-[rgba(255,255,255,0.1)]",
      "transition-all",
      "active:scale-90",
      "rounded-lg",
    );
    this.removeActionButton.appendChild(this.removeIcon);

    this.removeActionButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.handleRemoveShow([id, title, imageUrl]);
      this.element.remove();
    });

    this.buttons.appendChild(this.removeActionButton);

    this.element.appendChild(this.buttons);

    this.element.addEventListener("click", this.onClickEvent);

    return this.element;
  }

  onClickEvent = () => {
    this.isClicked = !this.isClicked;
    this.buttons.classList.toggle("!top-[66.66%]", this.isClicked);
  };

  
  handleRemoveShow = (data) => {
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

showData();
