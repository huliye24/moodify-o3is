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
    }
  }
}

export {}