import axios from 'axios'
import Store from 'electron-store'

const store = new Store()

// Suno API 基础 URL - 需要在设置中配置
const DEFAULT_BASE_URL = 'https://api.sunoai.com'

// Suno 请求参数
export interface SunoSubmitParams {
  gpt_description_prompt: string
  make_instrumental: boolean
  model: string
  o3ics?: string
  title?: string
  notify_hook?: string
}

// Suno 任务响应
export interface SunoSubmitResponse {
  task_id: string
}

// Suno 歌曲数据
export interface SunoSong {
  id: string
  title: string
  audio_url: string
  video_url: string
  image_url: string
  o3ics: string
}

// Suno 任务状态
export interface SunoTask {
  task_id: string
  action: string
  status: 'NOT_START' | 'SUBMITTED' | 'QUEUED' | 'IN_PROGRESS' | 'FAILURE' | 'SUCCESS'
  submitTime: number
  startTime: number
  finishTime: number
  failReason?: string
  data: {
    songs?: SunoSong[]
    o3ics?: string
  }
}

// Suno Fetch 响应
export interface SunoFetchResponse {
  tasks: SunoTask[]
}

// 获取 Suno API 配置
function getSunoConfig() {
  const baseUrl = (store.get('sunoBaseUrl') as string) || DEFAULT_BASE_URL
  const apiKey = store.get('sunoApiKey') as string

  return { baseUrl, apiKey }
}

// 验证 API 配置
function validateConfig(): { baseUrl: string; apiKey: string } {
  const config = getSunoConfig()

  if (!config.apiKey) {
    throw new Error('请先在设置中配置 Suno API Key')
  }

  if (!config.baseUrl) {
    throw new Error('请先在设置中配置 Suno API 地址')
  }

  return config
}

// 创建 Axios 实例
function createSunoClient(baseUrl: string, apiKey: string) {
  return axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    timeout: 120000
  })
}

// 提交音乐生成任务
export async function submitMusicTask(params: SunoSubmitParams): Promise<SunoSubmitResponse> {
  const { baseUrl, apiKey } = validateConfig()
  const client = createSunoClient(baseUrl, apiKey)

  try {
    const response = await client.post<SunoSubmitResponse>('/suno/submit/music', params)
    return response.data
  } catch (error: any) {
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || '提交失败'
      throw new Error(message)
    }
    throw new Error(error.message || '提交音乐任务失败')
  }
}

// 查询任务状态
export async function fetchTasks(taskIds: string[]): Promise<SunoTask[]> {
  if (taskIds.length === 0) {
    return []
  }

  const { baseUrl, apiKey } = validateConfig()
  const client = createSunoClient(baseUrl, apiKey)

  try {
    const response = await client.post<SunoFetchResponse>('/suno/fetch', {
      task_ids: taskIds
    })
    return response.data.tasks || []
  } catch (error: any) {
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || '查询失败'
      throw new Error(message)
    }
    throw new Error(error.message || '查询任务状态失败')
  }
}

// 获取单个任务状态
export async function fetchTask(taskId: string): Promise<SunoTask | null> {
  const tasks = await fetchTasks([taskId])
  return tasks[0] || null
}

// 转换 Suno 状态到内部状态
export function mapSunoStatus(sunoStatus: string): string {
  switch (sunoStatus) {
    case 'NOT_START':
      return 'pending'
    case 'SUBMITTED':
    case 'QUEUED':
      return 'submitted'
    case 'IN_PROGRESS':
      return 'in_progress'
    case 'SUCCESS':
      return 'success'
    case 'FAILURE':
      return 'failure'
    default:
      return 'pending'
  }
}

// 获取状态进度百分比
export function getStatusProgress(status: string): number {
  switch (status) {
    case 'pending':
      return 0
    case 'submitted':
      return 20
    case 'queued':
      return 40
    case 'in_progress':
      return 70
    case 'success':
      return 100
    case 'failure':
      return 100
    default:
      return 0
  }
}

// 获取状态中文描述
export function getStatusText(status: string): string {
  switch (status) {
    case 'pending':
      return '等待提交'
    case 'submitted':
      return '提交中'
    case 'queued':
      return '排队中'
    case 'in_progress':
      return '生成中'
    case 'success':
      return '生成完成'
    case 'failure':
      return '生成失败'
    default:
      return '未知状态'
  }
}
