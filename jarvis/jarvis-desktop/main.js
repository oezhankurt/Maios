import { app, BrowserWindow, Menu, globalShortcut, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 900,
    minWidth: 600,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
  })

  const isDev = process.env.NODE_ENV === 'development'
  const startUrl = isDev
    ? 'http://localhost:5174'
    : `file://${path.join(__dirname, '../jarvis-web/dist/index.html')}`

  mainWindow.loadURL(startUrl)

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', () => {
  createWindow()

  globalShortcut.register('Alt+J', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    }
  })

  createApplicationMenu()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.handle('get-config', async () => {
  return {
    appVersion: app.getVersion(),
    isPackaged: app.isPackaged,
  }
})

function createApplicationMenu() {
  const template = [
    {
      label: 'Jarvis',
      submenu: [
        { label: 'Über Jarvis', role: 'about' },
        { type: 'separator' },
        { label: 'Einstellungen', accelerator: 'CmdOrCtrl+,', click: () => {} },
        { type: 'separator' },
        { label: 'Beenden', accelerator: 'CmdOrCtrl+Q', role: 'quit' },
      ],
    },
    {
      label: 'Bearbeiten',
      submenu: [
        { label: 'Rückgängig', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Wiederherstellen', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
        { type: 'separator' },
        { label: 'Ausschneiden', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Kopieren', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Einfügen', accelerator: 'CmdOrCtrl+V', role: 'paste' },
      ],
    },
    {
      label: 'Ansicht',
      submenu: [
        { label: 'Vergrößern', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: 'Verkleinern', accelerator: 'CmdOrCtrl+Minus', role: 'zoomOut' },
        { label: 'Zurücksetzen', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { type: 'separator' },
        { label: 'Vollbild', accelerator: 'F11', role: 'togglefullscreen' },
      ],
    },
  ]

  if (process.env.NODE_ENV === 'development') {
    template.push({
      label: 'Entwicklung',
      submenu: [
        { label: 'DevTools', accelerator: 'F12', role: 'toggleDevTools' },
        { label: 'Neu laden', accelerator: 'CmdOrCtrl+R', role: 'reload' },
      ],
    })
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
