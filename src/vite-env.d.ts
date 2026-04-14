/// <reference types="vite/client" />

interface Window {
  api?: {
    window: {
      openPlayer: () => void
      openWeb: () => void
      openMain: () => void
    }
    shell: {
      openExternal: (url: string) => void
    }
    deepseek: {
      generate: (params: { systemPrompt: string; userPrompt: string; model?: string }) => Promise<string>
      getApiKey: () => Promise<string | null>
      setApiKey: (apiKey: string) => Promise<void>
    }
    suno: {
      submit: (params: {
        gpt_description_prompt: string
        make_instrumental: boolean
        model: string
        o3ics?: string
        title?: string
        notify_hook?: string
      }) => Promise<any>
      fetch: (taskIds: string[]) => Promise<any>
      getApiKey: () => Promise<string | null>
      setApiKey: (apiKey: string) => Promise<void>
      getBaseUrl: () => Promise<string>
      setBaseUrl: (baseUrl: string) => Promise<void>
      onProgress: (callback: (event: any, data: any) => void) => () => void
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
    http: {
      get: (url: string) => Promise<any>
      post: (url: string, body?: any) => Promise<any>
      put: (url: string, body?: any) => Promise<any>
      delete: (url: string) => Promise<any>
    }
    library: {
      openFolder: () => Promise<string | null>
      scanFolder: (folderPath: string) => Promise<LibraryApiResponse>
      getAudioMetadata: (filePath: string) => Promise<LibraryApiResponse>
      getLibraryStats: () => Promise<LibraryApiResponse>
    }
  }
}

interface LibraryApiResponse {
  code?: number
  message?: string
  data?: any
}
