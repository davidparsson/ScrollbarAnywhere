document.addEventListener('DOMContentLoaded', () => {
  const number = 'number'
  const boolean = 'boolean'
  const string = 'string'

  const optionsToConvert = {
    button: number,
    key_shift: boolean,
    key_ctrl: boolean,
    key_alt: boolean,
    key_meta: boolean,
    scaling: number,
    speed: number,
    friction: number,
    cursor: boolean,
    notext: boolean,
    grab_and_drag: boolean,
    debug: boolean,
    blacklist: string,
    browser_enabled: boolean,
  }

  function parseOptions() {
    const options = {}
    Object.keys(optionsToConvert).forEach((key) => {
      const value = localStorage.getItem(key)
      console.log('Converting ', key, 'value:', value)
      if (value !== null) {
        if (optionsToConvert[key] === boolean) {
          options[key] = value === 'true'
        } else if (optionsToConvert[key] === number) {
          options[key] = Number(value)
        } else {
          options[key] = value
        }
      }
    })
    return options
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getOptionsFromLocalStorage') {
      const options = parseOptions()
      sendResponse(options)
    }
    return false
  })
})
