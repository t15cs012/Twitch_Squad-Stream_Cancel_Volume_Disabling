var element = document.createElement('script');
element.src = chrome.runtime.getURL('cancel-volume-disabling.js');
document.body.appendChild(element);
