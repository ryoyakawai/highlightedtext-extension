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

export { convertStringToDom, convertUTCToJST }

function convertStringToDom(htmlString = '') {
  const wrapper= document.createElement('div')
  wrapper.innerHTML= htmlString
  return wrapper.firstChild
}

function convertUTCToJST(dateTime=null) {
  if (dateTime == null) {
    dateTime = JSON.stringify(new Date()).replace(/^\"/, '').replace(/\"$/, '')
  }
  const [j_date, j_time]=JSON.stringify(new Date(dateTime).toLocaleString('ja-jp', { timeZone: 'Japan' })).replace(/^"|"$/g, '').split(" ")
  return `${j_date.split('/')[0]}-${('00' + j_date.split('/')[1]).substr(-2)}-${('00' + j_date.split('/')[2]).substr(-2)} ${j_time} (JST)`
}

