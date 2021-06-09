/**
 * Copyright 2021 Ryoya Kawai
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import { TabManager } from './tabmanager.js';

let _MAX_GEN = 8;

(async () => {
})();

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
})

chrome.contextMenus.create({
  title: _TEXT_CONTEXT,
  contexts:["selection"],
  id: 'highlightText',
})

chrome.contextMenus.onClicked.addListener(item => {
  copyToClipboard(`${item.pageUrl.split('#').shift()}#:~:text=${item.selectionText}`)
})

/////

const tbmgr = new TabManager()
chrome.tabs.query({}, async (tabs) => {
  tabs.forEach(tab => {
    tbmgr.registTab(tab)
  })
  tbmgr.init()
  console.log('[LIST ALL TABS] ', await tbmgr.getStoredHistory())
})

chrome.windows.onRemoved.addListener( async (windowId) => {
  //tbmgr.setStoredHistory()
  tbmgr.unregistWindows(windowId)
  //console.log('[onRemoved] ', await tbmgr.getStoredHistory())
  console.log('[windows.onRemoved] ', tbmgr.getTabManager(), windowId)
})

chrome.tabs.onActivated.addListener( (activeInfo) => {
  tbmgr.updateActiveTab(activeInfo)
  tbmgr.setStoredHistory()
  //console.log(activeInfo)
})

chrome.tabs.onCreated.addListener( async (new_tab) => {
  tbmgr.registTab(new_tab)
  //console.log('[onCreated] ', await tbmgr.getStoredHistory())
  tbmgr.setStoredHistory()
  console.log('[onCreated] ', tbmgr.getTabManager())
})

chrome.tabs.onDetached.addListener( async (tabId, detachInfo) => {
  console.log('[Detach]', tabId, detachInfo)
  const unregisted_tab = tbmgr.unregistTab(tabId, {windowId: detachInfo.oldWindowId})
  unregisted_tab.windowId = null
  tbmgr.pushTmpDetachTabs(unregisted_tab)
  //console.log('[onDetached] ', await tbmgr.getStoredHistory())
  tbmgr.setStoredHistory()
  console.log('[onDetached] ', tbmgr.getTabManager())
})

chrome.tabs.onAttached.addListener( async (tabId, attachInfo) => {
  const tab_to_attach = tbmgr.getTabToAttach(tabId, attachInfo)
  tab_to_attach.windowId = attachInfo.newWindowId
  tbmgr.registTab(tab_to_attach)
  //console.log('[onDetached] ', await tbmgr.getStoredHistory())
  tbmgr.setStoredHistory()
  console.log('[onDetached] ', tbmgr.getTabManager())
})

chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab) => {
  //if (changeInfo.status=='complete') {
    tbmgr.updateTab(tabId, changeInfo, tab)
    tbmgr.setStoredHistory()
  //}
})

chrome.tabs.onRemoved.addListener( async (tabId, removeInfo) => {
  if (removeInfo.isWindowClosing === false) {
    chrome.tabs.query({}, (info) => {
      tbmgr.unregistTab(tabId, removeInfo)
    })
    //console.log('[onRemove] ', await tbmgr.getStoredHistory())
    tbmgr.setStoredHistory()
    console.log('[tabs.onRemove] ', tbmgr.getTabManager(), tabId, removeInfo)
  }
})


