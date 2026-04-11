# moodify o3is 技术方案

> 设计日期：2026-04-11
> 作者：Moodify Team

---

## 一、现状分析

| 模块 | 技术栈 | 状态 |
|------|--------|------|
| 桌面框架 | Electron 28 | ✅ 稳定 |
| 前端框架 | React 18 + TypeScript | ✅ 稳定 |
| 状态管理 | Zustand | ✅ 稳定 |
| 数据库 | SQLite (Prisma) | ✅ 稳定 |
| 歌词生成 | DeepSeek API | ✅ 已集成 |
| 配置存储 | electron-store | ✅ 稳定 |
| 音乐播放 | Web Audio API | 🔧 需扩展 |

---

## 二、目标架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Moodify 应用架构                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Renderer Process (React)                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │   │
│  │  │ LyricsPanel │  │ MusicPanel  │  │    PlayerControlBar    │  │   │
│  │  │  歌词创作    │  │  音乐管理    │  │      播放控制栏         │  │   │
│  │  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │   │
│  │         │                │                     │                 │   │
│  │  ┌──────▼────────────────▼─────────────────────▼─────────────┐  │   │
│  │  │                    useStore (Zustand)                     │  │   │
│  │  │   歌词状态 │ 音乐状态 │ 播放器状态 │ 项目状态 │ UI状态       │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                           window.api.* (IPC Bridge)                      │
│                                    │                                     │
│  ┌─────────────────────────────────▼─────────────────────────────────┐ │
│  │                      Preload (Context Bridge)                     │ │
│  └─────────────────────────────────┬─────────────────────────────────┘ │
│                                    │                                     │
├────────────────────────────────────▼────────────────────────────────────┤
│                           Main Process (Electron)                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐   │
│  │ ipc-handlers.ts  │  │ suno-handler.ts │  │   database.ts        │   │
│  │ DeepSeek歌词生成  │  │  Suno音乐生成    │  │   Prisma ORM        │   │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘   │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐   │
│  │  electron-store  │  │  文件系统管理     │  │   音频文件缓存      │   │
│  │   配置存储        │  │   下载/读取       │  │   audio/目录       │   │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            外部 API 服务                                  │
│  ┌──────────────────────┐              ┌──────────────────────────┐    │
│  │     DeepSeek API      │              │        Suno API           │    │
│  │   歌词智能生成         │              │   AI音乐生成/状态查询     │    │
│  │  api.deepseek.com     │              │  {BASE_URL}/suno/*      │    │
│  └──────────────────────┘              └──────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 三、数据模型设计

### 3.1 新增 MusicTrack 模型

```prisma
// prisma/schema.prisma 新增

model MusicTrack {
  id              Int       @id @default(autoincrement())
  o3icsId        Int       // 关联的歌词
  o3ics          Lyrics    @relation(fields: [o3icsId], references: [id])

  // Suno 相关
  taskId         String?   // Suno 任务ID (task_id)
  sunoSongId     String?   // Suno 歌曲ID

  // 音频信息
  title          String
  audioUrl       String?   // 音频URL
  videoUrl       String?   // 视频URL
  coverImageUrl  String?   // 封面图

  // 状态管理
  status         String    @default("pending")
  // pending: 等待提交
  // submitted: 已提交处理中
  // queued: 排队中
  // in_progress: 生成中
  // success: 生成成功
  // failure: 生成失败

  // 风格参数
  style          String?   // 音乐风格描述
  model          String?   // 使用的模型
  instrumental   Boolean   @default(false)

  // 元数据
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@index([o3icsId])
  @@index([taskId])
  @@index([status])
}
```

### 3.2 修改 Lyrics 模型

```prisma
model Lyrics {
  // ... 现有字段 ...

  // 新增关联
  musicTracks    MusicTrack[]

  // 歌词标签
  tags           String    @default("[]")
}
```

---

## 四、Suno API 集成方案（基于实际 API 文档）

### 4.1 Suno API 基础信息

| 项目 | 值 |
|------|-----|
| API 基础地址 | `https://{BASE_URL}/suno` |
| 生成音乐 | `POST /suno/submit/music` |
| 查询进度 | `POST /suno/fetch` |
| 支持模型 | `chirp-v3-0`, `chirp-v3-5`, `chirp-v4`, `chirp-auk`, `chirp-v5` |

### 4.2 任务状态流转

```
NOT_START → SUBMITTED → QUEUED → IN_PROGRESS → SUCCESS
                                              ↓
                                           FAILURE
```

### 4.3 Suno IPC Handler 设计

```typescript
// electron/main/suno-handler.ts

// Suno API 请求参数
interface SunoSubmitRequest {
  gpt_description_prompt: string  // 音乐风格描述
  make_instrumental: boolean       // 是否纯音乐
  model: string                   // 模型: chirp-v3-5 等
  o3ics?: string                 // 歌词内容
  title?: string                  // 曲目标题
  notify_hook?: string            // 回调地址（可选）
}

// Suno 任务响应
interface SunoTaskResponse {
  task_id: string     // 任务ID，用于后续查询
}

// Suno 任务状态查询
interface SunoFetchRequest {
  task_ids: string[]  // 任务ID数组
}

// Suno 任务状态
interface SunoTask {
  task_id: string      // 任务ID
  action: string      // MUSIC | LYRICS
  status: 'NOT_START' | 'SUBMITTED' | 'QUEUED' | 'IN_PROGRESS' | 'FAILURE' | 'SUCCESS'
  submitTime: number
  startTime: number
  finishTime: number
  failReason?: string
  data: {
    // 音乐数据（成功时）
    songs?: Array<{
      id: string
      title: string
      audio_url: string
      video_url: string
      image_url: string
      o3ics: string
    }>
    // 歌词数据
    o3ics?: string
  }
}

// IPC 通道定义
interface SunoAPI {
  submit: (options: SunoSubmitRequest) => Promise<SunoTaskResponse>
  fetch: (taskIds: string[]) => Promise<SunoTask[]>
}
```

### 4.4 生成流程设计

```
用户点击"生成音乐"
       │
       ▼
┌────────────────────────────────────────────────────────────┐
│ 1. 前端：验证歌词和 API Key                                  │
└────────────────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────────┐
│ 2. IPC 调用：suno:submit                                   │
│    - 传递歌词内容、标题、风格参数                            │
└────────────────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────────┐
│ 3. Main Process：调用 Suno API                             │
│    - POST /suno/submit/music                               │
│    - 返回 task_id 保存到数据库                              │
└────────────────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────────┐
│ 4. 轮询状态：每3秒调用 suno:fetch                          │
│    - NOT_START → SUBMITTED → QUEUED → IN_PROGRESS         │
│    - 检查 status: 'SUCCESS' 或 'FAILURE'                   │
│    - 更新 UI 进度条                                         │
└────────────────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────────┐
│ 5. 生成完成：                                              │
│    - 保存 audio_url, video_url, image_url 到 MusicTrack    │
│    - 前端自动添加到播放列表                                  │
│    - 可选：自动开始播放                                     │
└────────────────────────────────────────────────────────────┘
```

---

## 五、前端架构设计

### 5.1 状态管理扩展

```typescript
// src/stores/useMusicStore.ts

interface MusicState {
  // 播放列表
  playlist: MusicTrack[]
  currentTrack: MusicTrack | null
  queue: MusicTrack[]

  // 播放状态
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean

  // 生成状态
  isGenerating: boolean
  currentTaskId: string | null
  generationError: string | null

  // 操作
  submitMusic: (o3icsId: number, options?: SunoSubmitRequest) => Promise<void>
  pollTaskStatus: (taskId: string) => Promise<void>
  addToPlaylist: (track: MusicTrack) => void
  play: (track?: MusicTrack) => void
  pause: () => void
  next: () => void
  previous: () => void
  setVolume: (volume: number) => void
  seek: (time: number) => void
}
```

### 5.2 组件结构

```
src/
├── components/
│   ├── MainContent.tsx          # 歌词创作主界面 (保留)
│   ├── MusicPanel.tsx           # 🆕 音乐生成面板
│   │   ├── GenerateButton      # 生成按钮
│   │   ├── ProgressBar         # 生成进度
│   │   ├── StyleSelector       # 风格选择器
│   │   └── TrackList           # 曲目列表
│   ├── PlayerControlBar.tsx    # 🆕 底部播放控制栏
│   │   ├── PlayPauseButton     # 播放/暂停
│   │   ├── ProgressSlider     # 进度条
│   │   ├── VolumeControl       # 音量控制
│   │   ├── TrackInfo          # 曲目信息
│   │   └── PlaylistButton      # 播放列表
│   ├── PlaylistDrawer.tsx      # 🆕 播放列表抽屉
│   ├── SettingsModal.tsx       # 设置面板 (扩展)
│   └── LyricsPreview.tsx       # 🆕 歌词预览
├── stores/
│   ├── useStore.ts             # 现有 store (保留)
│   └── useMusicStore.ts        # 🆕 音乐状态管理
├── hooks/
│   ├── useAudioPlayer.ts       # 🆕 音频播放 Hook
│   └── useSunoPolling.ts       # 🆕 Suno 状态轮询 Hook
└── types/
    └── index.ts                # 扩展类型定义
```

---

## 六、UI 交互流程

### 6.1 整体布局

```
┌────────────────────────────────────────────────────────────────────────┐
│  Header: Moodify Logo │ 项目选择 │ 设置按钮                            │
├──────────────┬───────────────────────────────────┬───────────────────┤
│              │                                   │                   │
│   侧边栏      │         主内容区                  │    歌词预览        │
│  (项目列表)   │   - 歌词创作                      │   (可选显示)      │
│              │   - 音乐生成                       │                   │
│              │   - 歌词编辑                       │                   │
│              │                                   │                   │
├──────────────┴───────────────────────────────────┴───────────────────┤
│  播放控制栏: ▶ │ 曲目名 - 歌手 │ ◀ ▶ │━━━━━━━│ 1:23/3:45 │ 🔊────│  │
└────────────────────────────────────────────────────────────────────────┘
```

### 6.2 音乐生成流程 UI

```
步骤 1: 选择歌词
┌─────────────────────────────────────────────────────┐
│  选择要生成音乐的歌词                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │ 歌词1   │ │ 歌词2   │ │ 歌词3   │  ...          │
│  │  ❤️     │ │         │ │         │               │
│  └─────────┘ └─────────┘ └─────────┘               │
└─────────────────────────────────────────────────────┘

步骤 2: 配置风格
┌─────────────────────────────────────────────────────┐
│  音乐风格 (多选):                                    │
│  [流行] [电子] [民谣] [摇滚] [古典] [说唱] [爵士]      │
│                                                     │
│  模型选择:                                           │
│  [chirp-v3-5] [chirp-v4] [chirp-v5]                │
│                                                     │
│  附加选项:                                          │
│  ☑ 纯音乐 (无歌词)                                  │
└─────────────────────────────────────────────────────┘

步骤 3: 生成中
┌─────────────────────────────────────────────────────┐
│  🎵 正在生成音乐...                                  │
│  状态: IN_PROGRESS                                  │
│  [████████████░░░░░░░░░░░░░░░░░░]                  │
│  预计还需 2 分钟                                      │
│                                                     │
│  [取消生成]                                          │
└─────────────────────────────────────────────────────┘

步骤 4: 完成
┌─────────────────────────────────────────────────────┐
│  ✅ 生成完成！                                       │
│  ┌───────────────────────────────────────┐         │
│  │  🎵 春日物语                            │         │
│  │  时长: 3:24                            │         │
│  │  [▶ 播放] [📥 下载] [🔄 重新生成]        │         │
│  └───────────────────────────────────────┘         │
│                                                     │
│  [生成更多版本]                                      │
└─────────────────────────────────────────────────────┘
```

---

## 七、技术实现清单

### 7.1 后端改动

| 序号 | 文件 | 改动内容 | 优先级 |
|------|------|---------|--------|
| 1 | `prisma/schema.prisma` | 新增 MusicTrack 模型 | P0 |
| 2 | `electron/main/database.ts` | 更新 Prisma Client | P0 |
| 3 | `electron/main/suno-handler.ts` | 🆕 Suno IPC 处理器 | P0 |
| 4 | `electron/main/ipc-handlers.ts` | 集成 Suno 通道 | P0 |
| 5 | `electron/preload/index.ts` | 暴露 Suno API | P0 |
| 6 | `electron/main/audio-cache.ts` | 🆕 音频文件缓存管理 | P1 |
| 7 | `electron/main/download-manager.ts` | 🆕 音频下载管理 | P1 |

### 7.2 前端改动

| 序号 | 文件 | 改动内容 | 优先级 |
|------|------|---------|--------|
| 1 | `src/types/index.ts` | 扩展类型定义 | P0 |
| 2 | `src/stores/useMusicStore.ts` | 🆕 音乐状态管理 | P0 |
| 3 | `src/components/MusicPanel.tsx` | 🆕 音乐生成面板 | P0 |
| 4 | `src/components/PlayerControlBar.tsx` | 🆕 播放控制栏 | P0 |
| 5 | `src/components/PlaylistDrawer.tsx` | 🆕 播放列表抽屉 | P1 |
| 6 | `src/components/SettingsModal.tsx` | 添加 Suno API Key | P0 |
| 7 | `src/hooks/useAudioPlayer.ts` | 🆕 音频播放 Hook | P0 |
| 8 | `src/App.tsx` | 集成新组件 | P0 |
| 9 | `src/index.css` | 播放器样式 | P1 |

### 7.3 IPC 通道定义

```typescript
// electron/preload/index.ts 新增
contextBridge.exposeInMainWorld('api', {
  // ... 现有 API ...

  suno: {
    // 提交音乐生成任务
    submit: (options) => ipcRenderer.invoke('suno:submit', options),
    // 查询任务状态
    fetch: (taskIds) => ipcRenderer.invoke('suno:fetch', taskIds),
    // 获取/设置 API Key
    getApiKey: () => ipcRenderer.invoke('suno:getApiKey'),
    setApiKey: (apiKey) => ipcRenderer.invoke('suno:setApiKey', apiKey),
    // 进度事件
    onProgress: (callback) => ipcRenderer.on('suno:progress', callback)
  },

  // MusicTrack 数据库操作
  musicTrack: {
    getByO3ics: (o3icsId) => ipcRenderer.invoke('musicTrack:getByO3ics', o3icsId),
    update: (id, data) => ipcRenderer.invoke('musicTrack:update', id, data),
    delete: (id) => ipcRenderer.invoke('musicTrack:delete', id)
  }
})
```

---

## 八、API 调用成本估算

| 服务 | 操作 | 单次成本 | 备注 |
|------|------|---------|------|
| DeepSeek | 歌词生成 | ~¥0.002 | 约2000 tokens |
| Suno | 音乐生成 | ~¥0.1 | 根据套餐 |

---

## 九、实施计划

### Phase 1: 核心集成 (1-2天)
1. 数据模型扩展 (MusicTrack)
2. Suno IPC Handler 实现
3. 基础 UI 组件 (MusicPanel)

### Phase 2: 播放功能 (1天)
1. 音频播放 Hook
2. 播放控制栏
3. 播放列表

### Phase 3: 体验优化 (1天)
1. 生成进度实时更新
2. 播放列表管理
3. 下载功能
4. 样式优化

---

## 十、Suno API 完整接口文档

### 10.1 提交音乐生成任务

**POST** `/suno/submit/music`

**请求体：**
```json
{
  "gpt_description_prompt": "A dreamy pop song with soft piano and gentle vocals",
  "make_instrumental": false,
  "model": "chirp-v3-5",
  "o3ics": "[verse]\n春天的花开\n秋天的风\n\n[chorus]\n时光匆匆\n我们都在",
  "title": "春日物语"
}
```

**响应：**
```json
{
  "task_id": "f4a94d75-087b-4bb1-bd45-53ba293faf96"
}
```

### 10.2 查询任务状态

**POST** `/suno/fetch`

**请求体：**
```json
{
  "task_ids": ["f4a94d75-087b-4bb1-bd45-53ba293faf96"]
}
```

**响应：**
```json
{
  "tasks": [
    {
      "task_id": "f4a94d75-087b-4bb1-bd45-53ba293faf96",
      "action": "MUSIC",
      "status": "SUCCESS",
      "submitTime": 1689231405854,
      "startTime": 1689231442755,
      "finishTime": 1689231544312,
      "data": {
        "songs": [
          {
            "id": "song_abc123",
            "title": "春日物语",
            "audio_url": "https://example.com/audio.mp3",
            "video_url": "https://example.com/video.mp4",
            "image_url": "https://example.com/cover.jpg",
            "o3ics": "..."
          }
        ]
      }
    }
  ]
}
```

### 10.3 支持的模型版本

| 模型 | 版本 | 特点 |
|------|------|------|
| `chirp-v3-0` | v3.0 | 基础版本 |
| `chirp-v3-5` | v3.5 | 优化音质 |
| `chirp-v4` | v4.0 | 更强创造力 |
| `chirp-auk` | v4.5 | 中文优化 |
| `chirp-v5` | v5.0 | 最新版本 |

---

## 十一、待确认事项

1. **Suno API BASE_URL**：你的 API 提供商提供的 BASE_URL 是什么？
2. **认证方式**：API 是通过 Header 认证还是查询参数？
3. **回调通知**：是否需要配置 notify_hook 回调地址？
4. **音频存储**：生成的音频是存储在本地还是使用云端 URL？
5. **下载功能**：是否需要实现音频下载到本地功能？
