// 响度控制组件

import React, { useState, useCallback } from 'react'
import { LOUDNESS_PRESETS } from '../processors/LoudnessProcessor'

interface LoudnessControlProps {
  enabled?: boolean
  targetLUFS?: number
  onEnabledChange?: (enabled: boolean) => void
  onTargetChange?: (targetLUFS: number) => void
  className?: string
}

export const LoudnessControl: React.FC<LoudnessControlProps> = ({
  enabled: initialEnabled = false,
  targetLUFS: initialTarget = -14,
  onEnabledChange,
  onTargetChange,
  className = '',
}) => {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [targetLUFS, setTargetLUFS] = useState(initialTarget)

  const handleEnabledChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnabled = e.target.checked
    setEnabled(newEnabled)
    onEnabledChange?.(newEnabled)
  }, [onEnabledChange])

  const handleTargetChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTarget = parseFloat(e.target.value)
    setTargetLUFS(newTarget)
    onTargetChange?.(newTarget)
  }, [onTargetChange])

  const handlePresetClick = useCallback((presetName: string) => {
    const preset = LOUDNESS_PRESETS[presetName]
    if (preset) {
      setEnabled(preset.enabled)
      setTargetLUFS(preset.targetLUFS)
      onEnabledChange?.(preset.enabled)
      onTargetChange?.(preset.targetLUFS)
    }
  }, [onEnabledChange, onTargetChange])

  return (
    <div
      className={`loudness-control ${className}`}
      style={{
        background: '#1a1a2e',
        borderRadius: '12px',
        padding: '16px',
        width: '100%',
        maxWidth: '400px',
      }}
    >
      {/* 标题和开关 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ margin: 0, color: '#e2e8f0', fontSize: '14px', fontWeight: 600 }}>
          响度归一化
        </h3>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={enabled}
            onChange={handleEnabledChange}
            style={{ marginRight: '8px', width: '16px', height: '16px' }}
          />
          <span style={{ color: '#9ca3af', fontSize: '12px' }}>
            {enabled ? '开启' : '关闭'}
          </span>
        </label>
      </div>

      {/* 预设选择 */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        {Object.entries(LOUDNESS_PRESETS).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => handlePresetClick(key)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: targetLUFS === preset.targetLUFS ? '#6366f1' : '#2d2d44',
              color: targetLUFS === preset.targetLUFS ? '#fff' : '#9ca3af',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {key === 'standard' && '标准'}
            {key === 'podcast' && '播客'}
            {key === 'broadcast' && '广播'}
            {key === 'quiet' && '安静'}
            <span style={{ opacity: 0.7, marginLeft: '4px' }}>
              {preset.targetLUFS} LUFS
            </span>
          </button>
        ))}
      </div>

      {/* 目标响度滑块 */}
      <div style={{ marginBottom: '12px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}
        >
          <span style={{ color: '#9ca3af', fontSize: '12px' }}>目标响度</span>
          <span style={{ color: '#6366f1', fontSize: '12px', fontWeight: 600 }}>
            {targetLUFS} LUFS
          </span>
        </div>
        <input
          type="range"
          min="-24"
          max="-10"
          step="0.5"
          value={targetLUFS}
          onChange={handleTargetChange}
          disabled={!enabled}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: enabled
              ? `linear-gradient(to right, #6366f1 0%, #6366f1 ${((targetLUFS + 24) / 14) * 100}%, #3f3f5a ${((targetLUFS + 24) / 14) * 100}%, #3f3f5a 100%)`
              : '#3f3f5a',
            WebkitAppearance: 'none',
            cursor: enabled ? 'pointer' : 'not-allowed',
            opacity: enabled ? 1 : 0.5,
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '4px',
          }}
        >
          <span style={{ color: '#6b7280', fontSize: '10px' }}>-24</span>
          <span style={{ color: '#6b7280', fontSize: '10px' }}>-10</span>
        </div>
      </div>

      {/* 说明 */}
      <div
        style={{
          background: '#16213e',
          borderRadius: '6px',
          padding: '12px',
          marginTop: '12px',
        }}
      >
        <p style={{ margin: 0, color: '#6b7280', fontSize: '11px', lineHeight: 1.5 }}>
          <strong style={{ color: '#9ca3af' }}>响度归一化</strong> 根据 EBU R128 标准调整音频响度，
          使不同音量的歌曲播放时音量一致。推荐使用 <strong style={{ color: '#9ca3af' }}>-14 LUFS</strong>（Spotify/YouTube 标准）
          或 <strong style={{ color: '#9ca3af' }}>-16 LUFS</strong>（播客标准）。
        </p>
      </div>
    </div>
  )
}

export default LoudnessControl
