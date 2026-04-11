import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Project {
  id: string
  name: string
  createdAt: string
}

interface Lyrics {
  id: string
  projectId: string | null
  title: string
  content: string
  emotion: string
  style: string
  rhyme: string
  length: string
  favorite: boolean
  createdAt: string
  saved: boolean
  sunoPrompts?: string[]
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

const SUNO_PROMPT_SYSTEM = `You are a professional music producer skilled at creating descriptive prompts for Suno music generation based on lyrics.

# Your Task
Based on the given lyrics content, generate 3 Suno music generation prompts in different styles.

# Requirements
1. Each prompt should include: music style, instrument arrangement, rhythm characteristics, emotional atmosphere
2. The three prompts should have distinct style differences: e.g., one pop-oriented, one ambient, one dynamic
3. Language should be concise and accurate, suitable for Suno's gpt_description_prompt
4. Length should be between 50-150 characters
5. Always write prompts in English regardless of the lyrics language
6. Do not output any explanatory text, only the prompt content

# Output Format
Output 3 prompts, each on a separate line, separated by ###
Example:
prompt1 content
###
prompt2 content
###
prompt3 content`

async function callDeepSeekAPI(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = localStorage.getItem('moodify-deepseek-key')
  if (!apiKey) {
    throw new Error('请先在设置中配置 DeepSeek API Key')
  }

  const response = await fetch('/api/deepseek/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'API 调用失败')
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function generateSunoPrompts(lyrics: string, style: string, emotion: string): Promise<string[]> {
  const userPrompt = `## Lyrics Content
${lyrics}

## Style
${style}

## Emotion
${emotion || 'Auto-detect based on lyrics'}

Please generate 3 Suno music description prompts in different styles. Always write in English.`

  const result = await callDeepSeekAPI(SUNO_PROMPT_SYSTEM, userPrompt)
  
  const prompts = result.split('###').map(p => p.trim()).filter(p => p.length > 0)
  
  while (prompts.length < 3) {
    prompts.push(`A ${style} song with emotional vocals, piano accompaniment, and a warm atmosphere`)
  }
  
  return prompts.slice(0, 3)
}

interface AppState {
  projects: Project[]
  currentProject: Project | null
  o3icsList: Lyrics[]
  o3icsHistory: Lyrics[]
  selectedLyrics: Lyrics | null

  inputContent: string
  selectedEmotion: string
  selectedTheme: string
  selectedStyle: string
  selectedRhyme: string
  selectedLength: string

  isGenerating: boolean
  showSidebar: boolean
  showSettings: boolean
  showRules: boolean

  apiKey: string | null

  setApiKey: (key: string) => void
  createProject: (name: string) => void
  deleteProject: (id: string) => void
  selectProject: (project: Project | null) => void

  setInputContent: (content: string) => void
  setSelectedEmotion: (emotion: string) => void
  setSelectedTheme: (theme: string) => void
  setSelectedStyle: (style: string) => void
  setSelectedRhyme: (rhyme: string) => void
  setSelectedLength: (length: string) => void

  selectLyrics: (o3ics: Lyrics | null) => void
  toggleFavorite: (id: string) => void
  deleteLyrics: (id: string) => void
  deleteFromHistory: (id: string) => void
  saveToProject: (o3ics: Lyrics) => void

  generateLyrics: () => Promise<void>
  saveLyrics: () => Promise<void>

  toggleSidebar: () => void
  setShowSettings: (show: boolean) => void
  setShowRules: (show: boolean) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      o3icsList: [],
      o3icsHistory: [],
      selectedLyrics: null,
      inputContent: '',
      selectedEmotion: '',
      selectedTheme: '',
      selectedStyle: '流行',
      selectedRhyme: 'ABAB',
      selectedLength: '中等',
      isGenerating: false,
      showSidebar: true,
      showSettings: false,
      showRules: false,
      apiKey: localStorage.getItem('moodify-deepseek-key'),

      setApiKey: (key) => {
        localStorage.setItem('moodify-deepseek-key', key)
        set({ apiKey: key })
      },

      createProject: (name) => {
        const project: Project = {
          id: Date.now().toString(),
          name,
          createdAt: new Date().toISOString()
        }
        set((state) => ({
          projects: [project, ...state.projects],
          currentProject: project,
          o3icsList: []
        }))
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject,
          o3icsList: state.currentProject?.id === id ? [] : state.o3icsList
        }))
      },

      selectProject: (project) => {
        set({ currentProject: project, selectedLyrics: null })
        if (project) {
          const allLyrics = get().o3icsList.filter((l) => l.projectId === project.id)
          set({ o3icsList: allLyrics })
        } else {
          set({ o3icsList: [] })
        }
      },

      setInputContent: (content) => set({ inputContent: content }),
      setSelectedEmotion: (emotion) => set({ selectedEmotion: emotion }),
      setSelectedTheme: (theme) => set({ selectedTheme: theme }),
      setSelectedStyle: (style) => set({ selectedStyle: style }),
      setSelectedRhyme: (rhyme) => set({ selectedRhyme: rhyme }),
      setSelectedLength: (length) => set({ selectedLength: length }),

      selectLyrics: (o3ics) => {
        set({ selectedLyrics: o3ics })
        if (o3ics) {
          set({
            inputContent: o3ics.content,
            selectedEmotion: o3ics.emotion,
            selectedStyle: o3ics.style,
            selectedRhyme: o3ics.rhyme,
            selectedLength: o3ics.length
          })
        }
      },

