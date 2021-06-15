import { TabManager } from './tabmanager.js';
import { convertStringToDom, convertUTCToJST } from './htmlutils.js';

(async () => {

  const tbmgr = new TabManager()

  const content_area = document.querySelector('div#content_main_00')
  let historyListSync = await tbmgr.getStoredHistorySync()
  console.log('[SYNCED] ', historyListSync)
  let historyList = (await tbmgr.getStoredHistory()).reverse()
  if (historyList == null) {
    content_area.innerHTML = '(none)'
    return
  }
  //let historyList = tbmgr.getTabManager()
  historyList.forEach( item => {
    const div_00 = convertStringToDom(`<div id="history-parent-${item.uuid}" class="card window-sets-00"></div>`)
    const button_open_00 = convertStringToDom(`<button id="${item.uuid}">OPEN ALL</button>`)
    button_open_00.addEventListener('mousedown', (event) => {
      const target_data = historyList.filter( item => {
        if (item.uuid == event.target.id) {
          return item
        }
      })
      target_data.forEach( sets => {
        sets.history.forEach(wndw => {
          openWindowsTabs(wndw, null)
        })
      })
    }, false)
    const button_remove_00 = convertStringToDom(`<button id="${item.uuid}">REMOVE</button>`)
    button_remove_00.addEventListener('mousedown', (event) => {
      tbmgr.removeOneHistory(event.target.id) // event.target.id: uuid
      document.querySelector(`#history-parent-${item.uuid}`).remove()
    }, false)
    const button_sync_00 = convertStringToDom(`<button id="${item.uuid}">SYNC</button>`)
    button_sync_00.addEventListener('mousedown', async (event) => {
      await tbmgr.setStoredHistorySync(historyList.slice().pop())
    }, false)

    //
    //const span_00 = convertStringToDom(`<span>${item.updated_at} ${item.uuid} (${item.history.length})</span>`)
    const div_updated_at_00 = convertStringToDom(`<div class="updated_at_00">[LastUpdated] ${convertUTCToJST(item.updated_at)}</div>`)
    div_00.appendChild(div_updated_at_00)
    //
    let ctrl_area_div = convertStringToDom(`<div></div>`)
    ctrl_area_div.appendChild(button_open_00)
    ctrl_area_div.appendChild(button_remove_00)
    ctrl_area_div.appendChild(button_sync_00)
    div_00.appendChild(ctrl_area_div)
    content_area.appendChild(div_00)

    let window_div_parent = convertStringToDom(`<div id="window-parent-${item.uuid}"></div>`)
    item.history.forEach( (window, window_idx) => {
      const window_div_00 = convertStringToDom(`<div id="history-window-${item.uuid}---${window_idx}" class="card in-window-00"></div>`)
      const window_div_00_ctrl_area = convertStringToDom(`<div class="in-window-00_ctrl_area"></div>`)
      const button_window_open_00 = convertStringToDom(`<button id="${item.uuid}---${window_idx}" class="small">open</button>`)
      const button_window_clear_00 = convertStringToDom(`<button id="${item.uuid}---${window_idx}" class="small">Clear</button>`)
      const button_window_copy_00 = convertStringToDom(`<button id="${item.uuid}---${window_idx}" class="small">Copy</button>`)
      window_div_00_ctrl_area.appendChild(button_window_copy_00)
      window_div_00_ctrl_area.appendChild(button_window_clear_00)
      window_div_00_ctrl_area.appendChild(button_window_open_00)
      button_window_copy_00.addEventListener('mousedown', async (event) => {
        const [target_uuid, target_window_idx] = event.target.id.replace(/^history\-window\-/, '').split('---')
        let arr_copy_to_clipboard = []
        try {
          (await tbmgr.fetchOneHistory(target_uuid, target_window_idx)).forEach( item => {
            arr_copy_to_clipboard.push(`[${item.title}] ${item.url}`)
          })
          await navigator.clipboard.writeText(arr_copy_to_clipboard.join("\n"))
        } catch(err) {
          console.error('Failed to copy: ', err)
        }
      })
      button_window_clear_00.addEventListener('mousedown', (event) => {
        const [target_uuid, target_window_idx] = event.target.id.replace(/^history\-window\-/, '').split('---')
        tbmgr.removeOneWindowHisotry(target_uuid, target_window_idx) // event.target.id: uuid
        document.querySelector(`#history-window-${event.target.id}`).remove()
        if (document.querySelector(`div#window-parent-${target_uuid}`).childNodes.length < 1) {
          document.querySelector(`div#history-parent-${target_uuid}`).remove()
        }
        event.preventDefault()
        event.stopPropagation()
      }, false)
      button_window_open_00.addEventListener('mousedown', (event) => {
        if (event.target.id != '') {
          event.target.id = event.target.id
        } else {
          event.target.id = event.target.parentNode.id != ''
                          ? event.target.parentNode.id : event.target.parentNode.parentNode.id
        }
        const [target_uuid, target_tab_idx] = event.target.id.split('---')
        for (let i=0; i<historyList.length; i++) {
          const wndw = historyList[i]
          if (wndw.uuid == target_uuid) {
            openWindowsTabs(wndw, target_tab_idx)
            break
          }
        }
        event.preventDefault()
        event.stopPropagation()
      }, false)
      const window_items_ul_00 = convertStringToDom(`<ul class="window-items-00"></ul>`)
      window.tabs.forEach( (tab, tab_idx) => {
        const li_01 = convertStringToDom(`<li class="window-item-00">${tab.title} ${tab.active===true ? '😎' : ''}</li>`)
        window_items_ul_00.appendChild(li_01)
        //window_div_00.appendChild(div_01)
      })
      window_div_00.appendChild(window_div_00_ctrl_area)
      window_div_00.appendChild(window_items_ul_00)
      window_div_parent.appendChild(window_div_00)
      window_div_00.addEventListener('mousedown', (event) => {
        console.log('[CLICKED DIV ELEM]')
        event.preventDefault()
        event.stopPropagation()
      }, false)
    })
    div_00.appendChild(window_div_parent)
  })

  function openWindowsTabs(wndw=null, target_tab_idx=null) {
    const window_size = {}
    if (target_tab_idx != null) {
      window_size.width = wndw.history[0].tabs[0].width
      window_size.height = wndw.history[0].tabs[0].height
    } else {
      window_size.width = wndw.tabs[0].width
      window_size.height = wndw.tabs[0].height
    }
    chrome.windows.create({
      type: 'normal',
      width: window_size.width,
      height: window_size.height
    }, (windowInfo) => {
      _openTabs(windowInfo, wndw, target_tab_idx)
    })

    function _openTabs(windowInfo=null, wndw=null, target_tab_idx=null) {
      if (windowInfo==null || wndw==null) {
        return
      }
      let firstTabId = windowInfo.tabs.slice().shift().id
      let forEachTabs = []
      if (target_tab_idx!=null) {
        forEachTabs = wndw.history[target_tab_idx].tabs
      } else {
        forEachTabs = wndw.tabs
      }
      forEachTabs.forEach(tab => {
        if (tab.url.match(/^chrome:\/\//)===null) {
          let createData = {
            url: tab.url,
            active: tab.active
          }
          if(firstTabId!=null) {
            chrome.tabs.update(firstTabId, createData, (event) => {})
            firstTabId = null
          } else {
            createData.windowId=windowInfo.id
            chrome.tabs.create(createData, (event) => {})
          }
        }
      })
    }
  }

/*
  function openTabs(windowInfo=null, wndw=null, target_tab_idx=null) {
    if (windowInfo==null || wndw==null) {
      return
    }
    let firstTabId = windowInfo.tabs.slice().shift().id
    let forEachTabs = []
    if (target_tab_idx!=null) {
      forEachTabs = wndw.history[target_tab_idx].tabs
    } else {
      forEachTabs = wndw.tabs
    }
    forEachTabs.forEach(tab => {
      if (tab.url.match(/^chrome:\/\//)===null) {
        let createData = {
          url: tab.url,
          active: tab.active
        }
        if(firstTabId!=null) {
          chrome.tabs.update(firstTabId, createData, (event) => {})
          firstTabId = null
        } else {
          createData.windowId=windowInfo.id
          chrome.tabs.create(createData, (event) => {})
        }
      }
    })
  }
*/
  //document.querySelector("div#debug_area").innerHTML = JSON.stringify(historyList)
})()
