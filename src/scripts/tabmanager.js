
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
import { getStorageLocal, setStorageLocal, setWakeupAction } from './chromestorageutils.js';

/*
 *   config = {
 *     max_gen: int,
 *   }
 *   data = []
 *
 */
export class TabManager {
  constructor() {
    this.config_name='config'
    this.history_name='history'
    this.tab_manager=[]
    this.tmp_detach_tabs = []
    this.def_config={
      max_gen: 7
    }
    this.stored={
      config: {},
      history: []
    }
    this.uuid=null
    this.store_keys=[
      'groupId', 'id', 'windowId',
      'title', 'url', 'status', 'favIconUrl',
      //'selected', 'pinned',
      //'height', 'width'
    ],
    this.closedWindowId=[]
  }

  async init() {
    if (this.uuid==null) {
      this.uuid=this.generateUuidv4()
    }
    try {
      this.stored.config = await getStorageLocal(this.config_name)
      if (this.stored.config == null) this.stored.config = {}
      if (Object.keys(this.stored.config).length < 1) {
        await setStorageLocal(this.config_name, this.def_config)
      }

      await this.setStoredHistory()
      console.log(await getStorageLocal(this.history_name), await getStorageLocal(this.config_name))
    } catch(err) {
      console.trace('[ERR] ', err)
    }
  }

  async setStoredHistory() {
    this.stored.history = await getStorageLocal(this.history_name)
    if (this.stored.history == null) this.stored.history = []
    /*
    this.stored.history.push(
      {
        history: this.getTabManager(),
        updated_at: this.getDateTime(),
        uuid: this.uuid
      }
    )
    */
    let isMember = false
    this.stored.history.forEach( (item, idx) => {
      if (item.uuid == this.uuid) {
        item.history = this.getTabManager()
        item.updated_at = this.getDateTime()
        isMember = true
        this.stored.history[idx] = item
      }
    })
    if (isMember === false) {
      this.stored.history.push(
        {
          history: this.getTabManager(),
          updated_at: this.getDateTime(),
          uuid: this.uuid
        }
      )
    }
    while(this.stored.history.length > this.stored.config.max_gen) {
      this.stored.history.shift()
    }
    await setStorageLocal(this.history_name, this.stored.history)
  }

  async getStoredHistory() {
    let ret = await getStorageLocal(this.history_name)
    return ret
  }

  getTabManager() {
    return this.tab_manager
  }

  pushTmpDetachTabs(push_obj = {}) {
    return this.tmp_detach_tabs.push(push_obj)
  }

  getTabToAttach(tabId, attachInfo) {
    let tab_to_attach = {}
    this.tmp_detach_tabs = this.tmp_detach_tabs.filter( item => {
      if (item.id == tabId) {
        tab_to_attach = item
      } else {
        return item
      }
    })
    return tab_to_attach
  }

  getTab(tabId, windowId) {
    let ret_tab = {}
    for (let i=0; i<this.tab_manager.length; i++) {
      if (this.tab_manager[i].windowId == windowId) {
        for (let j=0; j<this.tab_manager[i].tabs.length; j++) {
          if (this.tab_manager[i].tabs[j].id == tabId) {
            ret_tab = this.tab_manager[i].tabs[j]
            break
          }
        }
        break
      }
    }
    return ret_tab
  }

  updateTab(tabId, changeInfo=null, new_tab=null) {
    for (let i=0; i<this.tab_manager.length; i++) {
      if (this.tab_manager[i].windowId == new_tab.windowId) {
        for (let j=0; j<this.tab_manager[i].tabs.length; j++) {
          if (this.tab_manager[i].tabs[j].id == new_tab.id) {
            this.tab_manager[i].tabs[j] = new_tab
            break
          }
        }
        break
      }
    }
  }

  updateActiveTab(activeInfo) {
    const windowId = activeInfo.windowId
    const tabId = activeInfo.tabId
    for (let i=0; i<this.tab_manager.length; i++) {
      if (this.tab_manager[i].windowId == windowId) {
        for (let j=0; j<this.tab_manager[i].tabs.length; j++) {
          let tabIsActive = false
          if (this.tab_manager[i].tabs[j].id == tabId) {
            tabIsActive = true
          }
          this.tab_manager[i].tabs[j].active = tabIsActive
        }
        break
      }
    }
  }

  registTab(new_tab) {
    let isNewWin = true
    this.tab_manager.forEach( win => {
      if (win.windowId == new_tab.windowId) {
        isNewWin = false
      }
    })
    if (isNewWin) {
      this.tab_manager.push({
        windowId: new_tab.windowId,
        tabs: []
      })
    }
    this.tab_manager.forEach( (item, key) => {
      if (item.windowId == new_tab.windowId) {
        if (new_tab.url == "") {
          new_tab.url = new_tab.pendingUrl
        }
        if (item.url != new_tab.url) {
          //this.tab_manager[key].tabs.push(new_tab)
          this.tab_manager[key].tabs.push(this.cleanTabInfo(new_tab))
        }
      }
    })
  }

  unregistTab(tabId, removeInfo) {
    let unregist_tab = {}
    if (Number(tabId) >= 0 && Number(removeInfo.windowId)) {
      let window_idx = null
      for (let idx=0; idx<this.tab_manager.length; idx++) {
        this.tab_manager[idx].windowId == removeInfo.windowId
        window_idx = idx
      }
      if (typeof this.tab_manager[window_idx] == 'undefined') {
        return
      }
      const tabs_now = this.tab_manager[window_idx].tabs
      this.tab_manager[window_idx].tabs = []
      tabs_now.forEach(item => {
        if (tabId != item.id) {
          this.tab_manager[window_idx].tabs.push(item)
        } else {
          unregist_tab = item
        }
      })
    }
    return unregist_tab
  }

  unregistWindows(windowId) {
    //
    let tmp_tab_manager = []
    for (let i=0; i<this.tab_manager.length; i++) {
      let item = this.tab_manager[i].tabs
      if (this.tab_manager[i].windowId != windowId
          && this.tab_manager[i].tabs.length > 0) {
        tmp_tab_manager.push(this.tab_manager[i])
        this.setStoredHistory()
      }
    }
    this.tab_manager = tmp_tab_manager
  }

  cleanTabInfo(tab = {}) {
    let ret_tab = {}
    Object.keys(tab).forEach( (key) => {
      if (this.store_keys.includes(key)) {
        ret_tab[key] = tab[key]
      }
    })
    return ret_tab
  }

  getDateTime() {
    return JSON.stringify(new Date()).replace(/^\"/, '').replace(/\"$/, '')
    //return JSON.stringify(new Date().toLocaleString('ja-jp', { timeZone: 'Japan' }))
  }

  generateUuidv4() {
    console.trace('[UUID CREATED]')
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    });
  }
}


(async () => {
})();
