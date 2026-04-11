import { ipcMain } from 'electron'
import { getDb } from './database'
import axios from 'axios'
import Store from 'electron-store'
import {
  submitMusicTask,
  fetchTasks,
  mapSunoStatus,
  getStatusProgress,
  type SunoSubmitParams
} from './suno-handler'

const store = new Store()

export function setupIpcHandlers(): void {
  // ============ 项目管理 ============
  ipcMain.handle('project:getAll', async () => {
    const db = getDb()
    if (!db) throw new Error('数据库未初始化')
    return db.project.findMany({
      orderBy: { updatedAt: 'desc' }
    })
  })

  ipcMain.handle('project:create', async (_, data: { name: string; description?: string }) => {
    const db = getDb()
    if (!db) throw new Error('数据库未初始化')
    return db.project.create({
      data: {
        name: data.name,
        description: data.description || ''
      }
    })
  })

  ipcMain.handle('project:update', async (_, id: number, data: { name?: string; description?: string }) => {
    const db = getDb()
    if (!db) throw new Error('数据库未初始化')
    return db.project.update({
      where: { id },
      data
    })
  })

  ipcMain.handle('project:delete', async (_, id: number) => {
    const db = getDb()
    if (!db) throw new Error('数据库未初始化')
    // 先删除关联的歌词
    await db.lyrics.deleteMany({ where: { projectId: id } })
    return db.project.delete({ where: { id } })
  })

  // ============ 歌词管理 ============
  ipcMain.handle('lyrics:getByProject', async (_, projectId: number) => {
    const db = getDb()
    if (!db) throw new Error('数据库未初始化')
    return db.lyrics.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    })
  })

  ipcMain.handle('lyrics:create', async (_, data: {
    projectId: number
    title: string
    content: string
    style?: string
    emotion?: string
    promptTemplate?: string
  }) => {
    const db = getDb()
    if (!db) throw new Error('数据库未初始化')
    const result = await db.lyrics.create({ data })
    // 更新项目更新时间
    await db.project.update({
      where: { id: data.projectId },
      data: { updatedAt: new Date() }
    })
    return result
  })

  ipcMain.handle('lyrics:update', async (_, id: number, data: { title?: string; content?: string }) => {
    const db = getDb()
    if (!db) throw new Error('数据库未初始化')
    return db.lyrics.update({
      where: { id },
      data
    })
  })

  ipcMain.handle('lyrics:toggleFavorite', async (_, id: number) => {
    const db = getDb()
    if (!db) throw new Error('数据库未初始化')
    const lyrics = await db.lyrics.findUnique({ where: { id } })
    return db.lyrics.update({
      where: { id },
      data: { favorite: !lyrics?.favorite }
    })
  })

  ipcMain.handle('lyrics:delete', async (_, id: number) => {
    const db = getDb()
    if (!db) throw new Error('数据库未初始化')
    return db.lyrics.delete({ where: { id } })
  })

  ipcMain.handle('lyrics:getFavorites', async () => {
    const db = getDb()
    if (!db) throw new Error('数据库未初始化')
    return db.lyrics.findMany({
      where: { favorite: true },
      orderBy: { createdAt: 'desc' }
    })
  })

  // ============ 规则管理 ============
  ipcMain.handle('rules:getAll', async () => {
    const db = getDb()
    if (!db) throw new Error('数据库未初始化')
    const rules = await db.rule.findMany({
      orderBy: [
        { type: 'asc' },
        { priority: 'desc' }
      ]
    })
    // 解析 tags 字段
    return rules.map(rule => ({
      ...rule,
      tags: JSON.parse(rule.tags || '[]')
    }))
  })

  ipcMain.handle('rules:getByType', async (_, type: string) => {
    const db = getDb()
    if (!db) throw new Error('数据库未初始化')
    const rules = await db.rule.findMany({
      where: { type, isActive: true },
      orderBy: { priority: 'desc' }
    })
    return rules.map(rule => ({
      ...rule,
      tags: JSON.parse(rule.tags || '[]')
    }))
  })

  ipcMain.handle('rules:create', async (_, data: {
    name: string
    type: string
    config: string
    priority?: number
    author?: string
    version?: string
    tags?: string[]
    description?: string
  }) => {
    const db = getDb()
    if (!db) throw new Error('数据库未初始化')
    return db.rule.create({
      data: {
        name: data.name,
        type: data.type,
        config: data.config,
        priority: data.priority || 5,
        isActive: true,
        author: data.author,
        version: data.version,
        tags: JSON.stringify(data.tags || []),
        description: data.description
      }
    })
  })

  ipcMain.handle('rules:update', async (_, id: number, data: {
    name?: string
    config?: string
    priority?: number
    isActive?: boolean
  }) => {
    const db = getDb()
    if (!db) throw new Error('数据库未初始化')
    return db.rule.update({
      where: { id },
      data
    })
  })

  ipcMain.handle('rules:delete', async (_, id: number) => {
    const db = getDb()
    if (!db) throw new Error('数据库未初始化')
    return db.rule.delete({ where: { id } })
  })

  // ============ API 日志 ============
  ipcMain.handle('apiLog:create', async (_, data: {
    model: string
    input: string
    output: string
    tokens: number
    cost: number
    status: string
  }) => {
    const db = getDb()
    if (!db) throw new Error('数据库未初始化')
    return db.apiLog.create({ data })
  })

  ipcMain.handle('apiLog:getRecent', async (_, limit: number = 10) => {
    const db = getDb()
    if (!db) throw new Error('数据库未初始化')
    return db.apiLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
  })

  // ============ DeepSeek API ============
  ipcMain.handle('deepseek:generate', async (_, {
    systemPrompt,
    userPrompt,
    model = 'deepseek-chat'
  }: {
    systemPrompt: string
    userPrompt: string
    model?: string
  }) => {
    const apiKey = store.get('deepseekApiKey') as string

    if (!apiKey) {
      throw new Error('请先在设置中配置 DeepSeek API Key')
    }

    try {
      const response = await axios.post(
        'https://api.deepseek.com/chat/completions',
        {
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.8,
          max_tokens: 2000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          timeout: 60000
        }
      )

      const result = response.data.choices[0]?.message?.content || ''

      // 记录API调用
      const db = getDb()
      if (db) {
        await db.apiLog.create({
          data: {
            model: model,
            input: userPrompt.substring(0, 500),
            output: result.substring(0, 500),
            tokens: response.data.usage?.total_tokens || 0,
            cost: (response.data.usage?.total_tokens || 0) * 0.0001,
            status: 'success'
          }
        })
      }

      return result
    } catch (error: any) {
      // 记录失败日志
      const db = getDb()
      if (db) {
        await db.apiLog.create({
          data: {
            model: model,
            input: userPrompt.substring(0, 500),
            output: error.message,
            tokens: 0,
            cost: 0,
            status: 'error'
          }
        })
      }
      throw error
    }
  })

  // ============ 设置 ============
  ipcMain.handle('settings:get', async (_, key: string) => {
    return store.get(key)
  })

  ipcMain.handle('settings:set', async (_, key: string, value: any) => {
    store.set(key, value)
  })

  ipcMain.handle('settings:getAll', async () => {
    return store.store
  })

  // ============ 文件对话框 ============
  ipcMain.handle('dialog:openFile', async () => {
    const { dialog } = await import('electron')
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: '音乐文件', extensions: ['mp3', 'wav', 'flac', 'ogg', 'm4a'] },
        { name: '所有文件', extensions: ['*'] }
      ]
    })
    return result.canceled ? [] : result.filePaths
  })

  ipcMain.handle('dialog:openDirectory', async () => {
    const { dialog } = await import('electron')
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return result.canceled ? null : result.filePaths[0]
  })

  // ============ MusicTrack 管理 ============
  ipcMain.handle('musicTrack:getByO3ics', async (_, o3icsId: number) => {
    const db = getDb()
    if (!db) throw new Error('数据库未初始化')
    return db.musicTrack.findMany({
      where: { o3icsId },
      orderBy: { createdAt: 'desc' }
    })
  })

  ipcMain.handle('musicTrack:create', async (_, data: {
    o3icsId: number
    title: string
    taskId?: string
    style?: string
    model?: string
    instrumental?: boolean
  }) => {
    const db = getDb()
    if (!db) throw new Error('数据库未初始化')
    return db.musicTrack.create({
      data: {
        o3icsId: data.o3icsId,
        title: data.title,
        taskId: data.taskId,
        style: data.style,
        model: data.model,
        instrumental: data.instrumental || false,
        status: data.taskId ? 'submitted' : 'pending'
      }
    })
  })

  ipcMain.handle('musicTrack:update', async (_, id: number, data: {
    status?: string
    audioUrl?: string
    videoUrl?: string
    coverImageUrl?: string
    sunoSongId?: string
    failReason?: string
    title?: string
  }) => {
    const db = getDb()
    if (!db) throw new Error('数据库未初始化')
    return db.musicTrack.update({
      where: { id },
      data
    })
  })

  ipcMain.handle('musicTrack:delete', async (_, id: number) => {
    const db = getDb()
    if (!db) throw new Error('数据库未初始化')
    return db.musicTrack.delete({ where: { id } })
  })

  ipcMain.handle('musicTrack:getByTaskId', async (_, taskId: string) => {
    const db = getDb()
    if (!db) throw new Error('数据库未初始化')
    return db.musicTrack.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' }
    })
  })

  // ============ Suno API ============
  ipcMain.handle('suno:submit', async (_, params: SunoSubmitParams) => {
    const result = await submitMusicTask(params)
    return result
  })

  ipcMain.handle('suno:fetch', async (_, taskIds: string[]) => {
    const tasks = await fetchTasks(taskIds)
    return tasks.map(task => ({
      taskId: task.task_id,
      status: mapSunoStatus(task.status),
      progress: getStatusProgress(mapSunoStatus(task.status)),
      failReason: task.failReason,
      songs: task.data.songs || []
    }))
  })

  ipcMain.handle('suno:getApiKey', async () => {
    return store.get('sunoApiKey')
  })

  ipcMain.handle('suno:setApiKey', async (_, apiKey: string) => {
    store.set('sunoApiKey', apiKey)
  })

  ipcMain.handle('suno:getBaseUrl', async () => {
    return store.get('sunoBaseUrl')
  })

  ipcMain.handle('suno:setBaseUrl', async (_, baseUrl: string) => {
    store.set('sunoBaseUrl', baseUrl)
  })
}