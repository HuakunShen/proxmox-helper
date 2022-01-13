chrome.runtime.onInstalled.addListener((details) => {
  console.log(details);
  if (details.reason == 'install') {
    chrome.storage.sync.get({ proxmoxUrls: [] }, (result) => {
      chrome.storage.sync.set({ proxmoxUrls: result.proxmoxUrls });
    });
  } else if (details.reason == 'update') {
    console.log('update');
    // chrome.storage.sync.set({ proxmoxUrls: [] });
  }
});

const handleActionClick = (e) => {
  console.log(e);
  console.log('handleActionClick');
};
chrome.action.onClicked.addListener(handleActionClick);

const webrequestCallback = (e) => {
  console.log('webrequestCallback');
  console.log(e);
  console.log('send message 1');

  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    if (tabs.length && tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, 'subscription');
      console.log('send message 2');
    }
  });
};

const constructPatterns = (urls) => urls.map((url) => `${url}/*subscription*`);

const initBg = () => {};

chrome.storage.sync.get(['proxmoxUrls'], (result) => {
  console.log(result);
  if (result.proxmoxUrls === undefined) return;
  const patternUrls = constructPatterns(result.proxmoxUrls);
  console.log('Add Web Request Listener');

  console.log(patternUrls);
  chrome.webRequest.onCompleted.addListener(webrequestCallback, { urls: patternUrls }, [
    'responseHeaders',
  ]);
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request);
  if (request.cmd === 'addUrl') {
    chrome.storage.sync.get({ proxmoxUrls: [] }, (result) => {
      const urls = result.proxmoxUrls;
      if (urls.length === 1000) {
        console.error('Please Do Not Exceed 1000 URLs');
      }
      urls.push(request.data);
      chrome.storage.sync.set({ proxmoxUrls: urls }, function () {
        chrome.webRequest.onCompleted.removeListener(webrequestCallback);
        const patternUrls = constructPatterns(urls);
        console.log(patternUrls);
        chrome.webRequest.onCompleted.addListener(webrequestCallback, { urls: patternUrls }, [
          'responseHeaders',
        ]);
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
        chrome.webRequest.onCompleted.removeListener(webrequestCallback);
        const patternUrls = constructPatterns(urls);
        console.log(patternUrls);
        chrome.webRequest.onCompleted.addListener(webrequestCallback, { urls: patternUrls }, [
          'responseHeaders',
        ]);
        sendResponse({ urls });
      });
    });
  } else if (request.cmd === 'getUrls') {
    chrome.storage.sync.get({ proxmoxUrls: [] }, function (result) {
      const urls = result.proxmoxUrls;
      sendResponse({ urls: urls });
    });
  } else if (request.cmd === 'online') {
    sendResponse('I am online');
  }
  return true;
});
