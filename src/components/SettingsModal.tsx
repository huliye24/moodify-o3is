import { useState, useEffect } from 'react'
import { X, Key, Eye, EyeOff, Check, AlertCircle } from 'lucide-react'
import { useStore } from '../stores/useStore'

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { apiKey, initialize } = useStore()
  const [apiKeyInput, setApiKeyInput] = useState(apiKey || '')
  const [showKey, setShowKey] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadKey = async () => {
      const key = await window.api.settings.get('deepseekApiKey')
      setApiKeyInput(key || '')
    }
    loadKey()
  }, [])

  const handleSave = async () => {
    setError('')
    if (!apiKeyInput.trim()) {
      setError('请输入有效的 API Key')
      return
    }

    if (!apiKeyInput.startsWith('sk-')) {
      setError('DeepSeek API Key 格式不正确，应以 sk- 开头')
      return
    }

    try {
      await window.api.settings.set('deepseekApiKey', apiKeyInput.trim())
      setIsSaved(true)
      await initialize()
      setTimeout(() => {
        setIsSaved(false)
      }, 2000)
    } catch (err) {
      setError('保存失败，请重试')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-dark-300 rounded-xl w-full max-w-md border border-gray-700 shadow-2xl">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">设置</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* API Key 设置 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" />
              DeepSeek API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="请输入您的 DeepSeek API Key"
                className="input-field pr-10"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              请前往 DeepSeek 官网申请 API Key：
              <a
                href="https://platform.deepseek.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:underline ml-1"
              >
                platform.deepseek.com
              </a>
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-600/20 border border-red-600/30 rounded-lg px-4 py-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-200">{error}</span>
            </div>
          )}

          {/* 保存成功提示 */}
          {isSaved && (
            <div className="bg-green-600/20 border border-green-600/30 rounded-lg px-4 py-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-sm text-green-200">保存成功</span>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-700">
          <button onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            <Check className="w-4 h-4" />
            保存
          </button>
        </div>
      </div>
    </div>
  )
}