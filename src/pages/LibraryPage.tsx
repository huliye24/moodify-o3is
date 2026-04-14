// 本地音乐库页面（方案C：文件系统 + SQLite 索引）
import { useEffect } from 'react'
import { useLibraryStore } from '../stores/useLibraryStore'
import FileSystemView from './library/FileSystemView'

export default function LibraryPage() {
  const { loadSongs, loadPlaylists } = useLibraryStore()

  useEffect(() => {
    loadSongs()
    loadPlaylists()
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* 视图区域 */}
      <div className="flex-1 overflow-hidden">
        <FileSystemView />
      </div>
    </div>
  )
}
