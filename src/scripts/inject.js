(() => {
  let injectFiles = [
    //{ type: 'module', path: 'scripts/chromeutils.js' },
  ]

  for(let i in injectFiles) {
    const src = chrome.extension.getURL(injectFiles[i].path)
    const script = document.createElement('script')
    script.setAttribute('src', src)
    script.setAttribute('type', injectFiles[i].type)
    document.body.appendChild(script)
  }
})()
