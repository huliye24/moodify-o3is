import { useState } from 'react'
import {
  Volume2,
  VolumeX
} from 'lucide-react'

export default function Player() {
  const [volume, setVolume] = useState(60)
  const [isMuted, setIsMuted] = useState(false)

  return (
    <div className="bg-dark-400 border-t border-gray-800 px-4 py-3">
      <div className="flex items-center gap-4">
        {/* 当前状态 */}
        <div className="flex-1">
          <span className="text-sm text-gray-500">
            配置 DeepSeek API Key 后开始生成歌词
          </span>
        </div>

        {/* 播放控制 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value))
              setIsMuted(false)
            }}
            className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
        </div>
      </div>
    </div>
  )
}
