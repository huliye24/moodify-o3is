# Moodify AI 播放器 - 12 小时开发计划

> 目标：完成 AI 音乐播放器核心功能
> 范围：基于现有 Moodify 项目，构建 AI 音乐播放能力
> 日期：2026-04-14

---

## 概览

| 阶段 | 时长 | 目标 |
|------|------|------|
| **Phase 1: 音频引擎** | 3.5 小时 | FFmpeg WASM + AudioContext 音频图 |
| **Phase 2: DSP 功能** | 3 小时 | EQ + 响度归一化 + 歌词同步 |
| **Phase 3: AI 集成** | 3.5 小时 | Suno API + Prompt 展示 + 情感标签 |
| **Phase 4: 测试优化** | 2 小时 | 功能测试 + 性能优化 |

---

## 阶段 1: 音频引擎 (3.5 小时)

### Hour 1-1.5: 项目初始化

```
目标: 搭建音频引擎基础架构
```

| 时间 | 任务 | 交付物 | 状态 |
|------|------|--------|------|
| 30min | 创建 `src/audio/` 目录结构 | 目录骨架 | ⬜ |
| 30min | 集成 FFmpeg WASM (`@ffmpeg/ffmpeg`) | 依赖安装 | ⬜ |
| 30min | 创建 `AudioEngine` 类骨架 | `AudioEngine.ts` | ⬜ |

**文件结构**:
```
src/audio/
├── AudioEngine.ts       # 主引擎类
├── decoders/
│   ├── Decoder.ts      # 解码器抽象
│   └── FFmpegDecoder.ts # FFmpeg WASM 实现
├── players/
│   └── WebAudioPlayer.ts # WebAudio 播放器
└── types.ts           # 类型定义
```

### Hour 1.5-2.5: WebAudio 音频图

```
目标: 建立音频处理管线
```

| 时间 | 任务 | 交付物 | 状态 |
|------|------|--------|------|
| 30min | 创建 `AudioContext` 管理器 | `AudioContextManager.ts` | ⬜ |
| 30min | 实现音频节点连接 | 音频图连接逻辑 | ⬜ |
| 30min | 基础播放控制 (play/pause/seek) | 播放控制 API | ⬜ |
| 30min | 进度同步与时间更新 | 时间事件处理 | ⬜ |

**核心代码结构**:
```typescript
class AudioEngine {
  private context: AudioContext
  private sourceNode: MediaElementAudioSourceNode
  private gainNode: GainNode
  private analyserNode: AnalyserNode

  async load(url: string): Promise<void>
  play(): void
  pause(): void
  seek(time: number): void
  setVolume(volume: number): void
  connectNodes(): void
}
```

### Hour 2.5-3.5: 音频可视化

```
目标: 添加波形可视化支持
```

| 时间 | 任务 | 交付物 | 状态 |
|------|------|--------|------|
| 30min | 集成 AnalyserNode | 频谱数据 | ⬜ |
| 30min | 创建波形可视化 Hook | `useWaveform.ts` | ⬜ |
| 30min | 创建 Canvas 渲染组件 | `WaveformCanvas.tsx` | ⬜ |

**验收标准**:
- [ ] 音频加载时间 < 2 秒
- [ ] 播放/暂停响应 < 100ms
- [ ] 波形渲染 60fps

---

## 阶段 2: DSP 功能 (3 小时)

### Hour 3.5-4.5: 参数均衡器

```
目标: 实现 7-band 参数均衡器
```

| 时间 | 任务 | 交付物 | 状态 |
|------|------|--------|------|
| 30min | 创建 EQ BiquadFilter 节点链 | 7 个 BiquadFilter | ⬜ |
| 30min | 定义频段配置 (60Hz-16kHz) | 频率表 | ⬜ |
| 30min | 创建 EQ 控制面板 UI | EQPanel.tsx | ⬜ |
| 30min | 预设系统 (流行/古典/摇滚/爵士) | Presets 配置 | ⬜ |

