import { create } from 'zustand'
import { Project, Lyrics, Rule } from '../types'

interface AppState {
  // 数据
  projects: Project[]
  currentProject: Project | null
  lyricsList: Lyrics[]
  favoriteLyrics: Lyrics[]
  rules: Rule[]
  apiKey: string | null

  // UI状态
  isLoading: boolean
  isGenerating: boolean
  selectedLyrics: Lyrics | null
  showSidebar: boolean

  // 输入状态
  inputContent: string
  selectedEmotion: string
  selectedTheme: string
  selectedStyle: string
  selectedRhyme: string
  selectedLength: string
  customRules: string

  // 操作
  initialize: () => Promise<void>
  loadProjects: () => Promise<void>
  selectProject: (project: Project | null) => Promise<void>
  createProject: (name: string, description?: string) => Promise<void>
  deleteProject: (id: number) => Promise<void>

  loadLyrics: (projectId: number) => Promise<void>
  selectLyrics: (lyrics: Lyrics | null) => void
  loadFavorites: () => Promise<void>

  loadRules: () => Promise<void>

  setInputContent: (content: string) => void
  setSelectedEmotion: (emotion: string) => void
  setSelectedTheme: (theme: string) => void
  setSelectedStyle: (style: string) => void
  setSelectedRhyme: (rhyme: string) => void
  setSelectedLength: (length: string) => void
  setCustomRules: (rules: string) => void

  generateLyrics: () => Promise<void>
  saveLyrics: (title: string, content: string) => Promise<void>
  updateLyrics: (id: number, title: string, content: string) => Promise<void>
  deleteLyrics: (id: number) => Promise<void>
  toggleFavorite: (id: number) => Promise<void>

  setIsGenerating: (value: boolean) => void
  toggleSidebar: () => void
}

const SYSTEM_PROMPT = `你是一位专业的华语歌词创作者，擅长根据不同的情感和主题创作富有意境的歌词。

# 风格要求
- 语言优美，富有诗意
- 押韵自然，节奏感强
- 避免过于直白，讲究含蓄表达
- 善用比喻、拟人等修辞手法

# 格式要求
- 歌词分为多个段落
- 每段标注类型：[ verse ] 主歌 [ chorus ] 副歌 [ bridge ] 过渡段
- 控制歌词长度适中，旋律感强

# 注意事项
- 不要输出任何解释性文字，只输出歌词内容
- 歌词要有画面感，让听众能够产生共鸣
- 情感表达要真挚动人`

