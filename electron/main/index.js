const { app, BrowserWindow, Menu, ipcMain, shell, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const Store = require('electron-store')
const axios = require('axios')

const store = new Store()
const isDev = !app.isPackaged

// 窗口引用
let mainWindow = null
let playerWindow = null
let webWindow = null

// 端口配置
const PORTS = {
  FRONTEND: 3000,
  BACKEND: 3001,
  PLAYER:  3002,
  WEB:     3003,
}

// ============ 配置加载 ============

function loadConfigFromFile() {
  const configPath = path.join(app.getPath('userData'), 'config.json')
  if (fs.existsSync(configPath)) {
    try {
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      if (configData.deepseekApiKey) store.set('deepseekApiKey', configData.deepseekApiKey)
      if (configData.sunoApiKey) store.set('sunoApiKey', configData.sunoApiKey)
      if (configData.sunoBaseUrl) store.set('sunoBaseUrl', configData.sunoBaseUrl)
      console.log('配置已从 config.json 加载')
    } catch (error) {
      console.error('加载配置文件失败:', error)
    }
  }
}

// ============ 窗口创建 ============

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: 'Moodify - 歌词创作',
    backgroundColor: '#0f172a',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env.VITE_DEV_SERVER_URL || isDev) {
    mainWindow.loadURL(`http://localhost:${PORTS.FRONTEND}`)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../frontend/dist/index.html'))
  }
}

function createPlayerWindow() {
  if (playerWindow) {
    playerWindow.focus()
    return
  }

  playerWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 700,
    minHeight: 500,
    title: 'Moodify - 情绪播放器',
    backgroundColor: '#0a0a0f',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  })

  playerWindow.on('ready-to-show', () => playerWindow.show())
  playerWindow.on('closed', () => { playerWindow = null })

  if (process.env.VITE_DEV_SERVER_URL || isDev) {
    playerWindow.loadURL(`http://localhost:${PORTS.PLAYER}`)
  } else {
    playerWindow.loadFile(path.join(__dirname, '../../moodify_web/app.html'))
  }
}

function createWebWindow() {
  if (webWindow) {
    webWindow.focus()
    return
  }

  webWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Moodify - 品牌官网',
    backgroundColor: '#0a0a0f',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  })

  webWindow.on('ready-to-show', () => webWindow.show())
  webWindow.on('closed', () => { webWindow = null })

  if (process.env.VITE_DEV_SERVER_URL || isDev) {
    webWindow.loadURL(`http://localhost:${PORTS.WEB}`)
  } else {
    webWindow.loadFile(path.join(__dirname, '../../moodify_web/index.html'))
  }
}

// ============ 菜单系统 ============

