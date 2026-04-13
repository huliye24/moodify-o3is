export interface Project {
  id: string
  name: string
  description: string
  o3ics_count: number
  created_at: string
  updated_at: string
}

export interface O3ics {
  id: string
  project_id: string
  title: string
  content: string
  emotion: string
  theme: string
  style: string
  rhyme: string
  length: string
  suno_prompts: string
  dice_result: string
  original_text: string
  favorite: boolean
  created_at: string
  updated_at: string
}

export interface Rule {
  id: string
  name: string
  type: string
  author: string
  version: string
  tags: string
  description: string
  config: string
  priority: number
  is_active: boolean
  is_public: boolean
  like_count: number
  use_count: number
  created_at: string
  updated_at: string
}

export interface GenerateParams {
  emotion: string
  theme: string
  style: string
  rhyme: string
  length: string
}

export interface GenerateRequest {
  content: string
  project_id?: string
  params: GenerateParams
  use_rules: boolean
  use_dice: boolean
}

export interface DiceResult {
  closing_style: string
  turning_point: string
  perspective: string
  rhetoric: string
  line_length_variation: string
}

export interface GenerateResponse {
  o3ics: string
  suno_prompts: string[]
  dice_result: DiceResult
  metadata: {
    model: string
    tokens_used: number
    generation_time_ms: number
  }
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface Options {
  emotions: string[]
  themes: string[]
  styles: string[]
  rhymes: string[]
  lengths: string[]
  ruleTypes: string[]
}