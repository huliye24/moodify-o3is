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
}
