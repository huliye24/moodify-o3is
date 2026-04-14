// Prompt 卡片组件 - 展示 AI 生成信息

import React, { useState, useCallback } from 'react'

interface PromptCardProps {
  prompt: string
  title?: string
  model?: string
  duration?: string
  hasVocal?: boolean
  onCopy?: () => void
  onEdit?: () => void
  className?: string
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  title,
  model = 'chirp-v4-0',
  duration,
  hasVocal = true,
  onCopy,
  onEdit,
  className = '',
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      onCopy?.()
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [prompt, onCopy])

  // 格式化 Prompt 显示
  const formatPrompt = (text: string): React.ReactNode[] => {
    return text.split(',').map((part, index) => (
      <span
        key={index}
        style={{
          background: 'rgba(99, 102, 241, 0.15)',
          padding: '2px 8px',
          borderRadius: '4px',
          marginRight: '6px',
          marginBottom: '4px',
          display: 'inline-block',
          color: '#a5b4fc',
          fontSize: '13px',
        }}
      >
        {part.trim()}
      </span>
    ))
  }

  return (
    <div
      className={`prompt-card ${className}`}
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(99, 102, 241, 0.2)',
      }}
    >
      {/* 标题 */}
      {title && (
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{
            margin: 0,
            color: '#e2e8f0',
            fontSize: '16px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>📝</span>
            {title}
          </h3>
        </div>
      )}

      {/* Prompt 内容 */}
      <div
        style={{
          background: '#0f0f1a',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
        }}
      >
        <div style={{
          color: '#e2e8f0',
          fontSize: '14px',
          lineHeight: 1.8,
        }}>
          {formatPrompt(prompt)}
        </div>
      </div>

      {/* 操作按钮 */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
      }}>
        <button
          onClick={handleCopy}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: copied ? '#10b981' : '#6366f1',
            color: '#fff',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s',
          }}
        >
          {copied ? '✓' : '📋'} {copied ? '已复制' : '复制'}
        </button>
        {onEdit && (
          <button
            onClick={onEdit}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #4b5563',
              background: 'transparent',
              color: '#9ca3af',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ✏️ 编辑
          </button>
        )}
      </div>

      {/* 参数信息 */}
      <div style={{
        display: 'flex',
        gap: '16px',
        padding: '12px 16px',
        background: 'rgba(99, 102, 241, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(99, 102, 241, 0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#6b7280', fontSize: '12px' }}>🎛️ 模型</span>
          <span style={{ color: '#a5b4fc', fontSize: '12px', fontWeight: 500 }}>
            {model}
          </span>
        </div>
        {duration && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#6b7280', fontSize: '12px' }}>⏱️ 时长</span>
            <span style={{ color: '#a5b4fc', fontSize: '12px', fontWeight: 500 }}>
              {duration}
            </span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#6b7280', fontSize: '12px' }}>🎤 语声</span>
          <span style={{ color: hasVocal ? '#10b981' : '#6b7280', fontSize: '12px', fontWeight: 500 }}>
            {hasVocal ? '✓' : '无'}
          </span>
        </div>
      </div>
    </div>
  )
}

// 简化版 Prompt 标签
interface PromptTagProps {
  text: string
  onClick?: () => void
}

export const PromptTag: React.FC<PromptTagProps> = ({ text, onClick }) => {
  return (
    <span
      onClick={onClick}
      style={{
        background: 'rgba(99, 102, 241, 0.15)',
        padding: '4px 10px',
        borderRadius: '6px',
        color: '#a5b4fc',
        fontSize: '12px',
        cursor: onClick ? 'pointer' : 'default',
        display: 'inline-block',
        marginRight: '6px',
        marginBottom: '4px',
      }}
    >
      {text}
    </span>
  )
}

export default PromptCard
