chrome.runtime.onInstalled.addListener((details) => {
  console.log(details);
  if (details.reason == 'install') {
    chrome.storage.sync.set({ proxmoxUrls: [] });
  } else if (details.reason == 'update') {
    console.log('update');
    // chrome.storage.sync.set({ proxmoxUrls: [] });
  }
  chrome.storage.sync.get(['proxmoxUrls'], (result) => {
    if (result.proxmoxUrls === undefined) return;
    const urls = Array.from(result.proxmoxUrls).map((url) => `${url}/*/subscription*`);
    console.log(urls);
    const callback = (e) => {
      console.log(e);
      console.log('send message 1');

      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
        if (tabs.length && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, 'subscription');
          console.log('send message 2');
        }
      });
    };
    chrome.webRequest.onBeforeRequest.addListener(
      function (e) {
        console.log(e);
      },
      { urls: [`*:\/\/*/subscription*`] },
      ['requestBody']
    );
    chrome.webRequest.onCompleted.addListener(callback, { urls: [`*:\/\/*/subscription*`] }, [
      'responseHeaders',
    ]);
  });

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.cmd === 'addUrl') {
      chrome.storage.sync.get({ proxmoxUrls: [] }, (result) => {
        const urls = result.proxmoxUrls;
        if (urls.length === 1000) {
          console.error('Please Do Not Exceed 1000 URLs');
        }
        urls.push(request.data);
        chrome.storage.sync.set({ proxmoxUrls: urls }, function () {
          sendResponse({ urls });
        });
      });
    } else if (request.cmd === 'removeUrlByIdx') {
      chrome.storage.sync.get(['proxmoxUrls'], (result) => {
        const urls = result.proxmoxUrls;
        if (urls.length === 1000) {
          console.error('Please Do Not Exceed 1000 URLs');
          return;
        }
        urls.splice(request.data, 1);
        chrome.storage.sync.set({ proxmoxUrls: urls }, function () {
          sendResponse({ urls });
        });
      });
    } else if (request.cmd === 'getUrls') {
      chrome.storage.sync.get({ proxmoxUrls: [] }, function (result) {
        const urls = result.proxmoxUrls;
        console.log(urls);
        sendResponse({ urls: urls });
      });
    }
    return true;
  });
});
