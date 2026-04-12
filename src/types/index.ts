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

// MusicTrack 类型 (与后端 snake_case JSON 对应)
export type MusicTrackStatus = 'pending' | 'submitted' | 'queued' | 'in_progress' | 'success' | 'failure'

export interface MusicTrack {
  id: string
  o3ics_id: string
  task_id: string | null
  suno_song_id: string | null
  title: string
  audio_url: string | null
  video_url: string | null
  cover_image_url: string | null
  status: MusicTrackStatus
  fail_reason: string | null
  style: string | null
  model: string | null
  instrumental: boolean
  created_at: string
  updated_at: string
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
      window: {
        openPlayer: () => Promise<void>
        openWeb:   () => Promise<void>
        openMain:  () => Promise<void>
      }
      shell: {
        openExternal: (url: string) => Promise<void>
      }
      deepseek: {
        generate: (params: {
          systemPrompt: string
          userPrompt: string
          model?: string
        }) => Promise<string>
        getApiKey: () => Promise<string | null>
        setApiKey: (apiKey: string) => Promise<void>
      }
      suno: {
        submit: (params: SunoSubmitParams) => Promise<SunoTaskResponse>
        fetch: (taskIds: string[]) => Promise<SunoTaskResult[]>
        getApiKey:  () => Promise<string | null>
        setApiKey:  (apiKey: string)  => Promise<void>
        getBaseUrl: () => Promise<string | null>
        setBaseUrl: (baseUrl: string) => Promise<void>
        onProgress: (callback: (event: any, data: any) => void) => () => void
      }
      settings: {
        get:    (key: string) => Promise<any>
        set:    (key: string, value: any) => Promise<void>
        getAll: () => Promise<Record<string, any>>
      }
      dialog: {
        openFile:     () => Promise<string[]>
        openDirectory: () => Promise<string | null>
      }
      http: {
        get:    (url: string) => Promise<any>
        post:   (url: string, body: any) => Promise<any>
        delete: (url: string) => Promise<any>
      }
      rules: {
        getAll:    () => Promise<any[]>
        create:    (rule: any) => Promise<any>
        update:    (id: number, data: any) => Promise<any>
        delete:    (id: number) => Promise<any>
      }
    }
  }
}

export {}