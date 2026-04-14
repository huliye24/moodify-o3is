import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MoodTrack {
  name: string
  artist: string
  mood: 'coil' | 'lost' | 'awaken' | 'expand'
  color: string
  gradient: string
  url: string
  cover: string
  description?: string
  tags?: string[]
}

export const MOOD_TRACKS: MoodTrack[] = [
  {
    name: '蜷缩 · 深蓝呼吸',
    artist: 'Moodify',
    mood: 'coil',
    color: '#FF6B8A',
    gradient: 'linear-gradient(145deg, #FFB6C1 0%, #FF8FAB 50%, #FF6B8A 100%)',
    description: '紧 · 沉 · 冷',
    tags: ['无力', '崩溃边缘', '什么都不想做'],
    url: 'https://cdn.pixabay.com/download/audio/2022/01/20/audio_4bc6a09939.mp3',
    cover: 'https://picsum.photos/seed/1/400',
  },
  {
    name: '迷茫 · 灰雾飘散',
    artist: 'Moodify',
    mood: 'lost',
    color: '#4ECDC4',
    gradient: 'linear-gradient(145deg, #A8E6CF 0%, #6DD5C4 50%, #4ECDC4 100%)',
    description: '不确定 · 悬浮',
    tags: ['不知道方向', '停在原地', '想走但不知道往哪'],
    url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_77ef6de6e5.mp3',
    cover: 'https://picsum.photos/seed/2/400',
  },
  {
    name: '觉醒 · 透光微暖',
    artist: 'Moodify',
    mood: 'awaken',
    color: '#FFD93D',
    gradient: 'linear-gradient(145deg, #FFE5A0 0%, #FFE066 50%, #FFD93D 100%)',
    description: '看见了什么',
    tags: ['某句话击中了你', '突然明白了什么', '光透进来了'],
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
    cover: 'https://picsum.photos/seed/3/400',
  },
  {
    name: '舒展 · 透明呼吸',
    artist: 'Moodify',
    mood: 'expand',
    color: '#C4D4E4',
    gradient: 'linear-gradient(145deg, #E8F4F8 0%, #C4D4E4 50%, #A8B8C9 100%)',
    description: '打开 · 呼吸',
    tags: ['微光', '可以呼吸了', '什么都不用做'],
    url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_dc39bce8b3.mp3',
    cover: 'https://picsum.photos/seed/4/400',
  },
]

export type PlayMode = 'sequential' | 'repeat-one' | 'shuffle'

// Fisher-Yates shuffle
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

interface MoodState {
  // 播放状态
  isPlaying: boolean
  isMuted: boolean
  volume: number
  currentTime: number
  duration: number
  currentIndex: number

  // 播放模式
  playMode: PlayMode
  shuffleOrder: number[]

  // 音频实例（不持久化）
  audio: HTMLAudioElement | null

  // Actions
  setAudio: (audio: HTMLAudioElement) => void
  play: () => void
  pause: () => void
  togglePlay: () => void
  setVolume: (v: number) => void
  toggleMute: () => void
  loadTrack: (index: number) => void
  skipNext: () => void
  skipPrev: () => void
  seek: (time: number) => void
  setCurrentTime: (t: number) => void
  setDuration: (d: number) => void
  setPlayMode: (mode: PlayMode) => void
  cyclePlayMode: () => void
}

const PLAY_MODES: PlayMode[] = ['sequential', 'repeat-one', 'shuffle']

function buildShuffleOrder(currentIdx: number): number[] {
  const order = MOOD_TRACKS.map((_, i) => i).filter(i => i !== currentIdx)
  const shuffled = shuffleArray(order)
  return [currentIdx, ...shuffled]
}

export const useMoodStore = create<MoodState>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      isMuted: false,
      volume: 0.7,
      currentTime: 0,
      duration: 0,
      currentIndex: 0,
      playMode: 'sequential',
      shuffleOrder: buildShuffleOrder(0),
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
        const { audio, isMuted } = get()
        const next = !isMuted
        if (audio) audio.muted = next
        set({ isMuted: next })
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

        // Rebuild shuffle order so current track is first
        const newOrder = buildShuffleOrder(idx)
        set({ currentIndex: idx, isPlaying: true, currentTime: 0, shuffleOrder: newOrder })
      },

      skipNext: () => {
        const { currentIndex, playMode, shuffleOrder } = get()
        const list = MOOD_TRACKS

        if (playMode === 'repeat-one') {
          const { audio } = get()
          if (audio) { audio.currentTime = 0; audio.play().catch(() => {}) }
          return
        }

        if (playMode === 'shuffle') {
          const currentPos = shuffleOrder.indexOf(currentIndex)
          const nextPos = (currentPos + 1) % shuffleOrder.length
          get().loadTrack(shuffleOrder[nextPos])
          return
        }

        // sequential
        get().loadTrack(currentIndex + 1)
      },

      skipPrev: () => {
        const { audio, currentTime, currentIndex } = get()
        if (audio && audio.currentTime > 3) {
          audio.currentTime = 0
          return
        }
        const list = MOOD_TRACKS
        get().loadTrack(currentIndex - 1 + list.length)
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

      setPlayMode: (mode) => {
        const { currentIndex } = get()
        if (mode === 'shuffle') {
          set({ playMode: mode, shuffleOrder: buildShuffleOrder(currentIndex) })
        } else {
          set({ playMode: mode })
        }
      },

      cyclePlayMode: () => {
        const { playMode, currentIndex } = get()
        const currentIdx = PLAY_MODES.indexOf(playMode)
        const nextMode = PLAY_MODES[(currentIdx + 1) % PLAY_MODES.length]
        if (nextMode === 'shuffle') {
          set({ playMode: nextMode, shuffleOrder: buildShuffleOrder(currentIndex) })
        } else {
          set({ playMode: nextMode })
        }
      },
    }),
    {
      name: 'moodify-mood-storage',
      partialize: (state) => ({
        volume: state.volume,
        playMode: state.playMode,
        shuffleOrder: state.shuffleOrder,
        currentIndex: state.currentIndex,
      }),
    }
  )
)

// Export for use in ended event handler
export { PLAY_MODES }
