import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MusicTrack } from '../types'

// ============================================================
// 播放状态（统一管理，替代 useMusicStore 的播放相关字段）
// ============================================================
interface UnifiedPlayerState {
  // 播放列表
  playlist: MusicTrack[]
  currentTrack: MusicTrack | null
  queue: MusicTrack[]

  // 播放状态（统一来源）
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean

  // 生成状态（useMusicStore 原有的，不重叠）
  isGenerating: boolean
  currentTaskId: string | null
  generationProgress: number
  generationError: string | null

  // 操作
  setPlaylist: (tracks: MusicTrack[]) => void
  addToPlaylist: (track: MusicTrack) => void
  removeFromPlaylist: (trackId: string) => void
  setCurrentTrack: (track: MusicTrack | null) => void
  setQueue: (tracks: MusicTrack[]) => void
  addToQueue: (track: MusicTrack) => void

  play: () => void
  pause: () => void
  togglePlay: () => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void

  startGenerating: (taskId: string) => void
  updateProgress: (progress: number) => void
  stopGenerating: () => void
  setGenerationError: (error: string | null) => void
}

// ============================================================
// 本地文件播放（usePlayerStore 原有的，独立于歌曲库）
// ============================================================
interface LocalPlayerState {
  localPlaylist: string[]
  currentIndex: number
  currentLocalTrack: string | null
  localVolume: number

  addMusic: (files: string[]) => void
  playTrack: (index: number) => void
  togglePlayLocal: () => void
  prevTrack: () => void
  nextTrack: () => void
  setLocalVolume: (volume: number) => void
  clearPlaylist: () => void
}

// ============================================================
// 统一 Store
// ============================================================
export const usePlayerStore = create<UnifiedPlayerState & LocalPlayerState>()(
  persist(
    (set, get) => ({
      // ---- 歌曲库播放列表 ----
      playlist: [],
      currentTrack: null,
      queue: [],

      // ---- 播放状态 ----
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      isMuted: false,

      // ---- 生成状态 ----
      isGenerating: false,
      currentTaskId: null,
      generationProgress: 0,
      generationError: null,

      // ---- 本地文件播放 ----
      localPlaylist: [],
      currentIndex: -1,
      currentLocalTrack: null,
      localVolume: 60,

      // ---- 歌曲库操作 ----
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

      // ---- 播放控制 ----
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      togglePlay: () => {
        const { isPlaying, currentTrack } = get()
        if (currentTrack) {
          set({ isPlaying: !isPlaying })
        }
      },

      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration }),
      setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

      // ---- 生成状态 ----
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
      }),

      // ---- 本地文件操作 ----
      addMusic: (files) => {
        const state = get()
        const newPlaylist = [...state.localPlaylist]
        files.forEach(file => {
          if (!newPlaylist.includes(file)) {
            newPlaylist.push(file)
          }
        })
        set({
          localPlaylist: newPlaylist,
          currentIndex: state.currentIndex === -1 ? 0 : state.currentIndex,
          currentLocalTrack: state.currentLocalTrack || (newPlaylist.length > 0 ? newPlaylist[0] : null)
        })
      },

      playTrack: (index) => {
        const state = get()
        if (index >= 0 && index < state.localPlaylist.length) {
          set({
            currentIndex: index,
            currentLocalTrack: state.localPlaylist[index],
            isPlaying: true
          })
        }
      },

      togglePlayLocal: () => {
        const state = get()
        if (state.currentLocalTrack) {
          set({ isPlaying: !state.isPlaying })
        }
      },

      prevTrack: () => {
        const state = get()
        if (state.localPlaylist.length > 0) {
          const newIndex = state.currentIndex <= 0
            ? state.localPlaylist.length - 1
            : state.currentIndex - 1
          set({
            currentIndex: newIndex,
            currentLocalTrack: state.localPlaylist[newIndex],
            isPlaying: true
          })
        }
      },

      nextTrack: () => {
        const state = get()
        if (state.localPlaylist.length > 0) {
          const newIndex = (state.currentIndex + 1) % state.localPlaylist.length
          set({
            currentIndex: newIndex,
            currentLocalTrack: state.localPlaylist[newIndex],
            isPlaying: true
          })
        }
      },

      setLocalVolume: (volume) => {
        set({ localVolume: Math.max(0, Math.min(100, volume)) })
      },

      clearPlaylist: () => {
        set({
          localPlaylist: [],
          currentIndex: -1,
          isPlaying: false,
          currentLocalTrack: null
        })
      },
    }),
    {
      name: 'moodify-player-storage',
      partialize: (state) => ({
        playlist: state.playlist,
        volume: state.volume,
        localPlaylist: state.localPlaylist,
        localVolume: state.localVolume
      })
    }
  )
)
