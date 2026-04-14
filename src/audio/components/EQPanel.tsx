// 参数均衡器面板组件

import React, { useState, useCallback } from 'react'
import { EQ_PRESETS, DEFAULT_EQ_BANDS } from '../processors/EQProcessor'

interface EQPanelProps {
  onGainChange?: (bandIndex: number, gain: number) => void
  onPresetChange?: (presetName: string) => void
  currentPreset?: string
  gains?: number[]
  className?: string
}

export const EQPanel: React.FC<EQPanelProps> = ({
  onGainChange,
  onPresetChange,
  currentPreset = 'flat',
  gains = [0, 0, 0, 0, 0, 0, 0],
  className = '',
}) => {
  const [activePreset, setActivePreset] = useState(currentPreset)
  const [localGains, setLocalGains] = useState<number[]>(gains)
  const [isEnabled, setIsEnabled] = useState(true)

  const handlePresetSelect = useCallback(
    (presetName: string) => {
      setActivePreset(presetName)
      const preset = EQ_PRESETS[presetName]
      if (preset) {
        setLocalGains(preset.bands)
        onPresetChange?.(presetName)
      }
    },
    [onPresetChange]
  )

  const handleSliderChange = useCallback(
    (bandIndex: number, value: number) => {
      const newGains = [...localGains]
      newGains[bandIndex] = value
      setLocalGains(newGains)
      setActivePreset('')
      onGainChange?.(bandIndex, value)
    },
    [localGains, onGainChange]
  )

  const handleReset = useCallback(() => {
    setActivePreset('flat')
    setLocalGains([0, 0, 0, 0, 0, 0, 0])
    onPresetChange?.('flat')
  }, [onPresetChange])

  const getSliderBackground = (gain: number): string => {
    const percentage = ((gain + 12) / 24) * 100
    return `linear-gradient(to right, #6366f1 0%, #6366f1 ${percentage}%, #3f3f5a ${percentage}%, #3f3f5a 100%)`
  }

  return (
    <div
      className={`eq-panel ${className}`}
      style={{
        background: '#1a1a2e',
        borderRadius: '12px',
        padding: '16px',
        width: '100%',
        maxWidth: '600px',
      }}
    >
      {/* 头部 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ margin: 0, color: '#e2e8f0', fontSize: '14px', fontWeight: 600 }}>
          参数均衡器
        </h3>
        <button
          onClick={() => setIsEnabled(!isEnabled)}
          style={{
            padding: '4px 12px',
            borderRadius: '6px',
            border: 'none',
            background: isEnabled ? '#6366f1' : '#3f3f5a',
            color: isEnabled ? '#fff' : '#9ca3af',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          {isEnabled ? '开启' : '关闭'}
        </button>
      </div>

      {/* 预设选择 */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        {Object.entries(EQ_PRESETS).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => handlePresetSelect(key)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: activePreset === key ? '#6366f1' : '#2d2d44',
              color: activePreset === key ? '#fff' : '#9ca3af',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* EQ 滑块 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '8px',
          padding: '0 8px',
        }}
      >
        {DEFAULT_EQ_BANDS.map((band, index) => {
          const gain = localGains[index] ?? 0
          return (
            <div
              key={band.frequency}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
              }}
            >
              {/* 增益值 */}
              <span
                style={{
                  color: '#9ca3af',
                  fontSize: '10px',
                  marginBottom: '4px',
                }}
              >
                {gain > 0 ? `+${gain}` : gain}dB
              </span>

              {/* 滑块容器 */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {/* 中心线 */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: '#4b5563',
                    zIndex: 0,
                  }}
                />

                {/* 垂直滑块 */}
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.5"
                  value={gain}
                  onChange={(e) => handleSliderChange(index, parseFloat(e.target.value))}
                  disabled={!isEnabled}
                  style={{
                    WebkitAppearance: 'none',
                    width: '120px',
                    height: '6px',
                    background: getSliderBackground(gain),
                    borderRadius: '3px',
                    outline: 'none',
                    transform: 'rotate(-90deg)',
                    marginTop: '60px',
                    cursor: isEnabled ? 'pointer' : 'not-allowed',
                    opacity: isEnabled ? 1 : 0.5,
                  }}
                />
              </div>

              {/* 频率标签 */}
              <span
                style={{
                  color: '#6b7280',
                  fontSize: '10px',
                  marginTop: '8px',
                }}
              >
                {band.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* 重置按钮 */}
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <button
          onClick={handleReset}
          style={{
            padding: '6px 16px',
            borderRadius: '6px',
            border: '1px solid #4b5563',
            background: 'transparent',
            color: '#9ca3af',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          重置
        </button>
      </div>
    </div>
  )
}

export default EQPanel
