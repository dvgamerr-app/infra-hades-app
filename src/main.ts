import { ipcRenderer } from 'electron'

import { createApp } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import AppLayout from './App.vue'
// import { App } from './env';

import router from './router'
import { configGlobal } from './plugins/node-api'

import './assets/scss/global.scss'
// import 'bootstrap/scss/bootstrap-grid.scss'
import './assets/css/fonts.css'
import './fontAwesome.ts'

const initMsg = async (msg: string) => {
  postMessage({ payload: 'init-msg', msg }, '*')
}

initMsg('Initialize Hades')
console.time('Initialize')
Promise.all([ipcRenderer.invoke('INIT-CONFIG')])
  .then(([{ user }]) => {
    console.timeEnd('Initialize')
    initMsg('Starting')
    createApp(AppLayout)
      .use(router)
      .use(configGlobal(user))
      .component('Fa', FontAwesomeIcon)
      .mount('#app')
      .$nextTick(() => {
        postMessage({ payload: 'remove' }, '*')
      })
  })
  .catch((ex: Error) => {
    console.log(ex)
  })
