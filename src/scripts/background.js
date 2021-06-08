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

let _MAX_GEN = 10

chrome.runtime.onInstalled.addListener(() => {

const _TEXT_CONTEXT = "Copy highlighting text URL 👉 [%s]"
  const copyToClipboard = str => {
    const el = document.createElement('textarea')
    el.value = str
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy');
    document.body.removeChild(el)
  }

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
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      tbmgr.registTab(tab)
    })
    tbmgr.init()
    console.log('[LIST ALL TABS] ', tbmgr.getTabManager())
  })

  chrome.windows.onRemoved.addListener( (windowId) => {
    tbmgr.unregistWindows(windowId)
    console.log('[onRemoved] ', tbmgr.getTabManager())
  })

  chrome.tabs.onCreated.addListener( (new_tab) => {
    tbmgr.registTab(new_tab)
    console.log('[onCreated] ', tbmgr.getTabManager())
  })

  chrome.tabs.onDetached.addListener( (tabId, detachInfo) => {
    console.log('[Detach]', tabId, detachInfo)
    const unregisted_tab = tbmgr.unregistTab(tabId, {windowId: detachInfo.oldWindowId})
    unregisted_tab.windowId = null
    tbmgr.pushTmpDetachTabs(unregisted_tab)
    console.log('[onDetached] ', tbmgr.getTabManager())
  })

  chrome.tabs.onAttached.addListener( (tabId, attachInfo) => {
    const tab_to_attach = tbmgr.getTabToAttach(tabId, attachInfo)
    tab_to_attach.windowId = attachInfo.newWindowId
    tbmgr.registTab(tab_to_attach)
    console.log('[onDetached] ', tbmgr.getTabManager())
  })

  chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab) => {
    if (changeInfo.status=='complete') {
      tbmgr.updateTab(tabId, changeInfo, tab)
    }
  })

  chrome.tabs.onRemoved.addListener( (tabId, removeInfo) => {
    chrome.tabs.query({}, (info) => {
      tbmgr.unregistTab(tabId, removeInfo)
    })
    console.log('[onRemove] ', tbmgr.getTabManager())
  })

})

