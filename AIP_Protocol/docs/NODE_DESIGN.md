# Node 设计规范

本文档定义 AIP 协议中 Node（节点）的设计和实现标准。

## 什么是 Node？

Node 是 AIP 协议的最小结构单元，每个 Node 有明确的：

- **Input**（输入）
- **Process**（处理逻辑）
- **Output**（输出）

```
┌─────────────────┐
│    Input        │ ← 明确的入参
├─────────────────┤
│   Process()     │ ← 独立的业务逻辑
├─────────────────┤
│    Output       │ ← 明确的返回值
└─────────────────┘
```

## Node 类型

### 1. 数据获取 Node

```typescript
// useProjects.ts
input: 无
process: 从 API 获取项目列表
output: Project[]
```

### 2. 状态管理 Node

```typescript
// useMoodStore.ts
input: 初始状态
process: 管理播放状态（播放/暂停/音量）
output: { isPlaying, volume, currentTrack }
```

### 3. 业务逻辑 Node

```typescript
// useO3ics.ts
input: { content, params: { emotion, theme, style } }
process: 调用 DeepSeek API 生成歌词
output: { lyrics, sunoPrompts }
```

### 4. 副作用 Node

```typescript
// useAudioPlayer.ts
input: audioUrl
process: 创建 Audio 对象，处理播放事件
output: { play, pause, seek, onEnded }
```

## Node 设计原则

### 原则 1：单一职责

```typescript
// ❌ 错误：一个 Node 做太多事
function useApp() {
  // 项目管理
  // 歌词生成
  // 规则管理
  // 播放控制
  // ... 400 行
}

// ✅ 正确：拆分为多个 Node
useProject.ts      // 项目管理
useO3ics.ts        // 歌词生成
useRules.ts        // 规则管理
useAudioPlayer.ts  // 播放控制
```

### 原则 2：明确的接口

```typescript
// ✅ 好的 Node 接口
interface UseProject {
  (): {
    projects: Project[]
    currentProject: Project | null
    createProject: (name: string) => Promise<void>
    selectProject: (id: number) => void
    deleteProject: (id: number) => Promise<void>
  }
}

// ❌ 坏的 Node 接口
function useProject() {
  // 内部状态散落，没有明确返回
  // 函数命名不清晰
  // 没有类型定义
}
```

### 原则 3：独立性

一个 Node 应该：
- ✅ 不依赖其他 Node 的内部实现
- ✅ 只通过输入接收依赖
- ✅ 可独立测试（mock 输入即可）

```typescript
// ✅ 独立的 Node
function useO3ics(apiClient: ApiClient) {  // 通过参数注入依赖
  return {
    generate: async (params) => {
      return apiClient.post('/o3ics/generate', params)
    }
  }
}

// ❌ 紧耦合的 Node
function useO3ics() {
  // 内部直接 import api，无法独立测试
  import { api } from '../utils/api'
  // ...
}
```

### 原则 4：可测试性

```typescript
// ✅ 可测试的 Node
describe('useO3ics', () => {
  it('should generate lyrics with given params', async () => {
    // 准备
    const mockApi = { post: jest.fn() }
    const useO3ics = createUseO3ics(mockApi)

    // 执行
    const result = await useO3ics().generate({ emotion: '悲伤' })

    // 断言
    expect(mockApi.post).toHaveBeenCalledWith('/o3ics/generate', { emotion: '悲伤' })
  })
})
```

## Node 拆分标准

什么时候应该拆分 Node？

### 信号 1：函数超过 50 行

```typescript
// ❌ 太长，应该拆分
function useApp() {
  // 50+ 行，做多件事
}

// ✅ 拆分为多个 Node
function useProject() { ... }  // 20 行
function useO3ics() { ... }    // 30 行
function useRules() { ... }    // 25 行
```

### 信号 2：有多个关注点

```typescript
// ❌ 多个关注点混在一起
function useMusicPlayer() {
  // 1. 播放控制
  // 2. 播放列表管理
  // 3. 音量控制
  // 4. 进度跟踪
}

// ✅ 按关注点拆分
usePlayerCore.ts      // 核心播放逻辑
usePlaylist.ts        // 播放列表管理
useVolumeControl.ts   // 音量控制
useProgressTracker.ts // 进度跟踪
```

### 信号 3：需要复用逻辑

```typescript
// ❌ 逻辑散落在多个地方
// ComponentA 中有一堆播放逻辑
// ComponentB 中又有类似的播放逻辑

// ✅ 提取为 Node，多处复用
const useAudioPlayer = createUseAudioPlayer()
```

## Node 文件结构

### 标准文件模板

```typescript
// src/hooks/useXXX.ts
import { create } from 'zustand'

// 1. 类型定义
interface XXXState {
  // 状态字段
}

// 2. Node 创建
export const useXXX = create<XXXState>((set, get) => ({
  // 3. 初始状态
  initialState: ...,

  // 4. 操作方法
  action1: () => { ... },
  action2: async () => { ... },

  // 5. 派生状态（computed）
  get derived() { ... }
}))

// 6. 辅助函数（可选）
function helper() { ... }
```

### Node 导出规范

```typescript
// ✅ 清晰的导出
export const useProject = create(...)
export type { Project } from '../types'

// ❌ 混乱的导出
export default create(...)  // 不要 default export
```

## Node 依赖管理

### 依赖注入

```typescript
// ✅ 通过参数注入依赖
function createUseO3ics(api: ApiClient) {
  return create((set) => ({
    generate: async (params) => {
      const result = await api.post('/o3ics/generate', params)
      set({ ... })
    }
  }))
}

// ❌ 内部导入，无法 mock
function useO3ics() {
  const api = require('../api')  // 紧耦合
  // ...
}
```

### 依赖层级

```
Node A → Node B（依赖）

规则：
1. 上层 Node 可以依赖下层 Node
2. 禁止循环依赖（A → B → A）
3. 禁止跨层依赖（L1 不能直接 import L2）
```

## Node 测试

每个 Node 应该有对应的测试文件：

```
src/
├── hooks/
│   ├── useProject.ts
│   ├── useProject.test.ts   ← 测试文件
│   ├── useO3ics.ts
│   └── useO3ics.test.ts
```

测试模板：

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useProject } from './useProject'

describe('useProject', () => {
  it('should create a new project', async () => {
    // Arrange
    const mockApi = { post: vi.fn() }

    // Act
    const result = await useProject(mockApi).createProject('Test')

    // Assert
    expect(mockApi.post).toHaveBeenCalledWith('/projects', { name: 'Test' })
  })

  it('should handle create project error', async () => {
    // ...
  })
})
```

---

> **记住**：Node 是系统的积木，好的 Node 应该像 LEGO 一样——独立、可组合、可复用。
