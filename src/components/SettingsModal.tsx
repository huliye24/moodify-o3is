import { useState, useEffect } from 'react'
import { X, Key, Check, AlertCircle } from 'lucide-react'
import { useStore } from '../stores/useStore'

interface SettingsModalProps {
  onClose: () => void
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { apiKey, setApiKey } = useStore()
  const [localKey, setLocalKey] = useState(apiKey || '')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLocalKey(apiKey || '')
  }, [apiKey])

  const handleSave = () => {
    if (!localKey.trim()) {
      setError('请输入 API Key')
      return
    }
    setApiKey(localKey.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-dark-300 rounded-xl w-full max-w-md border border-gray-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="font-semibold">设置</h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-200 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" />
              DeepSeek API Key
            </label>
            <input
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="sk-xxxxxxxxxxxxxxxx"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              请从 DeepSeek 开放平台获取 API Key
            </p>
          </div>

          {error && (
            <div className="bg-red-600/20 border border-red-600/30 rounded-lg px-4 py-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-200">{error}</span>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-700 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary px-4 py-2">
            取消
          </button>
          <button onClick={handleSave} className="btn-primary px-4 py-2 flex items-center gap-2">
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                已保存
              </>
            ) : (
              '保存'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
