import { ipcRenderer } from 'electron'
import { domReady, createPreloading } from './dom'
// import {
//   onWindowLoaded,
//   onWindowActive,
//   onWindowInactive,
// } from './event-window'

domReady()
  .then(() => {
    return ipcRenderer.invoke('INIT-CONFIG')
  })
  .then(({ user }: { user: Global.UserSetting }) => {
    const preload = createPreloading(user)
    const loading = document.querySelector('#loading .text')
    window.onmessage = ({ data }: MessageEvent<{ payload: string; msg: string }>) => {
      switch (data.payload) {
        case 'remove':
          preload.remove()
          break
        case 'init-msg':
          if (loading) loading.textContent = data.msg
          break
      }
    }

    preload.append()
  })
