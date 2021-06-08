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

  chrome.contextMenus.onClicked.addListener(item => {
    copyToClipboard(`${item.pageUrl.split('#').shift()}#:~:text=${item.selectionText}`)
  })

  //

  let tab_manager = []
  let tmp_detach_tabs = []
  // [ {windowId: INT, tabs: [] } ]
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      title: _TEXT_CONTEXT,
      contexts:["selection"],
      id: 'highlightText',
    })

    chrome.windows.onRemoved.addListener( (windowId) => {
      unregistWindows(windowId)
      console.log('[onRemoved] ', tab_manager)
    })

    chrome.tabs.onCreated.addListener( (new_tab) => {
      registTab(new_tab)
      console.log('[onCreated] ', tab_manager)
    })

    chrome.tabs.onDetached.addListener( (tabId, detachInfo) => {
      console.log('[Detach]', tabId, detachInfo)
      const unregisted_tab = unregistTab(tabId, {windowId: detachInfo.oldWindowId})
      unregisted_tab.windowId = null
      tmp_detach_tabs.push(unregisted_tab)
      console.log('[onDetached] ', tab_manager)
    })

    chrome.tabs.onAttached.addListener( (tabId, attachInfo) => {
      let tab_to_attach = {}
      tmp_detach_tabs = tmp_detach_tabs.filter( item => {
        if (item.id == tabId) {
          tab_to_attach = item
        } else {
          return item
        }
      })
      tab_to_attach.windowId = attachInfo.newWindowId
      registTab(tab_to_attach)
      console.log('[onDetached] ', tab_manager)
    })

    chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab) => {
      if (changeInfo.status=='complete') {
        updateTab(tabId, changeInfo, tab)
      }
    })

    chrome.tabs.onRemoved.addListener( (tabId, removeInfo) => {
      chrome.tabs.query({}, (info) => {
        unregistTab(tabId, removeInfo)
      })
      console.log('[onRemove] ', tab_manager)
    })

    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        registTab(tab)
      })
      console.log('[LIST ALL TABS] ', tab_manager)
    })
  });

  function getTab(tabId, windowId) {
    let ret_tab = {}
    for (let i=0; i<tab_manager.length; i++) {
      if (tab_manager[i].windowId == windowId) {
        for (let j=0; j<tab_manager[i].tabs.length; j++) {
          if (tab_manager[i].tabs[j].id == tabId) {
            ret_tab = tab_manager[i].tabs[j]
            break
          }
        }
        break
      }
    }
    return ret_tab
  }

  function updateTab(tabId, changeInfo=null, new_tab=null) {
    for (let i=0; i<tab_manager.length; i++) {
      if (tab_manager[i].windowId == new_tab.windowId) {
        for (let j=0; j<tab_manager[i].tabs.length; j++) {
          if (tab_manager[i].tabs[j].id == new_tab.id) {
            tab_manager[i].tabs[j] = new_tab
            break
          }
        }
        break
      }
    }
  }

  function registTab(new_tab) {
    let isNewWin = true
    let isNewUrl = true
    tab_manager.forEach( win => {
      if (win.windowId == new_tab.windowId) {
        isNewWin = false
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
        if (item.windowId == new_tab.windowId) {
          if (new_tab.url == "") {
            new_tab.url = new_tab.pendingUrl
          }
          if (item.url != new_tab.url) {
            tab_manager[key].tabs.push(new_tab)
          }
        }
      })
    }
  }

  function unregistTab(tabId, removeInfo) {
    let unregist_tab = {}
    if (Number(tabId) >= 0 && Number(removeInfo.windowId)) {
      let window_idx = null
      for (let idx=0; idx<tab_manager.length; idx++) {
        tab_manager[idx].windowId == removeInfo.windowId
        window_idx = idx
      }
      if (typeof tab_manager[window_idx] == 'undefined') {
        return
      }
      const tabs_now = tab_manager[window_idx].tabs
      tab_manager[window_idx].tabs = []
      tabs_now.forEach(item => {
        if (tabId != item.id) {
          tab_manager[window_idx].tabs.push(item)
        } else {
          unregist_tab = item
        }
      })
    }
    return unregist_tab
  }

  function unregistWindows(windowId) {
    let tmp_tab_manager = []
    for (let i=0; i<tab_manager.length; i++) {
      let item = tab_manager[i].tabs
      if (tab_manager[i].windowId != windowId
          && tab_manager[i].tabs.length > 0) {
        tmp_tab_manager.push(tab_manager[i])
      }
    }
    tab_manager = tmp_tab_manager
  }

}
