// 本地音乐库类型定义（方案C：文件系统 + SQLite 索引）

export interface LocalPlaylist {
  id: string
  name: string
  description: string
  coverPath: string
  songIds: string[]
  createdAt: string
  updatedAt: string
}

export interface LibraryStats {
  totalSongs: number
  totalArtists: number
  totalAlbums: number
  totalPlaylists: number
  totalDuration: number
  libraryPath?: string
  diskUsage?: number
  root?: string
}

// 文件扫描结果
export interface ScannedFile {
  name: string
  path: string
  ext: string
  size: number
  hash?: string
  title?: string
  artist?: string
  album?: string
  duration?: number
  cover?: string
  o3ics?: string
}

// 扫描结果（后端返回）
export interface ScanResult {
  total: number
  scanned: number
  imported: number
  skipped: number
  errors?: string[]
  songs?: LocalSong[]
}

// 音频元数据
export interface AudioMetadata {
  title?: string
  artist?: string
  album?: string
  genre?: string
  year?: number
  duration?: number
  coverPath?: string
  lyrics?: string
}

// 本地歌曲（后端返回的数据库记录）
export interface LocalSong {
  id: string
  title: string
  artist_name: string
  album_name: string
  genre: string
  year: number
  duration: number
  audio_path: string
  cover_path: string
  o3ics: string
  favorite: boolean
  play_count: number
  file_hash: string
  created_at?: string
  updated_at?: string
}

// API 统一响应格式
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}