export const useStore = create<AppState>((set, get) => ({
  // 初始状态
  projects: [],
  currentProject: null,
  lyricsList: [],
  favoriteLyrics: [],
  rules: [],
  apiKey: null,
  isLoading: false,
  isGenerating: false,
  selectedLyrics: null,
  showSidebar: true,
  inputContent: '',
  selectedEmotion: '',
  selectedTheme: '',
  selectedStyle: '流行',
  selectedRhyme: 'ABAB',
  selectedLength: '中等',
  customRules: '',

  // 初始化
  initialize: async () => {
    set({ isLoading: true })
    try {
      const apiKey = await window.api.settings.get('deepseekApiKey')
      set({ apiKey })
      await get().loadProjects()
      await get().loadRules()
    } catch (error) {
      console.error('初始化失败:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  // 项目管理
  loadProjects: async () => {
    try {
      const projects = await window.api.project.getAll()
      set({ projects })
    } catch (error) {
      console.error('加载项目失败:', error)
    }
  },

  selectProject: async (project) => {
    set({ currentProject: project, selectedLyrics: null, inputContent: '' })
    if (project) {
      await get().loadLyrics(project.id)
    } else {
      set({ lyricsList: [] })
    }
  },

  createProject: async (name, description) => {
    try {
      const project = await window.api.project.create({ name, description })
      set((state) => ({ projects: [project, ...state.projects] }))
      await get().selectProject(project)
    } catch (error) {
      console.error('创建项目失败:', error)
    }
  },

  deleteProject: async (id) => {
    try {
      await window.api.project.delete(id)
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject
      }))
    } catch (error) {
      console.error('删除项目失败:', error)
    }
  },

  // 歌词管理
  loadLyrics: async (projectId) => {
    try {
      const lyricsList = await window.api.o3ics.getByProject(projectId)
      set({ lyricsList })
    } catch (error) {
      console.error('加载歌词失败:', error)
    }
  },

  selectLyrics: (lyrics) => {
    set({ selectedLyrics: lyrics })
    if (lyrics) {
      set({
        inputContent: lyrics.content,
        selectedEmotion: lyrics.emotion || '',
        selectedStyle: lyrics.style || '流行'
      })
    }
  },

  loadFavorites: async () => {
    try {
      const favoriteLyrics = await window.api.o3ics.getFavorites()
      set({ favoriteLyrics })
    } catch (error) {
      console.error('加载收藏失败:', error)
    }
  },

  // 规则管理
  loadRules: async () => {
    try {
      const rules = await window.api.rules.getAll()
      set({ rules })
    } catch (error) {
      console.error('加载规则失败:', error)
    }
  },

  // 设置状态
  setInputContent: (content) => set({ inputContent: content }),
  setSelectedEmotion: (emotion) => set({ selectedEmotion: emotion }),
  setSelectedTheme: (theme) => set({ selectedTheme: theme }),
  setSelectedStyle: (style) => set({ selectedStyle: style }),
  setSelectedRhyme: (rhyme) => set({ selectedRhyme: rhyme }),
  setSelectedLength: (length) => set({ selectedLength: length }),
  setCustomRules: (rules) => set({ customRules: rules }),

  // 生成歌词
  generateLyrics: async () => {
    const { inputContent, selectedEmotion, selectedTheme, selectedStyle, selectedRhyme, selectedLength, customRules, currentProject } = get()

    if (!inputContent.trim()) {
      throw new Error('请输入文案内容')
    }

    if (!currentProject) {
      throw new Error('请先选择或创建一个项目')
    }

    set({ isGenerating: true })

    try {
      const userPrompt = `请根据以下文案创作歌词：

## 用户文案
${inputContent}

## 情感基调
${selectedEmotion || '根据文案自动判断'}

## 主题
${selectedTheme || '根据文案自动判断'}

## 歌词风格
${selectedStyle}

## 韵律格式
${selectedRhyme}

## 歌曲长度
${selectedLength}

${customRules ? `## 自定义要求\n${customRules}` : ''}

请创作一首完整、优美、有意境的歌词。`

      const result = await window.api.deepseek.generate({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt
      })

      set({ inputContent: result, selectedLyrics: null })
      return result
    } catch (error) {
      throw error
    } finally {
      set({ isGenerating: false })
    }
  },

  // 保存歌词
  saveLyrics: async (title, content) => {
    const { currentProject, selectedEmotion, selectedStyle } = get()

    if (!currentProject) {
      throw new Error('请先选择项目')
    }

    try {
      const lyrics = await window.api.o3ics.create({
        projectId: currentProject.id,
        title,
        content,
        emotion: selectedEmotion,
        style: selectedStyle
      })

      set((state) => ({
        lyricsList: [lyrics, ...state.lyricsList],
        selectedLyrics: lyrics
      }))
    } catch (error) {
      throw error
    }
  },

  updateLyrics: async (id, title, content) => {
    try {
      const lyrics = await window.api.o3ics.update(id, { title, content })
      set((state) => ({
        lyricsList: state.lyricsList.map((l) => (l.id === id ? lyrics : l)),
        selectedLyrics: state.selectedLyrics?.id === id ? lyrics : state.selectedLyrics
      }))
    } catch (error) {
      throw error
    }
  },

  deleteLyrics: async (id) => {
    try {
      await window.api.o3ics.delete(id)
      set((state) => ({
        lyricsList: state.lyricsList.filter((l) => l.id !== id),
        selectedLyrics: state.selectedLyrics?.id === id ? null : state.selectedLyrics
      }))
    } catch (error) {
      throw error
    }
  },

  toggleFavorite: async (id) => {
    try {
      const lyrics = await window.api.o3ics.toggleFavorite(id)
      set((state) => ({
        lyricsList: state.lyricsList.map((l) => (l.id === id ? lyrics : l)),
        favoriteLyrics: lyrics.favorite
          ? [...state.favoriteLyrics, lyrics]
          : state.favoriteLyrics.filter((l) => l.id !== id),
        selectedLyrics: state.selectedLyrics?.id === id ? lyrics : state.selectedLyrics
      }))
    } catch (error) {
      throw error
    }
  },

  setIsGenerating: (value) => set({ isGenerating: value }),
  toggleSidebar: () => set((state) => ({ showSidebar: !state.showSidebar }))
}))