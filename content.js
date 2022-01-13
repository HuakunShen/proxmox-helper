const currentUrl = window.location.href;
let matched = false;

const matchedAnyInterestedUrl = (urls) =>
  urls.map((url) => currentUrl.startsWith(url)).some((e) => e === true);

const main = () => {
  let waitLimit = 2000;
  let timePassed = 0;
  const intervalTime = 500;
  const close = () => {
    const closeBtn = document.querySelector('.x-tool-close');
    closeBtn && closeBtn.click();
    return Boolean(closeBtn);
  };
  close();
  const interval = setInterval(() => {
    close() && clearInterval(interval);
    timePassed > waitLimit && clearInterval(interval);
    timePassed += intervalTime;
  }, intervalTime);
};

const match = (urls) => {
  if (matchedAnyInterestedUrl(urls)) {
    matched = true;
    console.log('matched');
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      console.log(request);
      if (request === 'subscription') {
        main();
      }
    });
  }
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request);
  if (request.cmd === 'updateUrl') {
    if (!matched) {
      match(request.data);
    }
  }
});

chrome.storage.sync.get(['proxmoxUrls'], (result) => {
  match(result.proxmoxUrls);
});
