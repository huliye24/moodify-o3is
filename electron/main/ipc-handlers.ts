import { ipcMain } from 'electron'
import { getDb } from './database'
import axios from 'axios'
import Store from 'electron-store'

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
    return db.rule.findMany({
      orderBy: [
        { type: 'asc' },
        { priority: 'desc' }
      ]
    })
  })

  ipcMain.handle('rules:getByType', async (_, type: string) => {
    const db = getDb()
    if (!db) throw new Error('数据库未初始化')
    return db.rule.findMany({
      where: { type, isActive: true },
      orderBy: { priority: 'desc' }
    })
  })

  ipcMain.handle('rules:create', async (_, data: {
    name: string
    type: string
    config: string
    priority?: number
  }) => {
    const db = getDb()
    if (!db) throw new Error('数据库未初始化')
    return db.rule.create({
      data: {
        name: data.name,
        type: data.type,
        config: data.config,
        priority: data.priority || 5,
        isActive: true
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
}