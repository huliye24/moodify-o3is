// 情感标签组件

import React from 'react'
import { EmotionType } from '../types'

interface EmotionDisplayProps {
  emotion: EmotionType
  intensity: number
  tags?: string[]
  onTagClick?: (tag: string) => void
  className?: string
}

// 情感配置
const EMOTION_CONFIG: Record<EmotionType, {
  label: string
  icon: string
  color: string
  bgColor: string
  description: string
}> = {
  coil: {
    label: '蜷缩',
    icon: '🌙',
    color: '#818cf8',    // indigo-400
    bgColor: 'rgba(129, 140, 248, 0.15)',
    description: '悲伤/低沉',
  },
  lost: {
    label: '迷茫',
    icon: '🌫️',
    color: '#a78bfa',    // violet-400
    bgColor: 'rgba(167, 139, 250, 0.15)',
    description: '困惑/焦虑',
  },
  awaken: {
    label: '觉醒',
    icon: '✨',
    color: '#fbbf24',    // amber-400
    bgColor: 'rgba(251, 191, 36, 0.15)',
    description: '希望/振奋',
  },
  expand: {
    label: '舒展',
    icon: '🌊',
    color: '#34d399',    // emerald-400
    bgColor: 'rgba(52, 211, 153, 0.15)',
    description: '平静/释放',
  },
}

export const EmotionDisplay: React.FC<EmotionDisplayProps> = ({
  emotion,
  intensity,
  tags = [],
  onTagClick,
  className = '',
}) => {
  const config = EMOTION_CONFIG[emotion] || EMOTION_CONFIG.expand
  const intensityPercent = Math.round(intensity * 100)

  return (
    <div
      className={`emotion-display ${className}`}
      style={{
        background: config.bgColor,
        borderRadius: '12px',
        padding: '16px',
        border: `1px solid ${config.color}30`,
      }}
    >
      {/* 主情感显示 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <span style={{ fontSize: '28px' }}>{config.icon}</span>
        <div>
          <div style={{
            color: '#e2e8f0',
            fontSize: '16px',
            fontWeight: 600,
          }}>
            {config.label}
          </div>
          <div style={{
            color: config.color,
            fontSize: '12px',
          }}>
            {config.description}
          </div>
        </div>
      </div>

      {/* 强度进度条 */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '6px',
        }}>
          <span style={{ color: '#9ca3af', fontSize: '12px' }}>情感强度</span>
          <span style={{ color: config.color, fontSize: '12px', fontWeight: 600 }}>
            {intensityPercent}%
          </span>
        </div>
        <div style={{
          height: '8px',
          background: '#1a1a2e',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${intensityPercent}%`,
            background: `linear-gradient(90deg, ${config.color}80, ${config.color})`,
            borderRadius: '4px',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* 标签 */}
      {tags.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
        }}>
          {tags.map((tag, index) => (
            <span
              key={index}
              onClick={() => onTagClick?.(tag)}
              style={{
                background: '#1a1a2e',
                padding: '4px 10px',
                borderRadius: '12px',
                color: '#9ca3af',
                fontSize: '11px',
                cursor: onTagClick ? 'pointer' : 'default',
                transition: 'all 0.2s',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// 情感选择器
interface EmotionSelectorProps {
  value: EmotionType
  onChange: (emotion: EmotionType) => void
  className?: string
}

export const EmotionSelector: React.FC<EmotionSelectorProps> = ({
  value,
  onChange,
  className = '',
}) => {
  return (
    <div
      className={`emotion-selector ${className}`}
      style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      {(Object.keys(EMOTION_CONFIG) as EmotionType[]).map((emotion) => {
        const config = EMOTION_CONFIG[emotion]
        const isActive = value === emotion

        return (
          <button
            key={emotion}
            onClick={() => onChange(emotion)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: isActive ? `2px solid ${config.color}` : '2px solid transparent',
              background: isActive ? config.bgColor : '#1a1a2e',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minWidth: '80px',
            }}
          >
            <span style={{ fontSize: '24px' }}>{config.icon}</span>
            <span style={{
              color: isActive ? config.color : '#9ca3af',
              fontSize: '13px',
              fontWeight: isActive ? 600 : 400,
            }}>
              {config.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// 情感进度条（简化版）
interface EmotionBarProps {
  type: EmotionType
  intensity: number
  className?: string
}

export const EmotionBar: React.FC<EmotionBarProps> = ({
  type,
  intensity,
  className = '',
}) => {
  const config = EMOTION_CONFIG[type] || EMOTION_CONFIG.expand
  const intensityPercent = Math.round(intensity * 100)

  return (
    <div
      className={`emotion-bar ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span style={{ fontSize: '14px' }}>{config.icon}</span>
      <div style={{
        flex: 1,
        height: '6px',
        background: '#1a1a2e',
        borderRadius: '3px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${intensityPercent}%`,
          background: config.color,
          borderRadius: '3px',
        }} />
      </div>
      <span style={{
        color: config.color,
        fontSize: '11px',
        fontWeight: 500,
        minWidth: '36px',
        textAlign: 'right',
      }}>
        {intensityPercent}%
      </span>
    </div>
  )
}

export default EmotionDisplay
