// ????? Store???C????? + SQLite ???
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LocalPlaylist, LibraryStats } from '../types/library'

interface UnifiedSong {
  id: string
  title: string
  artist: string
  album: string
  genre: string
  year: number
  duration: number
  audioSrc: string
  coverSrc: string
  o3ics: string
  favorite: boolean
  playCount: number
}

interface UnifiedPlaylist {
  id: string
  name: string
  songIds: string[]
}

interface LibraryState {
  songs: UnifiedSong[]
  playlists: UnifiedPlaylist[]
  currentSong: UnifiedSong | null
  isLoading: boolean
  stats: LibraryStats
  searchQuery: string
  filterArtist: string
  filterGenre: string

  loadSongs: () => Promise<void>
  addSong: (song: Partial<UnifiedSong>) => Promise<void>
  updateSong: (id: string, updates: Partial<UnifiedSong>) => Promise<void>
  deleteSong: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  playSong: (id: string) => Promise<void>
  setCurrentSong: (song: UnifiedSong | null) => void

  loadPlaylists: () => Promise<void>
  createPlaylist: (name: string) => Promise<void>
  deletePlaylist: (id: string) => Promise<void>
  addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>

  setSearchQuery: (q: string) => void
  setFilterArtist: (a: string) => void
  setFilterGenre: (g: string) => void
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      songs: [],
      playlists: [],
      currentSong: null,
      isLoading: false,
      stats: { totalSongs: 0, totalArtists: 0, totalAlbums: 0, totalPlaylists: 0, totalDuration: 0 },
      searchQuery: '',
      filterArtist: '',
      filterGenre: '',

      loadSongs: async () => {
        set({ isLoading: true })
        try {
          if (!window.api) { set({ songs: [], isLoading: false }); return }
          const res = await window.api.http.get('/api/v1/local-songs?page_size=1000')
          const data = res?.data?.songs || res?.songs || []
          const unifiedSongs: UnifiedSong[] = data.map((s: any) => ({
            id: s.id,
            title: s.title,
            artist: s.artist_name || '',
            album: s.album_name || '',
            genre: s.genre || '',
            year: s.year || 0,
            duration: s.duration || 0,
            audioSrc: s.audio_path || '',
            coverSrc: s.cover_path || '',
            o3ics: s.o3ics || '',
            favorite: s.favorite || false,
            playCount: s.play_count || 0,
          }))
          set({
            songs: unifiedSongs,
            stats: {
              totalSongs: unifiedSongs.length,
              totalArtists: [...new Set(unifiedSongs.map(s => s.artist).filter(Boolean))].length,
              totalAlbums: [...new Set(unifiedSongs.map(s => s.album).filter(Boolean))].length,
              totalPlaylists: get().playlists.length,
              totalDuration: unifiedSongs.reduce((sum, s) => sum + s.duration, 0),
            },
          })
        } catch (err) {
          console.error('??????:', err)
        } finally {
          set({ isLoading: false })
        }
      },

      addSong: async (songData) => {
        if (!window.api) return
        try {
          await window.api.http.post('/api/v1/local-songs', {
            title: songData.title || '????',
            artist_name: songData.artist || '',
            album_name: songData.album || '',
            genre: songData.genre || '',
            year: songData.year || 0,
            duration: songData.duration || 0,
            audio_path: songData.audioSrc || '',
            cover_path: songData.coverSrc || '',
            o3ics: songData.o3ics || '',
            favorite: false,
            play_count: 0,
          })
        } catch (e) { console.warn('??????', e) }
        await get().loadSongs()
      },

      updateSong: async (id, updates) => {
        if (!window.api) return
        try { await window.api.http.put(`/api/v1/local-songs/${id}`, updates) } catch {}
        await get().loadSongs()
      },

      deleteSong: async (id) => {
        if (!window.api) return
        try { await window.api.http.delete(`/api/v1/local-songs/${id}`) } catch {}
        await get().loadSongs()
      },

      toggleFavorite: async (id) => {
        if (!window.api) return
        try { await window.api.http.post(`/api/v1/local-songs/${id}/favorite`) } catch {}
        await get().loadSongs()
      },

      playSong: async (id) => {
        const { songs } = get()
        const song = songs.find(s => s.id === id)
        if (!song) return
        set({ currentSong: song })
        if (!window.api) return
        try { await window.api.http.post(`/api/v1/local-songs/${id}/play`) } catch {}
        await get().loadSongs()
      },

      setCurrentSong: (song) => set({ currentSong: song }),

      loadPlaylists: async () => {
        if (!window.api) { set({ playlists: [] }); return }
        try {
          const res = await window.api.http.get('/api/v1/local-playlists')
          const data = res?.data?.playlists || res?.playlists || []
          const unifiedPlaylists: UnifiedPlaylist[] = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            songIds: [],
          }))
          set({ playlists: unifiedPlaylists })
        } catch (err) {
          console.warn('????????')
        }
      },

      createPlaylist: async (name) => {
        if (!window.api) return
        try { await window.api.http.post('/api/v1/local-playlists', { name }) } catch {}
        await get().loadPlaylists()
      },

      deletePlaylist: async (id) => {
        if (!window.api) return
        try { await window.api.http.post(`/api/v1/local-playlists/${id}`) } catch {}
        await get().loadPlaylists()
      },

      addSongToPlaylist: async (playlistId, songId) => {
        if (!window.api) return
        try { await window.api.http.post(`/api/v1/local-playlists/${playlistId}/songs`, { song_id: songId }) } catch {}
        await get().loadPlaylists()
        await get().loadSongs()
      },

      removeSongFromPlaylist: async (playlistId, songId) => {
        if (!window.api) return
        try { await window.api.http.post(`/api/v1/local-playlists/${playlistId}/songs`, { song_id: songId }) } catch {}
        await get().loadPlaylists()
      },

      setSearchQuery: (q) => set({ searchQuery: q }),
      setFilterArtist: (a) => set({ filterArtist: a }),
      setFilterGenre: (g) => set({ filterGenre: g }),
    }),
    {
      name: 'moodify-library-storage',
      partialize: () => ({}),
    }
  )
)