**EQ 频段配置**:
```typescript
const EQ_BANDS = [
  { frequency: 60, label: '60Hz', type: 'lowshelf' },
  { frequency: 170, label: '170Hz', type: 'peaking' },
  { frequency: 310, label: '310Hz', type: 'peaking' },
  { frequency: 600, label: '600Hz', type: 'peaking' },
  { frequency: 3000, label: '3kHz', type: 'peaking' },
  { frequency: 6000, label: '6kHz', type: 'peaking' },
  { frequency: 12000, label: '12kHz', type: 'highshelf' },
]
```

### Hour 4.5-5.5: 响度归一化

```
目标: 实现 EBU R128 响度控制
```

| 时间 | 任务 | 交付物 | 状态 |
|------|------|--------|------|
| 30min | 创建 LoudnessNode 包装器 | `LoudnessProcessor.ts` | ⬜ |
| 30min | 实现 GainNode 动态调整 | 响度计算逻辑 | ⬜ |
| 30min | 添加预设响度级别 (-14/-16/-24 LUFS) | LoudnessPresets | ⬜ |
| 30min | UI 开关与级别选择 | LoudnessControl.tsx | ⬜ |

### Hour 5.5-6.5: 歌词同步

```
目标: LRC 解析与同步显示
```

| 时间 | 任务 | 交付物 | 状态 |
|------|------|--------|------|
| 30min | LRC 时间戳解析器 | `LrcParser.ts` | ⬜ |
| 30min | 歌词状态管理 | `useLyrics.ts` | ⬜ |
| 30min | 歌词显示组件 (当前行高亮) | LyricsView.tsx | ⬜ |
| 30min | 歌词自动滚动逻辑 | ScrollSync | ⬜ |

**验收标准**:
- [ ] EQ 调节实时生效
- [ ] 响度归一化无明显削波
- [ ] 歌词同步延迟 < 50ms

---

## 阶段 3: AI 集成 (3.5 小时)

### Hour 6.5-7.5: Suno API 深度集成

```
目标: 完整 Suno 音乐生成与播放流程
```

| 时间 | 任务 | 交付物 | 状态 |
|------|------|--------|------|
| 30min | 创建 `useSunoPlayer.ts` Hook | Suno 播放逻辑 | ⬜ |
| 30min | 状态轮询组件 | TaskStatus.tsx | ⬜ |
| 30min | 生成进度显示 | ProgressBar.tsx | ⬜ |
| 30min | 完成后自动添加到播放列表 | AutoQueue | ⬜ |

**SunoPlayer 状态机**:
```
IDLE → GENERATING → POLLING → READY → PLAYING
                ↓
             FAILED
```

### Hour 7.5-8.5: Prompt 可视化

```
目标: 展示 AI 生成 Prompt
```

| 时间 | 任务 | 交付物 | 状态 |
|------|------|--------|------|
| 30min | 创建 PromptCard 组件 | PromptCard.tsx | ⬜ |
| 30min | 语法高亮显示 | 格式化渲染 | ⬜ |
| 30min | 复制/编辑功能 | 操作按钮 | ⬜ |
| 30min | 生成参数展示 | ModelVersion/Duration | ⬜ |

**UI 结构**:
```
┌────────────────────────────────────────┐
│ 📝 生成 Prompt              [复制][编辑]│
├────────────────────────────────────────┤
│ Dream pop, Female vocal intimate,      │
│ 70 BPM, Soft piano, Rain ambience...   │
├────────────────────────────────────────┤
│ 🎛️ 参数: chirp-v4-0 | 2:45 | 语声 ✓  │
└────────────────────────────────────────┘
```

### Hour 8.5-10: 情感标签与推荐

```
目标: AI 音乐情感系统
```

| 时间 | 任务 | 交付物 | 状态 |
|------|------|--------|------|
| 30min | 定义情感类型枚举 | EmotionType | ⬜ |
| 30min | 创建 EmotionTag 组件 | 情感标签显示 | ⬜ |
| 30min | 情感进度条组件 | EmotionBar.tsx | ⬜ |
| 30min | 情感预设 EQ 映射 | EmotionEQ Presets | ⬜ |
| 30min | 相似歌曲推荐逻辑 | `useRecommendations.ts` | ⬜ |

**情感类型定义**:
```typescript
type EmotionType =
  | 'coil'      // 蜷缩 - 悲伤/低沉
  | 'lost'      // 迷茫 - 困惑/焦虑
  | 'awaken'    // 觉醒 - 希望/振奋
  | 'expand'    // 舒展 - 平静/释放

interface EmotionData {
  type: EmotionType
  intensity: number      // 0-1
  tags: string[]        // ['melancholic', 'nostalgic']
  recommendedEQ: EQPreset
}
```

