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


  const tab_manager = []
  // [ {windowId: INT, tabs: [] } ]
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      title: _TEXT_CONTEXT,
      contexts:["selection"],
      id: 'highlightText',
    })

    chrome.windows.onRemoved.addListener( (windowId) => {
    })

    chrome.tabs.onCreated.addListener( (new_tab) => {
      // タブ作成時にGlobalに情報を持って管理を開始
      let isNewWin = true
      let isNewUrl = true
      tab_manager.forEach( win => {
        if (win.windowId == new_tab.windowId) {
          isNewWin = false
          for (let i=0; i<win.tabs.length; i++) {
            if (win.tabs[i].url == new_tab.url) {
              isNewUrl = false
              break
            }
          }
        }
      })
      if (isNewWin) {
        tab_manager.push({
          windowId: new_tab.windowId,
          tabs: []
        })
      }
      if (isNewUrl) {
        tab_manager.forEach( (item, key) => {
          if (new_tab.url == "") {
            new_tab.url = new_tab.pendingUrl
          }
          if (item.url != new_tab.url) {
            tab_manager[key].tabs.push(new_tab)
          }
        })
      }
      console.log(tab_manager)
    })

    chrome.tabs.onRemoved.addListener( (tabId, removeInfo) => {
      console.log('[REMOVED]', tabId, removeInfo)
      chrome.tabs.query({}, (info) => {
        console.log(' >>> ', info)
      })
      console.log('[BEFORE] ', tab_manager)
      if (Number(tabId) >= 0 && Number(removeInfo.windowId)) {
        let window_idx = null
        for (let idx=0; idx<tab_manager.length; idx++) {
          tab_manager[idx].windowId == removeInfo.windowId
          window_idx = idx
        }
        const tabs_now = tab_manager[window_idx].tabs
        tab_manager[window_idx].tabs = tabs_now.filter(item => {
          if (tabId != item.id) {
            return item
          }
        })
      }
      console.log('[AFTER] ', tab_manager)
      // タブClose時にGlobalに情報を持って管理対象から外す
      // ?? Windowが閉じられて終了した場合との区別どうするの？
      // URL変わった場合キャッチが必要
      // タブが他から持ってこられた/外に持ち出された場合も処理が必要
    })

    console.log(chrome.tabs.query({}, (tabs) => {
      console.log(tabs)
    }))
  });

  chrome.contextMenus.onClicked.addListener(item => {
    copyToClipboard(`${item.pageUrl.split('#').shift()}#:~:text=${item.selectionText}`)
  })
}
