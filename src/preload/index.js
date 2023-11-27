import { ipcRenderer, contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { domReady, createPreloading } from './dom'

Promise.all([domReady(), ipcRenderer.invoke('INIT-CONFIG')]).then((config) => {
  const preload = createPreloading(config[1].user)
  const loading = document.querySelector('#loading .text')

  // Custom APIs for renderer
  const api = {
    initConfig: () => ipcRenderer.invoke('INIT-CONFIG'),
    preloadInit: (msg) => {
      if (msg) loading.textContent = msg
      preload.add()
    },
    preloadRemove: preload.remove,
    preloadText: (msg) => (loading.textContent = msg)
  }

  if (process.contextIsolated) {
    try {
      contextBridge.exposeInMainWorld('electron', electronAPI)
      contextBridge.exposeInMainWorld('invoke', ipcRenderer.invoke)
      contextBridge.exposeInMainWorld('api', api)
    } catch (ex) {
      console.error(ex)
    }
  } else {
    window.Electron = electronAPI
    window.invoke = ipcRenderer.invoke
    window.api = api
  }
  preload.add()
  console.log('init preload.')
})
