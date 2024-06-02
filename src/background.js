var defaultOptions = {
  button: 2,
  key_shift: false,
  key_ctrl: false,
  key_alt: false,
  key_meta: false,
  scaling: 1,
  speed: 6000,
  friction: 10,
  cursor: true,
  notext: false,
  grab_and_drag: false,
  debug: false,
  blacklist: '',
  browser_enabled: true,
}

const options = {}

self.addEventListener('install', (event) => {
  // chrome.storage.local.clear()
  chrome.storage.local.get(null, function (loadedOptions) {
    console.log('Loading stored options:', loadedOptions)
    let optionsChanged = false

    // TODO: Trigger offscreen conversion of window.localStorage to chrome.storage
    for (var key in defaultOptions) {
      if (typeof loadedOptions[key] == 'undefined') {
        optionsChanged = true
        options[key] = defaultOptions[key]
      } else {
        options[key] = loadedOptions[key]
      }
    }

    if (optionsChanged) {
      console.log('Loaded options changed.')
      saveOptions(options)
    }

    console.log('Loaded options:', options)

    // TODO: Remove unused options (not in defaultOptions)?
    // for (var key in loadedOptions) {
    //   if (typeof defaultOptions[key] == 'undefined') {
    //     chrome.storage.local.remove(key)
    //   }
    // }

  })
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

function saveOptions(o) {
  console.log('Saving options:', o)
  chrome.storage.local.set(o)
}

chrome.action.onClicked.addListener(function (tab) {
  options.browser_enabled = !(options.browser_enabled == true || options.browser_enabled == 'true')
  if (options.browser_enabled) {
    chrome.action.setIcon({ path: 'icon16.png' })
  } else {
    chrome.action.setIcon({ path: 'icon16dis.png' })
  }
  saveOptions({browser_enabled: options.browser_enabled})
})

// Inject content script into all existing tabs (doesn't work)
// This functionality requires
//  "permissions": ["tabs"]
// in manifest.json
/*
chrome.windows.getAll({populate:true}, function(wins) {
  wins.forEach(function(win) {
    win.tabs.forEach(function(tab) {
      chrome.tabs.executeScript(tab.id,{file:"content.js",allFrames:true});
    })
  })
})
*/
