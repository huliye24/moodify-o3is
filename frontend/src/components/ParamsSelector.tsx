import type { Options, GenerateParams } from '@/types'

interface ParamsSelectorProps {
  options: Options
  params: GenerateParams
  onChange: (params: GenerateParams) => void
}

export function ParamsSelector({ options, params, onChange }: ParamsSelectorProps) {
  const handleChange = (key: keyof GenerateParams, value: string) => {
    onChange({ ...params, [key]: value })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">情感基调</label>
        <select
          value={params.emotion}
          onChange={(e) => handleChange('emotion', e.target.value)}
          className="select"
        >
          {options.emotions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">歌曲主题</label>
        <select
          value={params.theme}
          onChange={(e) => handleChange('theme', e.target.value)}
          className="select"
        >
          {options.themes.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">歌词风格</label>
        <select
          value={params.style}
          onChange={(e) => handleChange('style', e.target.value)}
          className="select"
        >
          {options.styles.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">韵律格式</label>
        <select
          value={params.rhyme}
          onChange={(e) => handleChange('rhyme', e.target.value)}
          className="select"
        >
          {options.rhymes.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">歌曲长度</label>
        <select
          value={params.length}
          onChange={(e) => handleChange('length', e.target.value)}
          className="select"
        >
          {options.lengths.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  )
}