import { useState } from 'react'
import { Copy, Heart, Trash2, Edit2, Save, X } from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'
import type { O3ics } from '@/types'

interface LyricsEditorProps {
  content: string
  onChange: (content: string) => void
  isEditing?: boolean
  onSave?: (content: string) => void
  onCancel?: () => void
}

export function LyricsEditor({ content, onChange, isEditing, onSave, onCancel }: LyricsEditorProps) {
  const [copied, setCopied] = useState(false)
  const [localContent, setLocalContent] = useState(content)

  const handleCopy = async () => {
    await copyToClipboard(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    onSave?.(localContent)
  }

  const handleCancel = () => {
    setLocalContent(content)
    onCancel?.()
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">生成的歌词</h3>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="btn btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                保存
              </button>
              <button onClick={handleCancel} className="btn btn-secondary flex items-center gap-2">
                <X className="w-4 h-4" />
                取消
              </button>
            </>
          ) : (
            <button onClick={handleCopy} className="btn btn-primary flex items-center gap-2">
              <Copy className="w-4 h-4" />
              {copied ? '已复制' : '复制歌词'}
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={localContent}
          onChange={(e) => setLocalContent(e.target.value)}
          className="input min-h-[400px] font-mono text-sm"
          placeholder="编辑歌词..."
        />
      ) : (
        <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg min-h-[200px]">
          {content || '生成的歌词将显示在这里...'}
        </div>
      )}
    </div>
  )
}

interface O3icsListProps {
  items: O3ics[]
  onSelect: (item: O3ics) => void
  onDelete: (id: string) => Promise<void>
  onToggleFavorite: (id: string) => Promise<void>
}

export function O3icsList({ items, onSelect, onDelete, onToggleFavorite }: O3icsListProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">歌词历史</h3>
      {items.length === 0 ? (
        <div className="card text-center text-gray-500 py-8">
          暂无歌词记录
        </div>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className="card cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onSelect(item)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium mb-1">{item.title || '无标题'}</h4>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{item.content}</p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded">
                    {item.emotion}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                    {item.style}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                    {item.theme}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 ml-4">
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.id) }}
                  className={`p-2 rounded-lg transition-colors ${
                    item.favorite ? 'text-red-500 bg-red-50' : 'hover:bg-gray-100'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${item.favorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}