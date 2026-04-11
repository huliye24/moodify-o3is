import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PlayerState {
  playlist: string[]
  currentIndex: number
  isPlaying: boolean
  volume: number
  currentTrack: string | null

  // Actions
  addMusic: (files: string[]) => void
  playTrack: (index: number) => void
  togglePlay: () => void
  prevTrack: () => void
  nextTrack: () => void
  setVolume: (volume: number) => void
  clearPlaylist: () => void
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      playlist: [],
      currentIndex: -1,
      isPlaying: false,
      volume: 60,
      currentTrack: null,

      addMusic: (files: string[]) => {
        const state = get()
        const newPlaylist = [...state.playlist]
        files.forEach(file => {
          if (!newPlaylist.includes(file)) {
            newPlaylist.push(file)
          }
        })
        set({
          playlist: newPlaylist,
          currentIndex: state.currentIndex === -1 ? 0 : state.currentIndex,
          currentTrack: state.currentTrack || (newPlaylist.length > 0 ? newPlaylist[0] : null)
        })
      },

      playTrack: (index: number) => {
        const state = get()
        if (index >= 0 && index < state.playlist.length) {
          set({
            currentIndex: index,
            currentTrack: state.playlist[index],
            isPlaying: true
          })
        }
      },

      togglePlay: () => {
        const state = get()
        if (state.currentTrack) {
          set({ isPlaying: !state.isPlaying })
        }
      },

      prevTrack: () => {
        const state = get()
        if (state.playlist.length > 0) {
          const newIndex = state.currentIndex <= 0
            ? state.playlist.length - 1
            : state.currentIndex - 1
          set({
            currentIndex: newIndex,
            currentTrack: state.playlist[newIndex],
            isPlaying: true
          })
        }
      },

      nextTrack: () => {
        const state = get()
        if (state.playlist.length > 0) {
          const newIndex = (state.currentIndex + 1) % state.playlist.length
          set({
            currentIndex: newIndex,
            currentTrack: state.playlist[newIndex],
            isPlaying: true
          })
        }
      },

      setVolume: (volume: number) => {
        set({ volume: Math.max(0, Math.min(100, volume)) })
      },

      clearPlaylist: () => {
        set({
          playlist: [],
          currentIndex: -1,
          isPlaying: false,
          currentTrack: null
        })
      }
    }),
    {
      name: 'moodify-player-storage',
      partialize: (state) => ({
        playlist: state.playlist,
        volume: state.volume
      })
    }
  )
)
