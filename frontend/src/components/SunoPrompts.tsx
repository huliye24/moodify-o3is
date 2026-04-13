import { useState } from 'react'
import { Copy, Check, Music, Shuffle } from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'
import type { DiceResult } from '@/types'

interface SunoPromptsProps {
  prompts: string[]
}

export function SunoPrompts({ prompts }: SunoPromptsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = async (prompt: string, index: number) => {
    await copyToClipboard(prompt)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  if (prompts.length === 0) return null

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Music className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold">Suno Prompt 建议</h3>
      </div>
      <div className="space-y-3">
        {prompts.map((prompt, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm flex-1">{prompt}</p>
              <button
                onClick={() => handleCopy(prompt, index)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors flex-shrink-0"
              >
                {copiedIndex === index ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface DiceResultCardProps {
  result: DiceResult
}

export function DiceResultCard({ result }: DiceResultCardProps) {
  if (!result.closing_style) return null

  return (
    <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
      <div className="flex items-center gap-2 mb-4">
        <Shuffle className="w-5 h-5 text-amber-600" />
        <h3 className="text-lg font-semibold">创作技巧</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white/60 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">结尾风格</div>
          <div className="font-medium">{result.closing_style}</div>
        </div>
        <div className="bg-white/60 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">转折点</div>
          <div className="font-medium">{result.turning_point}</div>
        </div>
        <div className="bg-white/60 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">叙事视角</div>
          <div className="font-medium">{result.perspective}</div>
        </div>
        <div className="bg-white/60 p-3 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">修辞手法</div>
          <div className="font-medium">{result.rhetoric}</div>
        </div>
        <div className="bg-white/60 p-3 rounded-lg md:col-span-2">
          <div className="text-xs text-gray-500 mb-1">句式变化</div>
          <div className="font-medium">{result.line_length_variation}</div>
        </div>
      </div>
    </div>
  )
}