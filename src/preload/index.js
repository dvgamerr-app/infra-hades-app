import { ipcRenderer, contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { domReady, createPreloading } from './dom'

Promise.all([
  domReady(),
  ipcRenderer.invoke('INIT-CONFIG')
]).then(config => {
  const preload = createPreloading(config[1].user)
  const loading = document.querySelector('#loading .text')

  // Custom APIs for renderer
  const api = {
    initConfig: () => ipcRenderer.invoke('INIT-CONFIG'),
    preloadRemove: () => preload.remove(),
    preloadInitText: (msg) => loading.textContent = msg
  }

  if (process.contextIsolated) {
    try {
      contextBridge.exposeInMainWorld('electron', electronAPI)
      contextBridge.exposeInMainWorld('api', api)
    } catch (error) {e
      console.error(error)
    }
  } else {
    window.Electron = electronAPI
    window.api = api
  }
  preload.append()
})


// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
