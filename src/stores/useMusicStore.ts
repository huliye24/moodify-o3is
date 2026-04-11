import { create } from 'zustand'
import type { MusicTrack } from '../types'

interface MusicState {
  // 播放列表
  playlist: MusicTrack[]
  currentTrack: MusicTrack | null
  queue: MusicTrack[]

  // 播放状态
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean

  // 生成状态
  isGenerating: boolean
  currentTaskId: string | null
  generationProgress: number
  generationError: string | null

  // 操作
  setPlaylist: (tracks: MusicTrack[]) => void
  addToPlaylist: (track: MusicTrack) => void
  removeFromPlaylist: (trackId: number) => void
  setCurrentTrack: (track: MusicTrack | null) => void
  setQueue: (tracks: MusicTrack[]) => void
  addToQueue: (track: MusicTrack) => void

  play: () => void
  pause: () => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void

  startGenerating: (taskId: string) => void
  updateProgress: (progress: number) => void
  stopGenerating: () => void
  setGenerationError: (error: string | null) => void
}

export const useMusicStore = create<MusicState>((set) => ({
  // 播放列表
  playlist: [],
  currentTrack: null,
  queue: [],

  // 播放状态
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,

  // 生成状态
  isGenerating: false,
  currentTaskId: null,
  generationProgress: 0,
  generationError: null,

  // 播放列表操作
  setPlaylist: (tracks) => set({ playlist: tracks }),

  addToPlaylist: (track) => set((state) => ({
    playlist: [track, ...state.playlist]
  })),

  removeFromPlaylist: (trackId) => set((state) => ({
    playlist: state.playlist.filter(t => t.id !== trackId),
    currentTrack: state.currentTrack?.id === trackId ? null : state.currentTrack
  })),

  setCurrentTrack: (track) => set({
    currentTrack: track,
    currentTime: 0,
    isPlaying: track !== null
  }),

  setQueue: (tracks) => set({ queue: tracks }),

  addToQueue: (track) => set((state) => ({
    queue: [...state.queue, track]
  })),

  // 播放控制
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  // 生成状态
  startGenerating: (taskId) => set({
    isGenerating: true,
    currentTaskId: taskId,
    generationProgress: 0,
    generationError: null
  }),

  updateProgress: (progress) => set({ generationProgress: progress }),

  stopGenerating: () => set({
    isGenerating: false,
    currentTaskId: null,
    generationProgress: 0
  }),

  setGenerationError: (error) => set({
    isGenerating: false,
    generationError: error
  })
}))
