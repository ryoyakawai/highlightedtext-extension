import { TabManager } from './tabmanager.js';

(async () => {

  const tbmgr = new TabManager()

  const content_area = document.querySelector('div#content_main_00')
  let historyList = await tbmgr.getStoredHistory()
  if (historyList == null) {
    content_area.innerHTML = '(none)'
    return
  }
  //let historyList = tbmgr.getTabManager()
  historyList.forEach( item => {
    let ul_00 = document.createElement('ul')
    let li_00 = document.createElement('li')
    let button_00 = document.createElement('button')
    button_00.setAttribute('id', `${item.uuid}`)
    button_00.innerHTML = "OPEN ALL"
    button_00.addEventListener('mousedown', (event) => {
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
              //window.alert(JSON.stringify(windowInfo.tabs.slice().shift().id))
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
    })
    //
    let span_00 = document.createElement('span')
    span_00.innerHTML = `${item.updated_at} ${item.uuid} (${item.history.length})`
    li_00.appendChild(span_00)
    li_00.appendChild(button_00)
    ul_00.appendChild(li_00)
    content_area.appendChild(ul_00)

    let ul_01 = document.createElement('ul')
    item.history.forEach( (window, window_idx) => {
      window.tabs.forEach( (tab, tab_idx) => {
        //if (tab.url.match(/^chrome:\/\//)==null) {
          let li_01 = document.createElement('li')
          let a_elem = document.createElement('a')
          a_elem.href=`${tab.url}`
          a_elem.innerHTML=`${window_idx} - [${tab_idx}] ${tab.title} ${tab.active===true ? '😎' : ''}`
          li_01.appendChild(a_elem)
          ul_01.appendChild(li_01)
        //}
      })
    })
    li_00.appendChild(ul_01)
  })

  //document.querySelector("div#debug_area").innerHTML = JSON.stringify(historyList)
})()
