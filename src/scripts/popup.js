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
          chrome.windows.create({
            type: 'normal',
            width: wndw.tabs[0].width,
            height: wndw.tabs[0].height
          }, (windowInfo) => {
            let firstTabId = windowInfo.tabs.slice().shift().id
            wndw.tabs.forEach(tab => {
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
          })
        })
      })
    }, false)
    const button_remove_00 = convertStringToDom(`<button id="${item.uuid}">REMOVE</button>`)
    button_remove_00.addEventListener('mousedown', (event) => {
      tbmgr.removeOneHistory(event.target.id)
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

    let window_div_parent = document.createElement('div')
    item.history.forEach( (window, window_idx) => {
      const window_div_00 = convertStringToDom(`<div id="${item.uuid}:::${window_idx}" class="card in-window-00"></div>`)
      const window_items_ul_00 = convertStringToDom(`<ul class="window-items-00"></ul>`)
      window.tabs.forEach( (tab, tab_idx) => {
        const li_01 = convertStringToDom(`<li class="window-item-00">${tab.title} ${tab.active===true ? '😎' : ''}</li>`)
        window_items_ul_00.appendChild(li_01)
        //window_div_00.appendChild(div_01)
      })
      window_div_00.appendChild(window_items_ul_00)
      window_div_parent.appendChild(window_div_00)
      window_div_00.addEventListener('mousedown', (event) => {
        if (event.target.id != '') {
          event.target.id = event.target.id
        } else
        if (event.target.parentNode.id != '') {
          event.target.id = event.target.parentNode.id
        } else
        if (event.target.parentNode.parentNode.id != '') {
          event.target.id = event.target.parentNode.parentNode.id
        }
        console.log(event.target.id)
        const [target_uuid, target_tab_idx] = event.target.id.split(':::')
        for (let i=0; i<historyList.length; i++) {
          const wndw = historyList[i]
          if (wndw.uuid == target_uuid) {
            console.log(wndw.history[target_tab_idx])
            chrome.windows.create({
              type: 'normal',
              width: wndw.history[target_tab_idx].tabs[0].width,
              height: wndw.history[target_tab_idx].tabs[0].height
            }, (windowInfo) => {
              let firstTabId = windowInfo.tabs.slice().shift().id
              wndw.history[target_tab_idx].tabs.forEach(tab => {
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
            })
            break
          }
        }
      }, false)
    })
    div_00.appendChild(window_div_parent)
  })

  //document.querySelector("div#debug_area").innerHTML = JSON.stringify(historyList)
})()
