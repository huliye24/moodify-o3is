import { create } from 'zustand'

export interface MoodTrack {
  name: string
  artist: string
  mood: 'coil' | 'lost' | 'awaken' | 'expand'
  color: string
  url: string
  description?: string
  tags?: string[]
}

export const MOOD_TRACKS: MoodTrack[] = [
  {
    name: '蜷缩 · 深翠呼吸',
    artist: 'Moodify',
    mood: 'coil',
    color: '#2D5A3D',
    description: '紧 · 沉 · 静',
    tags: ['无力', '崩溃边缘', '什么都不想做'],
    url: 'https://cdn.pixabay.com/download/audio/2022/01/20/audio_4bc6a09939.mp3'
  },
  {
    name: '迷茫 · 翠雾飘散',
    artist: 'Moodify',
    mood: 'lost',
    color: '#3A7A52',
    description: '不确定 · 悬浮',
    tags: ['不知道方向', '停在原地', '想走但不知道往哪'],
    url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_77ef6de6e5.mp3'
  },
  {
    name: '觉醒 · 透光微暖',
    artist: 'Moodify',
    mood: 'awaken',
    color: '#5BAD7A',
    description: '看见了什么',
    tags: ['某句话击中了你', '突然明白了什么', '光透进来了'],
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'
  },
  {
    name: '舒展 · 翠光呼吸',
    artist: 'Moodify',
    mood: 'expand',
    color: '#8FD4A8',
    description: '打开 · 呼吸',
    tags: ['微光', '可以呼吸了', '什么都不用做'],
    url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_dc39bce8b3.mp3'
  }
]

interface MoodState {
  // 播放状态
  isPlaying: boolean
  isLooping: boolean
  isMuted: boolean
  volume: number
  currentTime: number
  duration: number
  currentIndex: number

  // 音频实例
  audio: HTMLAudioElement | null

  // Actions
  setAudio: (audio: HTMLAudioElement) => void
  play: () => void
  pause: () => void
  togglePlay: () => void
  setVolume: (v: number) => void
  toggleMute: () => void
  toggleLoop: () => void
  loadTrack: (index: number) => void
  skipNext: () => void
  skipPrev: () => void
  seek: (time: number) => void
  setCurrentTime: (t: number) => void
  setDuration: (d: number) => void
}

export const useMoodStore = create<MoodState>((set, get) => ({
  isPlaying: false,
  isLooping: false,
  isMuted: false,
  volume: 0.7,
  currentTime: 0,
  duration: 0,
  currentIndex: 0,
  audio: null,

  setAudio: (audio) => set({ audio }),

  play: () => {
    const { audio } = get()
    if (audio) {
      audio.play().catch(() => {})
      set({ isPlaying: true })
    }
  },

  pause: () => {
    const { audio } = get()
    if (audio) {
      audio.pause()
      set({ isPlaying: false })
    }
  },

  togglePlay: () => {
    const { isPlaying, play, pause } = get()
    if (isPlaying) { pause() } else { play() }
  },

  setVolume: (v) => {
    const { audio } = get()
    set({ volume: v, isMuted: v === 0 })
    if (audio) audio.volume = v
  },

  toggleMute: () => {
    const { audio, isMuted, volume } = get()
    const next = !isMuted
    if (audio) audio.muted = next
    set({ isMuted: next })
  },

  toggleLoop: () => {
    const { audio, isLooping } = get()
    const next = !isLooping
    if (audio) audio.loop = next
    set({ isLooping: next })
  },

  loadTrack: (index) => {
    const { audio } = get()
    const list = MOOD_TRACKS
    const idx = ((index % list.length) + list.length) % list.length
    if (audio) {
      audio.src = list[idx].url
      audio.load()
      audio.play().catch(() => {})
    }
    set({ currentIndex: idx, isPlaying: true, currentTime: 0 })
  },

  skipNext: () => {
    const { currentIndex } = get()
    get().loadTrack(currentIndex + 1)
  },

  skipPrev: () => {
    const { audio, currentTime, currentIndex } = get()
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      return
    }
    get().loadTrack(currentIndex - 1)
  },

  seek: (time) => {
    const { audio } = get()
    if (audio) {
      audio.currentTime = time
      set({ currentTime: time })
    }
  },

  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
}))
