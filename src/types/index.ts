export interface Project {
  id: number
  name: string
  description: string
  tags: string
  createdAt: string
  updatedAt: string
}

export interface Lyrics {
  id: number
  projectId: number
  title: string
  content: string
  style: string | null
  emotion: string | null
  promptTemplate: string | null
  favorite: boolean
  createdAt: string
  sunoPrompts?: string[]  // 生成的3个suno prompt建议
}

export interface Rule {
  id: number
  name: string
  type: 'emotion' | 'theme' | 'style' | 'rhyme' | 'length'
  config: string
  priority: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiLog {
  id: number
  model: string
  input: string
  output: string
  tokens: number
  cost: number
  status: string
  createdAt: string
}

export interface GenerateParams {
  content: string
  emotion: string
  theme: string
  style: string
  rhyme: string
  length: string
  customRules?: string
}

// MusicTrack 类型
export type MusicTrackStatus = 'pending' | 'submitted' | 'queued' | 'in_progress' | 'success' | 'failure'

export interface MusicTrack {
  id: number
  o3icsId: number
  taskId: string | null
  sunoSongId: string | null
  title: string
  audioUrl: string | null
  videoUrl: string | null
  coverImageUrl: string | null
  status: MusicTrackStatus
  failReason: string | null
  style: string | null
  model: string | null
  instrumental: boolean
  createdAt: string
  updatedAt: string
}

// Suno API 类型
export interface SunoSubmitParams {
  gpt_description_prompt: string
  make_instrumental: boolean
  model: string
  o3ics?: string
  title?: string
  notify_hook?: string
}

export interface SunoTaskResponse {
  task_id: string
}

export interface SunoSong {
  id: string
  title: string
  audio_url: string
  video_url: string
  image_url: string
  o3ics: string
}

export interface SunoTaskResult {
  taskId: string
  status: MusicTrackStatus
  progress: number
  failReason?: string
  songs: SunoSong[]
}

// Suno 支持的模型版本
export const SUNO_MODELS = [
  { value: 'chirp-v3-0', label: 'v3.0 基础版' },
  { value: 'chirp-v3-5', label: 'v3.5 优化版' },
  { value: 'chirp-v4', label: 'v4.0 增强版' },
  { value: 'chirp-auk', label: 'v4.5 中文优化版' },
  { value: 'chirp-v5', label: 'v5.0 最新版' }
] as const

// 音乐风格选项
export const MUSIC_STYLES = [
  '流行', '电子', '民谣', '摇滚', '古典', '说唱', '爵士', '蓝调',
  'R&B', '嘻哈', '乡村', '拉丁', '轻音乐', '氛围音乐', '舞曲', '新世纪'
] as const

declare global {
  interface Window {
    api: {
      project: {
        getAll: () => Promise<Project[]>
        create: (data: { name: string; description?: string }) => Promise<Project>
        update: (id: number, data: { name?: string; description?: string }) => Promise<Project>
        delete: (id: number) => Promise<void>
      }
      o3ics: {
        getByProject: (projectId: number) => Promise<Lyrics[]>
        create: (data: {
          projectId: number
          title: string
          content: string
          style?: string
          emotion?: string
          promptTemplate?: string
        }) => Promise<Lyrics>
        update: (id: number, data: { title?: string; content?: string }) => Promise<Lyrics>
        toggleFavorite: (id: number) => Promise<Lyrics>
        delete: (id: number) => Promise<void>
        getFavorites: () => Promise<Lyrics[]>
      }
      rules: {
        getAll: () => Promise<Rule[]>
        getByType: (type: string) => Promise<Rule[]>
        create: (data: { name: string; type: string; config: string; priority?: number }) => Promise<Rule>
        update: (id: number, data: {
          name?: string
          config?: string
          priority?: number
          isActive?: boolean
        }) => Promise<Rule>
        delete: (id: number) => Promise<void>
      }
      apiLog: {
        getRecent: (limit?: number) => Promise<ApiLog[]>
      }
      deepseek: {
        generate: (params: {
          systemPrompt: string
          userPrompt: string
          model?: string
        }) => Promise<string>
      }
      settings: {
        get: (key: string) => Promise<any>
        set: (key: string, value: any) => Promise<void>
        getAll: () => Promise<Record<string, any>>
      }
      dialog: {
        openFile: () => Promise<string[]>
        openDirectory: () => Promise<string | null>
      }
      musicTrack: {
        getByO3ics: (o3icsId: number) => Promise<MusicTrack[]>
        create: (data: {
          o3icsId: number
          title: string
          taskId?: string
          style?: string
          model?: string
          instrumental?: boolean
        }) => Promise<MusicTrack>
        update: (id: number, data: {
          status?: string
          audioUrl?: string
          videoUrl?: string
          coverImageUrl?: string
          sunoSongId?: string
          failReason?: string
          title?: string
        }) => Promise<MusicTrack>
        delete: (id: number) => Promise<void>
        getByTaskId: (taskId: string) => Promise<MusicTrack[]>
      }
      suno: {
        submit: (params: SunoSubmitParams) => Promise<SunoTaskResponse>
        fetch: (taskIds: string[]) => Promise<SunoTaskResult[]>
        getApiKey: () => Promise<string | null>
        setApiKey: (apiKey: string) => Promise<void>
        getBaseUrl: () => Promise<string | null>
        setBaseUrl: (baseUrl: string) => Promise<void>
        onProgress: (callback: (event: any, data: any) => void) => () => void
      }
    }
  }
}

export {}