      toggleFavorite: (id) => {
        set((state) => ({
          o3icsList: state.o3icsList.map((l) =>
            l.id === id ? { ...l, favorite: !l.favorite } : l
          ),
          o3icsHistory: state.o3icsHistory.map((l) =>
            l.id === id ? { ...l, favorite: !l.favorite } : l
          ),
          selectedLyrics: state.selectedLyrics?.id === id
            ? { ...state.selectedLyrics, favorite: !state.selectedLyrics.favorite }
            : state.selectedLyrics
        }))
      },

      deleteLyrics: (id) => {
        set((state) => ({
          o3icsList: state.o3icsList.filter((l) => l.id !== id),
          selectedLyrics: state.selectedLyrics?.id === id ? null : state.selectedLyrics
        }))
      },

      deleteFromHistory: (id) => {
        set((state) => ({
          o3icsHistory: state.o3icsHistory.filter((l) => l.id !== id),
          selectedLyrics: state.selectedLyrics?.id === id ? null : state.selectedLyrics
        }))
      },

      saveToProject: (o3ics) => {
        const { currentProject } = get()
        if (!currentProject) {
          throw new Error('请先创建或选择项目')
        }
        const savedLyrics: Lyrics = {
          ...o3ics,
          projectId: currentProject.id,
          saved: true
        }
        set((state) => ({
          o3icsList: [savedLyrics, ...state.o3icsList],
          o3icsHistory: state.o3icsHistory.map((l) =>
            l.id === o3ics.id ? { ...l, saved: true } : l
          ),
          selectedLyrics: savedLyrics
        }))
      },

      generateLyrics: async () => {
        const { inputContent, selectedEmotion, selectedTheme, selectedStyle, selectedRhyme, selectedLength } = get()

        if (!inputContent.trim()) {
          throw new Error('请输入文案内容')
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

请创作一首完整、优美、有意境的歌词。`

          const result = await callDeepSeekAPI(SYSTEM_PROMPT, userPrompt)
          
          let sunoPrompts: string[] = []
          try {
            sunoPrompts = await generateSunoPrompts(result, selectedStyle, selectedEmotion)
          } catch (e) {
            console.warn('生成Suno Prompt失败:', e)
            sunoPrompts = [
              `A ${selectedStyle} song with emotional vocals, piano accompaniment, and a warm atmosphere`,
              `An energetic ${selectedStyle} track with driving drums and guitar riffs`,
              `An ambient ${selectedStyle} piece with dreamy synthesizers and immersive atmosphere`
            ]
          }
          
          const newLyrics: Lyrics = {
            id: Date.now().toString(),
            projectId: null,
            title: '生成的歌词',
            content: result,
            emotion: selectedEmotion,
            style: selectedStyle,
            rhyme: selectedRhyme,
            length: selectedLength,
            favorite: false,
            createdAt: new Date().toISOString(),
            saved: false,
            sunoPrompts
          }
          set((state) => ({
            selectedLyrics: newLyrics,
            o3icsHistory: [newLyrics, ...state.o3icsHistory]
          }))
        } finally {
          set({ isGenerating: false })
        }
      },

      saveLyrics: async () => {
        const { inputContent, currentProject, selectedEmotion, selectedStyle, selectedRhyme, selectedLength, selectedLyrics } = get()

        if (!inputContent.trim()) {
          throw new Error('歌词内容为空')
        }

        if (!currentProject) {
          throw new Error('请先创建或选择项目')
        }

        const title = selectedLyrics?.title || `歌词 ${new Date().toLocaleString()}`

        if (selectedLyrics) {
          const savedLyrics: Lyrics = {
            ...selectedLyrics,
            projectId: currentProject.id,
            title,
            emotion: selectedEmotion,
            style: selectedStyle,
            rhyme: selectedRhyme,
            length: selectedLength,
            saved: true
          }
          set((state) => ({
            o3icsList: [savedLyrics, ...state.o3icsList.filter(l => l.id !== selectedLyrics.id)],
            o3icsHistory: state.o3icsHistory.map((l) =>
              l.id === selectedLyrics.id ? { ...l, saved: true, title } : l
            ),
            selectedLyrics: savedLyrics
          }))
        } else {
          const newLyrics: Lyrics = {
            id: Date.now().toString(),
            projectId: currentProject.id,
            title,
            content: inputContent,
            emotion: selectedEmotion,
            style: selectedStyle,
            rhyme: selectedRhyme,
            length: selectedLength,
            favorite: false,
            createdAt: new Date().toISOString(),
            saved: true
          }
          set((state) => ({
            o3icsList: [newLyrics, ...state.o3icsList],
            selectedLyrics: newLyrics
          }))
        }
      },

      toggleSidebar: () => set((state) => ({ showSidebar: !state.showSidebar })),
      setShowSettings: (show) => set({ showSettings: show }),
      setShowRules: (show) => set({ showRules: show })
    }),
    {
      name: 'moodify-storage',
      partialize: (state) => ({
        projects: state.projects,
        o3icsList: state.o3icsList,
        o3icsHistory: state.o3icsHistory,
        apiKey: state.apiKey
      })
    }
  )
)
