import { release, arch, platform } from 'os'
import { join } from 'path'
import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { initilizeApp } from './user-config'
import icon from '../../resources/icon.png?asset'
import { name } from '../../package.json'
import ipcEvent from './event'

import { onWindowPositionEvent } from './event/settings'
import settings from 'electron-settings'
import log from 'electron-log'

log.initialize({ preload: true })

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

async function createWindow() {
  const { config, user } = await initilizeApp()
  const lasted = settings.getSync('position') || {}

  log.info({
    os: { arch: arch(), platform: platform(), release: release() }
  })
  log.debug({ position: lasted })

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: name,
    show: true,
    movable: true,
    resizable: true,
    frame: false,
    alwaysOnTop: false,
    titleBarStyle: 'hidden',
    backgroundColor: user.titlebar.activeBackground,
    titleBarOverlay: {
      color: user.titlebar.activeBackground,
      symbolColor: user.titlebar.activeForeground
    },
    autoHideMenuBar: true,
    minWidth: config.width,
    minHeight: config.height,
    width: lasted.width,
    height: lasted.height,
    x: lasted.x,
    y: lasted.y,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  if (lasted.maximized) mainWindow.maximize()

  ipcMain.handle('APP-RELOAD', async () => {
    mainWindow.reload()
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

  mainWindow.on('focus', () => {
    mainWindow.setTitleBarOverlay({
      color: user.titlebar.activeBackground,
      symbolColor: user.titlebar.activeForeground
    })
    mainWindow.webContents.executeJavaScript(`document.body.classList.remove('inactive')`)
  })
  mainWindow.on('blur', () => {
    mainWindow.setTitleBarOverlay({
      color: user.titlebar.inactiveBackground,
      symbolColor: user.titlebar.inactiveForeground
    })
    mainWindow.webContents.executeJavaScript(`document.body.classList.add('inactive')`)
  })

  mainWindow.on('unmaximize', onWindowPositionEvent(mainWindow))
  mainWindow.on('maximize', onWindowPositionEvent(mainWindow))
  mainWindow.on('moved', onWindowPositionEvent(mainWindow))

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  await createWindow()

  app.on('activate', async function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) await createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// new window example arg: new windows url
// ipcMain.handle('open-win', (event, arg) => {
//   const childWindow = new BrowserWindow({
//     webPreferences: {
//       preload,
//     },
//   })

//   if (app.isPackaged) {
//     childWindow.loadFile(indexHtml, { hash: arg })
//   } else {
//     childWindow.loadURL(`${url}/#${arg}`)
//     // childWindow.webContents.openDevTools({ mode: "undocked", activate: true })
//   }
// })

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
