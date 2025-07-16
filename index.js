let list = document.createElement("list");

chrome.storage.sync.get("showData", function (allShows) {
    console.log(allShows);
    console.log(allShows["showData"]);
    allShows["showData"].forEach(element => {
        let listItem = document.createElement("ul");
        listItem.innerText = element;
        list.appendChild(listItem);
    });


});
document.getElementsByTagName("main")[0].appendChild(list);

console.log("aaa");