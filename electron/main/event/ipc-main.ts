import { initilizeApp } from '../../user-config'
// import settings from 'electron-settings'
import log from 'electron-log/renderer'

export default {
  'INIT-CONFIG': initilizeApp,
  'APP-OPEN-MENU': () => {
    log.log('backend')
  },
}
