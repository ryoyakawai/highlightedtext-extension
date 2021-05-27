'use strict';

{

  const _TEXT_CONTEXT = "Copy highlighting text URL 👉 [%s]"
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
      title: _TEXT_CONTEXT,
      contexts:["selection"],
      id: 'highlightText',
    });
  });

  chrome.contextMenus.onClicked.addListener(item => {
    copyToClipboard(`${item.pageUrl.split('#').shift()}#:~:text=${item.selectionText}`)
  })

}

