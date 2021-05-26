'use strict';

{
  const copyToClipboard = str => {
    const el = document.createElement('textarea')
    el.value = str
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy');
    document.body.removeChild(el)
  }

  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      title: "Copy link with high light -> [%s]",
      contexts:["selection"],
      id: 'highlightText',
    });
  });

  chrome.contextMenus.onClicked.addListener(item => {
    copyToClipboard(`${item.pageUrl.split('#').shift()}#:~:text=${item.selectionText}`)
  })

}

