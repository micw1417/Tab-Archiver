const ArchiveB = document.querySelector('#ArchiveB');
const clearB = document.querySelector("#ClearB");
document.addEventListener("DOMContentLoaded", async function() {
  const previousTabs = await getArchivedTabs(() => {console.log("GOT ARCHIVED")})
  console.log(previousTabs)
  if (previousTabs) {
    loadScript(previousTabs);
  }
});
clearB.addEventListener("click", async (e) => {
  chrome.storage.sync.get("archivedTabs", () => {
    chrome.storage.sync.set({ "archivedTabs": [] }, () => {
    });
  });
  window.location.reload();
})

ArchiveB.addEventListener('click', async (e) => {
  const archivedTabs = await getArchivedTabs();
  const tabTemplate = document.getElementById('li_template');
  const clone = tabTemplate.content.cloneNode(true);
  const currTab = await getCurrentTab();

  if (archivedTabs.length > 0) {
    let containsTab = false;
    archivedTabs.forEach(element => {
      if (tabEquals(currTab, element)) containsTab = true;
    });
    if (containsTab) return;
  }

  // code basiclly copied
  clone.querySelector('.title').textContent = currTab.title;
  clone.querySelector('.pathname').textContent = currTab.url;
  clone.querySelector('a').addEventListener('click', async () => {
    removeTab(currTab);

    chrome.tabs.create({
      url: currTab.url,
      active: true,
      pinned: false
    });
  });

  archiveTab(currTab);
  document.querySelector('ul').append(clone);
  // const tab = document.createElement("li");
  // tab.innerHTML = "<strong>" + tabTitle + "</strong>" + tabPath

  // document.body.append(tab);
})

// code copied from chrome api
const getCurrentTab = async () => {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

// chatgpt stuff 

// Store archived tabs
function archiveTab(tab) {
  console.log(tab)
  chrome.storage.sync.get("archivedTabs", function(data) {
    console.log(data.archivedTabs)
    const archivedTabs = data.archivedTabs || [];
    const newlyPushedTab = new tabInfo(tab.title, tab.url);
    console.log(newlyPushedTab)
    archivedTabs.push(newlyPushedTab);
    chrome.storage.sync.set({ "archivedTabs": archivedTabs }, function() {
    });
  });
}

async function getArchivedTabs() {
  try {
    let {archivedTabs} = await chrome.storage.sync.get('archivedTabs');
    return archivedTabs || [];
  } catch (error) {
    console.error(error);
    return []; // Return an empty array if an error occurs
  }
}

function removeTab(tab) {
  chrome.storage.sync.get("archivedTabs", function(data) {
    console.log(data.archivedTabs)
    const archivedTabs = data.archivedTabs || [];
   
    let newArray = archivedTabs.filter(element => {return !tabEquals(tab, element)});
    console.log(archivedTabs, newArray)
    chrome.storage.sync.set({ "archivedTabs": newArray }, function() {
    });
    window.location.reload();
  });
}
class tabInfo {
  title;
  url;
  constructor (title, url) {
    this.title = title;
    this.url = url
  }
}

async function loadScript (previousTabs) {
  console.log("LOADED")
  const tabTemplate = document.getElementById('li_template');
  for (const tab of previousTabs) {
    const archivedTabs = await getArchivedTabs();
    const tabTemplate = document.getElementById('li_template');
    const clone = tabTemplate.content.cloneNode(true);

    // code basiclly copied
    clone.querySelector('.title').textContent = tab.title;
    clone.querySelector('.pathname').textContent = tab.url;
    clone.querySelector('a').addEventListener('click', async () => {
      removeTab(tab);

      chrome.tabs.create({
        url: tab.url,
        active: true,
        pinned: false
      });
    });

    document.querySelector('ul').append(clone);
    // const tab = document.createElement("li");
    // tab.innerHTML = "<strong>" + tabTitle + "</strong>" + tabPath

    // document.body.append(tab);
  }
}

function tabEquals(tab1, tab2) {
  console.log(tab1, tab2)
  return tab1.title === tab2.title && tab1.url === tab2.url;
}