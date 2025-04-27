// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'searchGrok') {
    handleGrokSearch(request.query);
  }
});

// Function to inject the content script and set the query
async function injectGrokContentScript(tabId, query) {
  console.log('Injecting GROK_SEARCH_QUERY into tab', tabId, 'with query:', query);
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (searchQuery) => { window.GROK_SEARCH_QUERY = searchQuery; },
    args: [query]
  });
  console.log('Injected GROK_SEARCH_QUERY, now injecting contentScript.js');
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['contentScript.js']
  });
  console.log('Injected contentScript.js');
}

// Function to handle Grok search
async function handleGrokSearch(query) {
  // Check if a Grok tab already exists
  const tabs = await chrome.tabs.query({});
  const grokTab = tabs.find(tab => tab.url.includes('grok.com'));

  if (grokTab) {
    // If Grok tab exists, activate it and update the search
    await chrome.tabs.update(grokTab.id, { active: true });
    await injectGrokContentScript(grokTab.id, query);
  } else {
    // If no Grok tab exists, create a new one
    const newTab = await chrome.tabs.create({
      url: 'https://grok.com',
      active: true
    });

    // Wait for the page to load before executing the search
    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
      if (tabId === newTab.id && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        injectGrokContentScript(newTab.id, query);
      }
    });
  }
} 