import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync } from 'fs'
import Store from 'electron-store'
import { initDatabase, getDb } from './database'
import { setupIpcHandlers } from './ipc-handlers'

Store.initRenderer()

const store = new Store()

// 启动时从 config.json 加载配置
function loadConfigFromFile() {
  const configPath = join(app.getPath('userData'), 'config.json')
  if (existsSync(configPath)) {
    try {
      const configData = JSON.parse(readFileSync(configPath, 'utf-8'))
      if (configData.deepseekApiKey) {
        store.set('deepseekApiKey', configData.deepseekApiKey)
      }
      if (configData.sunoApiKey) {
        store.set('sunoApiKey', configData.sunoApiKey)
      }
      if (configData.sunoBaseUrl) {
        store.set('sunoBaseUrl', configData.sunoBaseUrl)
      }
      console.log('配置已从 config.json 加载')
    } catch (error) {
      console.error('加载配置文件失败:', error)
    }
  }
}

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: 'Moodify',
    backgroundColor: '#0f172a',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../../dist/index.html'))
  }
}

app.whenReady().then(async () => {
  loadConfigFromFile()
  
  try {
    await initDatabase()
    console.log('数据库初始化成功')
  } catch (error) {
    console.error('数据库初始化失败:', error)
  }

  setupIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  const db = getDb()
  if (db) {
    db.$disconnect()
  }
})

export { mainWindow, store }