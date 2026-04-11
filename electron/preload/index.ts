import { contextBridge, ipcRenderer } from 'electron'

const api = {
  // 项目管理
  project: {
    getAll: () => ipcRenderer.invoke('project:getAll'),
    create: (data: { name: string; description?: string }) =>
      ipcRenderer.invoke('project:create', data),
    update: (id: number, data: { name?: string; description?: string }) =>
      ipcRenderer.invoke('project:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('project:delete', id)
  },

  // 歌词管理
  lyrics: {
    getByProject: (projectId: number) => ipcRenderer.invoke('lyrics:getByProject', projectId),
    create: (data: {
      projectId: number
      title: string
      content: string
      style?: string
      emotion?: string
      promptTemplate?: string
    }) => ipcRenderer.invoke('lyrics:create', data),
    update: (id: number, data: { title?: string; content?: string }) =>
      ipcRenderer.invoke('lyrics:update', id, data),
    toggleFavorite: (id: number) => ipcRenderer.invoke('lyrics:toggleFavorite', id),
    delete: (id: number) => ipcRenderer.invoke('lyrics:delete', id),
    getFavorites: () => ipcRenderer.invoke('lyrics:getFavorites')
  },

  // 规则管理
  rules: {
    getAll: () => ipcRenderer.invoke('rules:getAll'),
    getByType: (type: string) => ipcRenderer.invoke('rules:getByType', type),
    create: (data: { name: string; type: string; config: string; priority?: number }) =>
      ipcRenderer.invoke('rules:create', data),
    update: (id: number, data: {
      name?: string
      config?: string
      priority?: number
      isActive?: boolean
    }) => ipcRenderer.invoke('rules:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('rules:delete', id)
  },

  // API 日志
  apiLog: {
    getRecent: (limit?: number) => ipcRenderer.invoke('apiLog:getRecent', limit)
  },

  // DeepSeek API
  deepseek: {
    generate: (params: {
      systemPrompt: string
      userPrompt: string
      model?: string
    }) => ipcRenderer.invoke('deepseek:generate', params)
  },

  // 设置
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('settings:set', key, value),
    getAll: () => ipcRenderer.invoke('settings:getAll')
  },

  // 对话框
  dialog: {
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    openDirectory: () => ipcRenderer.invoke('dialog:openDirectory')
  },

  // MusicTrack 管理
  musicTrack: {
    getByO3ics: (o3icsId: number) => ipcRenderer.invoke('musicTrack:getByO3ics', o3icsId),
    create: (data: {
      o3icsId: number
      title: string
      taskId?: string
      style?: string
      model?: string
      instrumental?: boolean
    }) => ipcRenderer.invoke('musicTrack:create', data),
    update: (id: number, data: {
      status?: string
      audioUrl?: string
      videoUrl?: string
      coverImageUrl?: string
      sunoSongId?: string
      failReason?: string
      title?: string
    }) => ipcRenderer.invoke('musicTrack:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('musicTrack:delete', id),
    getByTaskId: (taskId: string) => ipcRenderer.invoke('musicTrack:getByTaskId', taskId)
  },

  // Suno API
  suno: {
    submit: (params: {
      gpt_description_prompt: string
      make_instrumental: boolean
      model: string
      o3ics?: string
      title?: string
      notify_hook?: string
    }) => ipcRenderer.invoke('suno:submit', params),
    fetch: (taskIds: string[]) => ipcRenderer.invoke('suno:fetch', taskIds),
    getApiKey: () => ipcRenderer.invoke('suno:getApiKey'),
    setApiKey: (apiKey: string) => ipcRenderer.invoke('suno:setApiKey', apiKey),
    getBaseUrl: () => ipcRenderer.invoke('suno:getBaseUrl'),
    setBaseUrl: (baseUrl: string) => ipcRenderer.invoke('suno:setBaseUrl', baseUrl),
    onProgress: (callback: (event: any, data: any) => void) => {
      ipcRenderer.on('suno:progress', callback)
      return () => ipcRenderer.removeListener('suno:progress', callback)
    }
  }
}

contextBridge.exposeInMainWorld('api', api)

export type ApiType = typeof api