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

export { getStorage, setStorage, getStorageLocal, setStorageLocal, setWakeupAction }

async function getStorage(name) {
  return new Promise( (resolve, reject) => {
    try {
      chrome.storage.sync.get(name, (data) => {
        if(typeof data[name]=='undefined') {
          data[name] = null
        }
        resolve(data[name])
      })
    } catch (e) {
      console.log('[ERR:Storage] ', e)
      reject(new Error(e))
    }
  })
}

async function setStorage(name, data) {
  return new Promise((resolve, reject) => {
    try {
      let setData = {}
      setData[name] = data
      chrome.storage.sync.set(setData, () => {
        resolve(true)
      })
    } catch(e) {
      reject(new Error(e))
    }
  })
}

async function getStorageLocal(name) {
  return new Promise( (resolve, reject) => {
    try {
      chrome.storage.local.get(name, (data) => {
        if(typeof data[name]=='undefined') {
          data[name] = null
        }
        resolve(data[name])
      })
    } catch (e) {
      console.log('[ERR:Storage] ', e)
      reject(new Error(e))
    }
  })
}

async function setStorageLocal(name, data) {
  return new Promise((resolve, reject) => {
    try {
      let setData = {}
      setData[name] = data
      chrome.storage.local.set(setData, () => {
        resolve(true)
      })
    } catch(e) {
      reject(new Error(e))
    }
  })
}

function updateIcon(icon) {
  chrome.browserAction.setIcon({
    imageData : icon
  });
}

function updateBadgeText(text) {
  chrome.browserAction.setBadgeText({text: text});
}

function updateTitle(text) {
  chrome.browserAction.setTitle({title: text});
}

function opentab(path) {
  chrome.tabs.create({ url: path });
}

function setWakeupAction(callback) {
  chrome.idle.onStateChanged = callback;
}
