// LRC 歌词解析器

export interface LyricLine {
  time: number // 秒
  text: string
  translation?: string
}

export interface LrcData {
  title?: string
  artist?: string
  album?: string
  offset?: number
  lines: LyricLine[]
}

export function parseLRC(lrcContent: string): LrcData {
  const lines = lrcContent.split('\n')
  const result: LrcData = {
    lines: [],
  }

  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/
  const metadataRegex = /\[(ti|ar|al|offset|by):(.+)\]/

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue

    // 解析元数据
    const metadataMatch = trimmedLine.match(metadataRegex)
    if (metadataMatch) {
      const [, key, value] = metadataMatch
      switch (key) {
        case 'ti':
          result.title = value.trim()
          break
        case 'ar':
          result.artist = value.trim()
          break
        case 'al':
          result.album = value.trim()
          break
        case 'offset':
          result.offset = parseInt(value, 10)
          break
      }
      continue
    }

    // 解析时间标签
    let match = trimmedLine.match(timeRegex)
    let remainingText = trimmedLine

    while (match) {
      const fullMatch = match[0]
      const minutes = parseInt(match[1], 10)
      const seconds = parseInt(match[2], 10)
      const milliseconds = match[3]
        ? parseInt(match[3].padEnd(3, '0'), 10)
        : 0

      const time = minutes * 60 + seconds + milliseconds / 1000

      remainingText = remainingText.replace(fullMatch, '').trim()

      // 处理翻译行
      let text = remainingText
      let translation: string | undefined

      if (remainingText.includes('[') && remainingText.includes(']')) {
        // 可能包含翻译
        const parts = remainingText.split(/\[|\]/).filter(Boolean)
        text = parts[0]?.trim() || ''
        translation = parts[1]?.trim()
      }

      if (text) {
        result.lines.push({
          time,
          text,
          translation,
        })
      }

      // 查找下一个时间标签
      remainingText = remainingText.replace(timeRegex, '')
      match = remainingText.match(timeRegex)
    }
  }

  // 按时间排序
  result.lines.sort((a, b) => a.time - b.time)

  return result
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function getCurrentLineIndex(
  currentTime: number,
  lines: LyricLine[]
): number {
  if (!lines || lines.length === 0) return -1

  let index = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].time <= currentTime) {
      index = i
    } else {
      break
    }
  }
  return index
}

export function generateMockLRC(): LrcData {
  return {
    title: 'AI Generated Song',
    artist: 'Suno AI',
    lines: [
      { time: 0, text: '♪ 音乐开始 ♪' },
      { time: 5, text: '在深夜的寂静里' },
      { time: 10, text: '思绪如星光闪烁' },
      { time: 15, text: '回忆像潮水涌动' },
      { time: 20, text: '带走了所有的伤痛' },
      { time: 25, text: '黎明终会到来' },
      { time: 30, text: '照亮黑暗的角落' },
      { time: 35, text: '让希望在心中萌芽' },
      { time: 40, text: '♪ 间奏 ♪' },
      { time: 50, text: '时间缓缓流逝' },
      { time: 55, text: '故事还在继续' },
      { time: 60, text: '每一刻都值得珍惜' },
      { time: 65, text: '因为这就是人生' },
      { time: 70, text: '♪ 结尾 ♪' },
    ],
  }
}
