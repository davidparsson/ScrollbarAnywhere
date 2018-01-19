defaultOptions = { "button":    2,
                   "key_shift": false,
                   "key_ctrl":  false,
                   "key_alt":   false,
                   "key_meta":  false,
                   "scaling":   1,
                   "speed":     6000,
                   "friction":  10,
                   "cursor":    true,
                   "notext":    false,
                   "grab_and_drag": false,
                   "debug":     false,
                   "blacklist": "",
                 }

for (var k in defaultOptions)
  if (typeof localStorage[k] == 'undefined')
    localStorage[k] = defaultOptions[k]


function loadOptions() {
  var o = {}
  for (var k in defaultOptions) o[k] = localStorage[k]
  return o
}

clients = {}

chrome.extension.onConnect.addListener(function(port) {
  port.postMessage({ saveOptions: localStorage })
  var id = port.sender.tab.id + ":" + port.sender.frameId
  console.log("connect: "+id)
  clients[id] = port
  port.onDisconnect.addListener(function() {
    console.log("disconnect: "+id)
    delete clients[id]
  })
})

function saveOptions(o) {
  for (var k in o) {
    localStorage[k] = o[k]
  }

  for (var id in clients) {
    clients[id].postMessage({ saveOptions: localStorage })
  }
}

// This does not require "permissions":["tabs"] becuase it only acts on its
// current tab.
chrome.contextMenus.create({
  title:"Add site to SA blacklist",
  contexts:["all"],
  type:"normal",
  onclick:function(info, tab) {
    // 'document.location.hostname' here is a string containing our app ID.
    // info.pageUrl and tab.url are both the full URL of this page, we only
    // want the hostname, so use a dummy object (instead of requiring another
    // library to parse the URL)
    var dummy = document.createElement('a')
    dummy.href = tab.url

    // Use dummy.hostname for now; If @davidparsson agrees on issue #68, then
    // this should change to use dummy.host as well.
    blacklist = localStorage["blacklist"].split('\n')

    for (var i = blacklist.length - 1; i >= 0; i--) {
      var blacklistEntry = blacklist[i].trim();
      if (dummy.hostname === blacklistEntry) {
        // no need to check subdomains when adding to list
        console.log(dummy.hostname,'already in blacklist')
        return
      }
    }
    console.log('pushing',dummy.hostname,'to blacklist')
    blacklist.push(dummy.hostname)
    localStorage['blacklist'] = blacklist.join('\n')
    saveOptions({o:'blacklist'})
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
