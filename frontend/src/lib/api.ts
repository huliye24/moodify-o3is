import type { ApiResponse, Project, O3ics, Rule, GenerateRequest, GenerateResponse, Options } from '@/types'

const API_BASE = '/api/v1'

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })

  const data: ApiResponse<T> = await response.json()

  if (data.code !== 0) {
    throw new Error(data.message)
  }

  return data.data
}

export const api = {
  projects: {
    list: () => request<{ projects: Project[]; total: number }>('/projects'),
    create: (data: Partial<Project>) => request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    get: (id: string) => request<Project>(`/projects/${id}`),
    update: (id: string, data: Partial<Project>) => request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => request<null>(`/projects/${id}`, { method: 'DELETE' }),
  },

  o3ics: {
    generate: (data: GenerateRequest) => request<GenerateResponse>('/o3ics/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    list: (params?: { project_id?: string; page?: number; page_size?: number }) => {
      const searchParams = new URLSearchParams()
      if (params?.project_id) searchParams.set('project_id', params.project_id)
      if (params?.page) searchParams.set('page', String(params.page))
      if (params?.page_size) searchParams.set('page_size', String(params.page_size))
      const query = searchParams.toString()
      return request<{ o3ics: O3ics[]; total: number; page: number; page_size: number }>(`/o3ics${query ? `?${query}` : ''}`)
    },
    get: (id: string) => request<O3ics>(`/o3ics/${id}`),
    update: (id: string, data: Partial<O3ics>) => request<O3ics>(`/o3ics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => request<null>(`/o3ics/${id}`, { method: 'DELETE' }),
    toggleFavorite: (id: string) => request<{ favorite: boolean }>(`/o3ics/${id}/favorite`, { method: 'POST' }),
  },

  rules: {
    list: (params?: { type?: string; page?: number; page_size?: number }) => {
      const searchParams = new URLSearchParams()
      if (params?.type) searchParams.set('type', params.type)
      if (params?.page) searchParams.set('page', String(params.page))
      if (params?.page_size) searchParams.set('page_size', String(params.page_size))
      const query = searchParams.toString()
      return request<{ rules: Rule[]; total: number }>(`/rules${query ? `?${query}` : ''}`)
    },
    create: (data: Partial<Rule>) => request<Rule>('/rules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    get: (id: string) => request<Rule>(`/rules/${id}`),
    update: (id: string, data: Partial<Rule>) => request<Rule>(`/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => request<null>(`/rules/${id}`, { method: 'DELETE' }),
    featured: () => request<{ rules: Rule[] }>('/rules/featured'),
    import: (rule: Partial<Rule>) => request<{ id: string }>('/rules/import', {
      method: 'POST',
      body: JSON.stringify({ rule }),
    }),
    export: (id: string) => request<Rule>(`/rules/export/${id}`),
  },

  options: () => request<Options>('/options'),
}