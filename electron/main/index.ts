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

import { app, BrowserWindow, shell, Menu, ipcMain, screen } from 'electron'
import { release } from 'os'
import { join } from 'path'
import { name } from '../../package.json'
import cfg from '../default.config'

import {  } from 'process'

console.log('release:', release())
// setInterval(() => {
//   console.log('process:', process.cpuUsage())
//   console.log('process:', process.memoryUsage())
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
  win = new BrowserWindow({
    title: name,
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    show: true,
    movable: true,
    resizable: true,
    frame: false,
    alwaysOnTop: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: cfg.titleBar,
    autoHideMenuBar: true,
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
    },
    minWidth: cfg.width,
    minHeight: cfg.height,
    width: cfg.width,
    height: cfg.height
  })

  // Build custome menu
  const menuTitle = Menu.buildFromTemplate([
    // {
    //   label: 'Always On Top',
    //   sublabel: 'and lock window mode.',
    //   type: 'checkbox',
    //   checked: settings.getSync('ontop', false),
    //   click: (menuItem) => {
    //     settings.set('ontop', menuItem.checked)
    //     mainApp.window.setAlwaysOnTop(menuItem.checked)
    //     mainApp.window.setMovable(!menuItem.checked)
    //     mainApp.window.setSkipTaskbar(menuItem.checked)
    //     // mainApp.window.set
    //     const position = getPosition()
    //     if (position) mainApp.window.setPosition(position.x, position.y)
    //   }
    // },
    { label: 'Toggle Tools', role: 'toggleDevTools' },
    { type: 'separator' },
    { label: 'Exit', role: 'quit' }
  ])

  const savePosition = () => {
    let [ winX, winY ] = win.getPosition()
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    const [ winWidth, winHeight ] = win.getSize()
    if (winX < 0) winX = 0
    if (winX > (width - winWidth)) winX = (width - winWidth)
    if (winY < 0) winY = 0
    if (winY > (height - winHeight)) winY = (height - winHeight)
    // settings.set('position', { x: winX, y: winY })
    // console.log({ winX, winY })
  }
  
  let moveId = null
  const onMoveEvent = () => {
    // if (settings.getSync('ontop', false)) return
    if (moveId) clearTimeout(moveId)
    moveId = setTimeout(savePosition, 200)
  }

  win.on('moved', onMoveEvent)
  win.on('move', onMoveEvent)

  ipcMain.handle('open-menu', () => {
    menuTitle.popup({ window: win, x: 22, y: 16 })
  })
  
  // let position: { x: number, y: number }
  // ipcMain.handle('title-move', (event, e: MousePosition) => {
  //   // if (!dragWin) return event.preventDefault()
  //   const [ x, y ] = win.getPosition()
  //   // console.log('current:', { x, y }, { x: e.clientX, y: e.clientY })
  //   console.log('x:', e.clientX - position.x, 'y:', e.clientY - position.y)
  //   win.setPosition(x+e.clientX - position.x, y+e.clientY - position.y, false)

  //   position = { x: e.clientX, y: e.clientY }
  // })

  // ipcMain.handle('title-toggle', (event, e: MousePosition) => {
  //   if (e.mouse === 1) position = { x: e.clientX, y: e.clientY }
  //   if (e.mouse === 0) position = null

    
  //   console.log('toggle:', { x: e.clientX, y: e.clientY })
  // })

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