function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '主应用窗口',
          accelerator: 'CmdOrCtrl+1',
          click: () => { if (mainWindow) mainWindow.focus() },
        },
        {
          label: '情绪播放器',
          accelerator: 'CmdOrCtrl+2',
          click: () => createPlayerWindow(),
        },
        {
          label: '品牌官网',
          accelerator: 'CmdOrCtrl+3',
          click: () => createWebWindow(),
        },
        { type: 'separator' },
        {
          label: '刷新',
          accelerator: 'CmdOrCtrl+R',
          click: (item, focusedWindow) => {
            if (focusedWindow) focusedWindow.reload()
          },
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: '窗口',
      submenu: [
        {
          label: '主应用窗口',
          accelerator: 'CmdOrCtrl+Shift+1',
          click: () => { if (mainWindow) mainWindow.focus() },
        },
        {
          label: '情绪播放器',
          accelerator: 'CmdOrCtrl+Shift+2',
          click: () => createPlayerWindow(),
        },
        {
          label: '品牌官网',
          accelerator: 'CmdOrCtrl+Shift+3',
          click: () => createWebWindow(),
        },
        { type: 'separator' },
        {
          label: '最小化',
          accelerator: 'CmdOrCtrl+M',
          click: (item, focusedWindow) => {
            if (focusedWindow) focusedWindow.minimize()
          },
        },
        {
          label: '关闭当前窗口',
          accelerator: 'CmdOrCtrl+W',
          click: (item, focusedWindow) => {
            if (focusedWindow) focusedWindow.close()
          },
        },
      ],
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于 Moodify',
          click: () => {
            dialog.showMessageBox({
              type: 'info',
              title: '关于 Moodify',
              message: 'Moodify v1.0.0',
              detail: 'AI 歌词生成 + 情绪音乐品牌\n情绪的潮汐，终将抵达彼岸',
            })
          },
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// ============ IPC 处理 ============

function setupIpcHandlers() {
  // DeepSeek API
  ipcMain.handle('deepseek:generate', async (_, { systemPrompt, userPrompt, model = 'deepseek-chat' }) => {
    const apiKey = store.get('deepseekApiKey')
    if (!apiKey) throw new Error('请先在设置中配置 DeepSeek API Key')

    try {
      const response = await axios.post(
        'https://api.deepseek.com/chat/completions',
        {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.8,
          max_tokens: 2000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          timeout: 60000,
        }
      )

      return response.data.choices[0]?.message?.content || ''
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || '调用 DeepSeek 失败')
    }
  })

  // Suno API - 提交任务
  ipcMain.handle('suno:submit', async (_, params) => {
    const apiKey = store.get('sunoApiKey')
    const baseUrl = store.get('sunoBaseUrl') || 'https://api.sunoai.com'

    if (!apiKey) throw new Error('请先在设置中配置 Suno API Key')

    try {
      const response = await axios.post(`${baseUrl}/suno/submit/music`, params, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        timeout: 120000,
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || '提交音乐任务失败')
    }
  })

  // Suno API - 查询任务
  ipcMain.handle('suno:fetch', async (_, taskIds) => {
    if (!taskIds || taskIds.length === 0) return []

    const apiKey = store.get('sunoApiKey')
    const baseUrl = store.get('sunoBaseUrl') || 'https://api.sunoai.com'

    if (!apiKey) throw new Error('请先在设置中配置 Suno API Key')

    try {
      const response = await axios.post(`${baseUrl}/suno/fetch`, { task_ids: taskIds }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        timeout: 120000,
      })

      return (response.data.tasks || []).map(task => ({
        taskId: task.task_id,
        status: mapSunoStatus(task.status),
        progress: getStatusProgress(mapSunoStatus(task.status)),
        failReason: task.failReason,
        songs: task.data?.songs || [],
      }))
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || '查询任务状态失败')
    }
  })

  // Suno API - 配置读写
  ipcMain.handle('suno:getApiKey', () => store.get('sunoApiKey'))
  ipcMain.handle('suno:setApiKey', (_, apiKey) => store.set('sunoApiKey', apiKey))
  ipcMain.handle('suno:getBaseUrl', () => store.get('sunoBaseUrl'))
  ipcMain.handle('suno:setBaseUrl', (_, baseUrl) => store.set('sunoBaseUrl', baseUrl))

  // 设置读写
  ipcMain.handle('settings:get', (_, key) => store.get(key))
  ipcMain.handle('settings:set', (_, key, value) => store.set(key, value))
  ipcMain.handle('settings:getAll', () => store.store)

  // DeepSeek API Key 读写
  ipcMain.handle('deepseek:getApiKey', () => store.get('deepseekApiKey'))
  ipcMain.handle('deepseek:setApiKey', (_, apiKey) => store.set('deepseekApiKey', apiKey))

  // 文件对话框
  ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: '音乐文件', extensions: ['mp3', 'wav', 'flac', 'ogg', 'm4a'] },
        { name: '所有文件', extensions: ['*'] },
      ],
    })
    return result.canceled ? [] : result.filePaths
  })

  ipcMain.handle('dialog:openDirectory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    })
    return result.canceled ? null : result.filePaths[0]
  })

  // 打开外部链接
  ipcMain.handle('shell:openExternal', (_, url) => shell.openExternal(url))

  // 窗口管理
  ipcMain.handle('window:openPlayer', () => createPlayerWindow())
  ipcMain.handle('window:openWeb', () => createWebWindow())
  ipcMain.handle('window:openMain', () => { if (mainWindow) mainWindow.focus() })

  // ============ HTTP 代理 (前端通过 /api/xxx 访问) ============
  // 代理 GET 请求到本地后端
  ipcMain.handle('http:get', async (_, url) => {
    try {
      const targetUrl = `http://localhost:3000${url}`
      const response = await axios.get(targetUrl, { timeout: 30000 })
      return response.data
    } catch (error) {
      const err = error.response?.data || error
      throw new Error(typeof err === 'string' ? err : (err.message || `GET 失败`))
    }
  })

  ipcMain.handle('http:post', async (_, url, body) => {
    try {
      const targetUrl = `http://localhost:3000${url}`
      const response = await axios.post(targetUrl, body, { timeout: 30000 })
      return response.data
    } catch (error) {
      const err = error.response?.data || error
      throw new Error(typeof err === 'string' ? err : (err.message || `POST 失败`))
    }
  })

  ipcMain.handle('http:delete', async (_, url) => {
    try {
      const targetUrl = `http://localhost:3000${url}`
      const response = await axios.delete(targetUrl, { timeout: 30000 })
      return response.data
    } catch (error) {
      const err = error.response?.data || error
      throw new Error(typeof err === 'string' ? err : (err.message || `DELETE 失败`))
    }
  })

  // 通用 HTTP 代理
  ipcMain.handle('http:request', async (_, options) => {
    try {
      const { method = 'GET', url, data, headers } = options
      const targetUrl = url.startsWith('http') ? url : `http://localhost:3000${url}`
      const response = await axios({
        url: targetUrl,
        method,
        data,
        headers: headers || {},
        timeout: 30000,
      })
      return response.data
    } catch (error) {
      const err = error.response?.data || error
      throw new Error(typeof err === 'string' ? err : (err.message || `请求失败`))
    }
  })

  // ============ 本地音乐库文件操作（方案C用） ============
  const getLibraryRoot = () => {
    const userData = app.getPath('userData')
    return path.join(userData, 'moodify_db', 'library')
  }

  const ensureLibraryDirs = () => {
    const root = getLibraryRoot()
    const dirs = ['audio', 'cover', 'lrc', 'artist_cover']
    dirs.forEach(d => fs.mkdirSync(path.join(root, d), { recursive: true }))
    return root
  }

  ipcMain.handle('library:openFolder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: '选择音乐库文件夹',
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('library:getLibraryPath', () => {
    return ensureLibraryDirs()
  })

  ipcMain.handle('library:scanFolder', async (_, folderPath) => {
    const AUDIO_EXTS = ['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac']
    const files = []

    function walk(dir) {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true })
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)
          if (entry.isDirectory()) {
            walk(fullPath)
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase()
            if (AUDIO_EXTS.includes(ext)) {
              files.push({
                name: entry.name,
                path: fullPath,
                ext,
                size: fs.statSync(fullPath).size,
              })
            }
          }
        }
      } catch (e) {
        console.error('扫描文件夹失败:', e)
      }
    }

    walk(folderPath)
    return files
  })

  ipcMain.handle('library:getAudioMetadata', async (_, filePath) => {
    // 简化版元数据：从文件名解析
    const basename = path.basename(filePath, path.extname(filePath))
    // 常见格式: "歌手名 - 歌曲名" 或 "歌曲名"
    let title = basename
    let artist = ''
    const dashIdx = basename.indexOf(' - ')
    if (dashIdx > 0) {
      artist = basename.substring(0, dashIdx).trim()
      title = basename.substring(dashIdx + 3).trim()
    }
    // 计算文件哈希（用于去重）
    let hash = ''
    try {
      const buf = fs.readFileSync(filePath)
      hash = crypto.createHash('md5').update(buf.slice(0, 1024 * 1024)).digest('hex') // 取前1MB
    } catch (e) {}
    return {
      title,
      artist,
      album: '',
      duration: 0,
      hash,
      path: filePath,
    }
  })

  ipcMain.handle('library:readAudioFile', async (_, filePath) => {
    // 返回文件路径供前端 audio 标签使用
    return filePath
  })

  ipcMain.handle('library:getCoverImage', async (_, coverPath) => {
    if (!coverPath || !fs.existsSync(coverPath)) return null
    const data = fs.readFileSync(coverPath)
    const ext = path.extname(coverPath).toLowerCase()
    const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif' }
    return `data:${mimeMap[ext] || 'image/jpeg'};base64,${data.toString('base64')}`
  })

  ipcMain.handle('library:getLyricsFile', async (_, lrcPath) => {
    if (!lrcPath || !fs.existsSync(lrcPath)) return null
    return fs.readFileSync(lrcPath, 'utf-8')
  })

  ipcMain.handle('library:importFile', async (_, sourcePath, destFolder) => {
    const root = ensureLibraryDirs()
    const destDir = path.join(root, destFolder)
    fs.mkdirSync(destDir, { recursive: true })
    const filename = path.basename(sourcePath)
    const destPath = path.join(destDir, filename)
    fs.copyFileSync(sourcePath, destPath)
    return destPath
  })

  ipcMain.handle('library:deleteFile', async (_, filePath) => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    return true
  })

  ipcMain.handle('library:getLibraryStats', async () => {
    const root = ensureLibraryDirs()
    let totalFiles = 0
    let totalSize = 0
    const counts = { audio: 0, cover: 0, lrc: 0 }

    function walk(dir) {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true })
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)
          if (entry.isDirectory()) {
            walk(fullPath)
          } else if (entry.isFile()) {
            totalFiles++
            totalSize += fs.statSync(fullPath).size
            const ext = path.extname(entry.name).toLowerCase()
            if (['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac'].includes(ext)) counts.audio++
            else if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) counts.cover++
            else if (['.lrc', '.txt'].includes(ext)) counts.lrc++
          }
        }
      } catch (e) {}
    }

    walk(root)
    return { totalFiles, totalSize, counts, root }
  })
}

// ============ Suno 状态映射 ============

function mapSunoStatus(sunoStatus) {
  switch (sunoStatus) {
    case 'NOT_START': return 'pending'
    case 'SUBMITTED':
    case 'QUEUED':    return 'submitted'
    case 'IN_PROGRESS': return 'in_progress'
    case 'SUCCESS':  return 'success'
    case 'FAILURE':  return 'failure'
    default:         return 'pending'
  }
}

function getStatusProgress(status) {
  switch (status) {
    case 'pending':    return 0
    case 'submitted':  return 20
    case 'queued':    return 40
    case 'in_progress': return 70
    case 'success':
    case 'failure':   return 100
    default:          return 0
  }
}

// ============ 应用启动 ============

app.whenReady().then(() => {
  loadConfigFromFile()
  createMenu()
  setupIpcHandlers()
  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

module.exports = { mainWindow, playerWindow, webWindow }
