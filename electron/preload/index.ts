import { contextBridge, ipcRenderer } from 'electron'

// DeepSeek API 代理转发（前端直接调 /api/deepseek）
const deepSeekFetch = (url: string, options: RequestInit) =>
  ipcRenderer.invoke('fetch:proxy', url, options)

const api = {
  // ============ 窗口管理 ============
  window: {
    openPlayer: () => ipcRenderer.invoke('window:openPlayer'),
    openWeb:   () => ipcRenderer.invoke('window:openWeb'),
    openMain:  () => ipcRenderer.invoke('window:openMain'),
  },

  // ============ 外部链接 ============
  shell: {
    openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
  },

  // ============ DeepSeek API (代理转发) ============
  deepseek: {
    generate: (params: {
      systemPrompt: string
      userPrompt: string
      model?: string
    }) => ipcRenderer.invoke('deepseek:generate', params),
    getApiKey: () => ipcRenderer.invoke('deepseek:getApiKey'),
    setApiKey: (apiKey: string) => ipcRenderer.invoke('deepseek:setApiKey', apiKey),
  },

  // ============ Suno API ============
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
    getApiKey:  () => ipcRenderer.invoke('suno:getApiKey'),
    setApiKey:  (apiKey: string)  => ipcRenderer.invoke('suno:setApiKey', apiKey),
    getBaseUrl: () => ipcRenderer.invoke('suno:getBaseUrl'),
    setBaseUrl: (baseUrl: string) => ipcRenderer.invoke('suno:setBaseUrl', baseUrl),
    onProgress: (callback: (event: any, data: any) => void) => {
      ipcRenderer.on('suno:progress', callback)
      return () => ipcRenderer.removeListener('suno:progress', callback)
    },
  },

  // ============ 设置 ============
  settings: {
    get:    (key: string)            => ipcRenderer.invoke('settings:get', key),
    set:    (key: string, value: any) => ipcRenderer.invoke('settings:set', key, value),
    getAll: ()                      => ipcRenderer.invoke('settings:getAll'),
  },

  // ============ 本地音乐库文件操作（方案C用） ============
  library: {
    // 打开文件夹选择对话框
    openFolder: () => ipcRenderer.invoke('library:openFolder'),
    // 获取库目录路径
    getLibraryPath: () => ipcRenderer.invoke('library:getLibraryPath'),
    // 扫描文件夹中的音频文件
    scanFolder: (folderPath: string) => ipcRenderer.invoke('library:scanFolder', folderPath),
    // 读取音频文件信息（ID3标签等）
    getAudioMetadata: (filePath: string) => ipcRenderer.invoke('library:getAudioMetadata', filePath),
    // 获取文件内容（用于播放）
    readAudioFile: (filePath: string) => ipcRenderer.invoke('library:readAudioFile', filePath),
    // 获取封面图片
    getCoverImage: (coverPath: string) => ipcRenderer.invoke('library:getCoverImage', coverPath),
    // 获取歌词文件
    getLyricsFile: (lyricsPath: string) => ipcRenderer.invoke('library:getLyricsFile', lyricsPath),
    // 复制文件到库目录
    importFile: (sourcePath: string, destFolder: string) => ipcRenderer.invoke('library:importFile', sourcePath, destFolder),
    // 删除库中的文件
    deleteFile: (filePath: string) => ipcRenderer.invoke('library:deleteFile', filePath),
    // 获取库统计信息
    getLibraryStats: () => ipcRenderer.invoke('library:getLibraryStats'),
  },

  // ============ 文件对话框 ============
  dialog: {
    openFile:     () => ipcRenderer.invoke('dialog:openFile'),
    openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  },

  // ============ HTTP 代理 (用于 /api/xxx 路由) ============
  http: {
    get:    (url: string) => ipcRenderer.invoke('http:get', url),
    post:   (url: string, body: any) => ipcRenderer.invoke('http:post', url, body),
    delete: (url: string) => ipcRenderer.invoke('http:delete', url),
  },
}

contextBridge.exposeInMainWorld('api', api)

export type ApiType = typeof api
