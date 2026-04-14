// 任务状态组件 - 显示 Suno 生成状态

import React from 'react'
import { SunoTaskStatus } from '../types'

interface TaskStatusProps {
  status: SunoTaskStatus
  progress?: number
  message?: string
  className?: string
}

// 状态配置
const STATUS_CONFIG: Record<SunoTaskStatus, {
  label: string
  color: string
  bgColor: string
  icon: string
}> = {
  [SunoTaskStatus.PENDING]: {
    label: '等待中',
    color: '#9ca3af',
    bgColor: 'rgba(156, 163, 175, 0.15)',
    icon: '⏳',
  },
  [SunoTaskStatus.SUBMITTED]: {
    label: '已提交',
    color: '#60a5fa',
    bgColor: 'rgba(96, 165, 250, 0.15)',
    icon: '📤',
  },
  [SunoTaskStatus.QUEUED]: {
    label: '排队中',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: '📋',
  },
  [SunoTaskStatus.IN_PROGRESS]: {
    label: '生成中',
    color: '#a78bfa',
    bgColor: 'rgba(167, 139, 250, 0.15)',
    icon: '🎵',
  },
  [SunoTaskStatus.SUCCESS]: {
    label: '完成',
    color: '#34d399',
    bgColor: 'rgba(52, 211, 153, 0.15)',
    icon: '✅',
  },
  [SunoTaskStatus.FAILURE]: {
    label: '失败',
    color: '#f87171',
    bgColor: 'rgba(248, 113, 113, 0.15)',
    icon: '❌',
  },
}

export const TaskStatus: React.FC<TaskStatusProps> = ({
  status,
  progress,
  message,
  className = '',
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG[SunoTaskStatus.PENDING]
  const displayProgress = progress ?? getProgressFromStatus(status)

  return (
    <div
      className={`task-status ${className}`}
      style={{
        background: config.bgColor,
        borderRadius: '12px',
        padding: '16px',
        border: `1px solid ${config.color}30`,
      }}
    >
      {/* 状态头部 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: displayProgress > 0 ? '12px' : 0,
      }}>
        <span style={{ fontSize: '20px' }}>{config.icon}</span>
        <div>
          <div style={{
            color: config.color,
            fontSize: '14px',
            fontWeight: 600,
          }}>
            {config.label}
          </div>
          {message && (
            <div style={{
              color: '#9ca3af',
              fontSize: '12px',
              marginTop: '2px',
            }}>
              {message}
            </div>
          )}
        </div>
      </div>

      {/* 进度条 */}
      {displayProgress > 0 && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '6px',
          }}>
            <span style={{ color: '#9ca3af', fontSize: '11px' }}>生成进度</span>
            <span style={{ color: config.color, fontSize: '11px', fontWeight: 500 }}>
              {displayProgress}%
            </span>
          </div>
          <div style={{
            height: '6px',
            background: '#1a1a2e',
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${displayProgress}%`,
              background: `linear-gradient(90deg, ${config.color}80, ${config.color})`,
              borderRadius: '3px',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      )}
    </div>
  )
}

// 简化版进度条
interface ProgressBarProps {
  progress: number
  color?: string
  showLabel?: boolean
  height?: number
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = '#6366f1',
  showLabel = true,
  height = 6,
  className = '',
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress))

  return (
    <div
      className={`progress-bar ${className}`}
      style={{ width: '100%' }}
    >
      {showLabel && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '4px',
        }}>
          <span style={{ color: '#9ca3af', fontSize: '11px' }}>进度</span>
          <span style={{ color, fontSize: '11px', fontWeight: 500 }}>
            {clampedProgress}%
          </span>
        </div>
      )}
      <div style={{
        height: `${height}px`,
        background: '#1a1a2e',
        borderRadius: `${height / 2}px`,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${clampedProgress}%`,
          background: `linear-gradient(90deg, ${color}80, ${color})`,
          borderRadius: `${height / 2}px`,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  )
}

// 根据状态获取进度
function getProgressFromStatus(status: SunoTaskStatus): number {
  switch (status) {
    case SunoTaskStatus.PENDING:
      return 0
    case SunoTaskStatus.SUBMITTED:
      return 10
    case SunoTaskStatus.QUEUED:
      return 25
    case SunoTaskStatus.IN_PROGRESS:
      return 50
    case SunoTaskStatus.SUCCESS:
      return 100
    case SunoTaskStatus.FAILURE:
      return 100
    default:
      return 0
  }
}

export default TaskStatus
