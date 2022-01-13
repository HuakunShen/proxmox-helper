let interestedUrls = [];
setTimeout(() => {
  chrome.runtime.sendMessage({ cmd: 'getUrls' }, function (response) {
    console.log(response);
    interestedUrls = response.urls;
    updateURLs(interestedUrls);
  });
}, 100);

const addURL = (url) => {
  chrome.runtime.sendMessage({ cmd: 'addUrl', data: url }, function (response) {
    interestedUrls = response.urls;
    updateURLs(interestedUrls);
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { cmd: 'updateUrl', data: interestedUrls },
        function (response) {
          console.log(response);
        }
      );
    });
  });
};
const removeURLbyIdx = (idx) => {
  chrome.runtime.sendMessage({ cmd: 'removeUrlByIdx', data: idx }, (response) => {
    interestedUrls = response.urls;
    console.log(interestedUrls);
    updateURLs(interestedUrls);
  });
};
const updateURLs = (urls) => {
  $('#url-list').empty();
  urls.forEach((url, index) => {
    $('#url-list')
      .append(`<li class="list-group-item d-flex justify-content-between align-items-start">
            <div class="ms-2 me-auto">${url}</div>
            <span class="del-btn badge bg-danger rounded-pill" idx=${index}>&#x232B;</span>
          </li>`);
  });
  $('.del-btn').on('click', (e) => {
    const idx = e.target.getAttribute('idx');
    removeURLbyIdx(idx);
    updateURLs(interestedUrls);
  });
};
updateURLs(interestedUrls);
$('#add-url-form').submit((e) => {
  e.preventDefault();
  const url = $('#url-input').val();
  if (!url.match(/https?:\/\/.*/g)) {
    alert('URL Pattern must start with http or https');
    return;
  }
  addURL(url);
  updateURLs(interestedUrls);
});