**验收标准**:
- [ ] Suno 任务可完整提交和轮询
- [ ] Prompt 正确显示和复制
- [ ] 情感标签正确分类

---

## 阶段 4: 测试与优化 (2 小时)

### Hour 10-10.5: 功能测试

```
目标: 核心功能回归测试
```

| 时间 | 任务 | 检查点 | 状态 |
|------|------|--------|------|
| 10min | 播放控制测试 | play/pause/seek/volume | ⬜ |
| 10min | EQ 测试 | 各频段调节 | ⬜ |
| 10min | 响度测试 | 不同音量源 | ⬜ |
| 10min | 歌词测试 | LRC 解析/同步 | ⬜ |
| 10min | Suno 集成测试 | 提交/轮询/播放 | ⬜ |

### Hour 10.5-11.5: 性能优化

```
目标: 达成性能指标
```

| 时间 | 任务 | 目标 | 状态 |
|------|------|------|------|
| 20min | 内存泄漏检查 | 无持续增长 | ⬜ |
| 20min | 首屏加载优化 | < 3s | ⬜ |
| 20min | 音频切换优化 | < 200ms | ⬜ |
| 20min | 波形渲染优化 | 60fps 稳定 | ⬜ |

### Hour 11.5-12: 清理与文档

```
目标: 交付就绪
```

| 时间 | 任务 | 状态 |
|------|------|------|
| 15min | 代码格式化与 lint | ⬜ |
| 15min | README 更新 | ⬜ |
| 15min | 提交代码 | ⬜ |
| 15min | 功能演示 | ⬜ |

---

## 时间分配总览

```
Hour 1   [████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 项目初始化
Hour 2   [████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 音频图
Hour 3   [████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 可视化 + EQ
Hour 4   [████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] EQ
Hour 5   [████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 响度
Hour 6   [████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 歌词
Hour 7   [████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] Suno
Hour 8   [████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] Suno
Hour 9   [████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] Prompt
Hour 10  [████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 情感
Hour 11  [████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 测试
Hour 12  [████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 优化+交付
```

---

## 文件清单

### 新增文件
```
src/audio/
├── AudioEngine.ts
├── AudioContextManager.ts
├── decoders/
│   ├── Decoder.ts
│   └── FFmpegDecoder.ts
├── players/
│   └── WebAudioPlayer.ts
├── processors/
│   ├── EQProcessor.ts
│   ├── LoudnessProcessor.ts
│   └── types.ts
├── hooks/
│   ├── useAudioEngine.ts
│   ├── useWaveform.ts
│   ├── useLyrics.ts
│   ├── useSunoPlayer.ts
│   └── useRecommendations.ts
├── components/
│   ├── WaveformCanvas.tsx
│   ├── EQPanel.tsx
│   ├── LoudnessControl.tsx
│   ├── LyricsView.tsx
│   ├── TaskStatus.tsx
│   ├── ProgressBar.tsx
│   ├── PromptCard.tsx
│   └── EmotionDisplay.tsx
└── utils/
    ├── LrcParser.ts
    └── EmotionMap.ts

src/types/
└── audio.ts
```

### 修改文件
```
src/components/Player.tsx         # 集成新音频引擎
src/stores/useMusicStore.ts      # 扩展播放状态
src/App.tsx                      # 添加新组件
```

---

## 依赖清单

```json
{
  "@ffmpeg/ffmpeg": "^0.12.x",
  "@ffmpeg/util": "^0.12.x"
}
```

---

## 成功标准

| 指标 | 目标 | 验收 |
|------|------|------|
| 音频加载 | < 2s | ⬜ |
| 播放响应 | < 100ms | ⬜ |
| EQ 调节 | 实时生效 | ⬜ |
| 歌词同步 | < 50ms | ⬜ |
| Suno 流程 | 端到端可用 | ⬜ |
| 内存占用 | < 150MB | ⬜ |

---

*计划版本: v1.0*
*创建时间: 2026-04-14*
*预计完成: 2026-04-14 (12 小时)*
