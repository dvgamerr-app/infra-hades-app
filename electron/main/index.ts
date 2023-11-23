import { app, BrowserWindow, shell, ipcMain } from 'electron'
import log from 'electron-log'
import { release, arch, platform } from 'os'
import { join } from 'path'
import { name } from '../../package.json'
import { initilizeApp } from '../user-config'
import settings from 'electron-settings'

import { onWindowPositionEvent } from './event/settings'
import ipcEvent from './event/ipc-main'

log.initialize({ preload: true })

// log.transports.file.level = false;
// log.transports.log.level = false;

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST_ELECTRON, '../public')

// setInterval(() => {
//   log.log('process:', process.cpuUsage())
//   log.log('process:', process.memoryUsage())
// }, 1000)

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

async function createWindow() {
  const { config, user } = await initilizeApp()
  const lasted: SettingPosition = (settings.getSync('position') as any) || {}

  log.info({
    os: {
      arch: arch(),
      platform: platform(),
      release: release(),
    },
  })
  log.debug({ position: lasted })

  win = new BrowserWindow({
    title: name,
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    show: true,
    movable: true,
    resizable: true,
    frame: false,
    alwaysOnTop: false,
    titleBarStyle: 'hidden',
    backgroundColor: user.titlebar.activeBackground,
    titleBarOverlay: {
      color: user.titlebar.activeBackground,
      symbolColor: user.titlebar.activeForeground,
    },
    autoHideMenuBar: true,
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
    minWidth: config.width,
    minHeight: config.height,
    width: lasted.width,
    height: lasted.height,
    x: lasted.x,
    y: lasted.y,
  })
  if (lasted.maximized) win.maximize()

  win.on('focus', () => {
    win.setTitleBarOverlay({
      color: user.titlebar.activeBackground,
      symbolColor: user.titlebar.activeForeground,
    })
    win.webContents.executeJavaScript(`document.body.classList.remove('inactive')`)
  })
  win.on('blur', () => {
    win.setTitleBarOverlay({
      color: user.titlebar.inactiveBackground,
      symbolColor: user.titlebar.inactiveForeground,
    })
    win.webContents.executeJavaScript(`document.body.classList.add('inactive')`)
  })

  win.on('unmaximize', onWindowPositionEvent(win))
  win.on('maximize', onWindowPositionEvent(win))
  win.on('moved', onWindowPositionEvent(win))

  ipcMain.handle('APP-RELOAD', async (e, ...args) => {
    win.reload()
  })

  const ipcLog = log.scope('IPC')
  for (const eventName in ipcEvent) {
    ipcMain.handle(eventName, async (e, ...args) => {
      ipcLog.verbose(eventName, args)
      const result = await ipcEvent[eventName](e, ...args)
      ipcLog.verbose({ eventName, args, result })
      return result
    })
  }

  if (app.isPackaged) {
    win.loadFile(indexHtml)
  } else {
    win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// new window example arg: new windows url
ipcMain.handle('open-win', (event, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
    },
  })

  if (app.isPackaged) {
    childWindow.loadFile(indexHtml, { hash: arg })
  } else {
    childWindow.loadURL(`${url}/#${arg}`)
    // childWindow.webContents.openDevTools({ mode: "undocked", activate: true })
  }
})
