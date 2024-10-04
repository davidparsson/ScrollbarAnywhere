const defaultOptions = {
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

self.addEventListener('install', async (event) => {
  const loadedOptions = await chrome.storage.local.get('browser_enabled')
  updateExtensionIcon(loadedOptions.browser_enabled !== false)
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

function saveOptions(o) {
  console.log('Saving options:', o)
  chrome.storage.local.set(o)
}

async function getOptionsFromLocalStorage() {
  console.log('Converting options from localStorage...')

  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['DOM_PARSER'],
    justification: 'Preserve options from previous versions',
  })

  const oldOptions = await chrome.runtime.sendMessage({
    action: 'getOptionsFromLocalStorage',
  })
  console.log('Old options:', oldOptions)

  await chrome.offscreen.closeDocument()

  console.log('Restored options from localStorage:', oldOptions)
  return oldOptions
}

function sanitizeOptions(loadedOptions) {
  const sanitizedOptions = {}
  for (var key in defaultOptions) {
    if (typeof loadedOptions[key] == 'undefined') {
      sanitizedOptions[key] = defaultOptions[key]
    } else {
      sanitizedOptions[key] = loadedOptions[key]
    }
  }
  return sanitizedOptions
}

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Extension installed:', details)
  let loadedOptions = await chrome.storage.local.get(null)

  if (
    details.reason === chrome.runtime.OnInstalledReason.UPDATE &&
    Object.keys(loadedOptions).length === 0
  ) {
    loadedOptions = await getOptionsFromLocalStorage()
  }

  const options = sanitizeOptions(loadedOptions)

  saveOptions(options)
})

chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started')
})

function updateExtensionIcon(enabled) {
  if (enabled) {
    chrome.action.setIcon({ path: 'icon16.png' })
  } else {
    chrome.action.setIcon({ path: 'icon16dis.png' })
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  const loadedOptions = await chrome.storage.local.get('browser_enabled')
  const browser_enabled = !loadedOptions.browser_enabled
  saveOptions({ browser_enabled })
})

chrome.storage.local.onChanged.addListener(function (changes, namespace) {
  for (var key in changes) {
    if (key === 'browser_enabled') {
      updateExtensionIcon(changes[key].newValue)
    }
  }
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
