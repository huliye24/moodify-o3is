# AI 协作提示词指南

本文档提供与 AI 协作开发 AIP 项目的标准提示词模板。

## 通用原则

1. **明确范围**：告诉 AI 你要修改哪个 Node
2. **给出输入输出**：说明期望的入参和返回值
3. **禁止越界**：明确告诉 AI 不要修改哪些文件
4. **提供上下文**：附上相关代码片段

---

## 模板 1：修改已有 Node 的逻辑

**场景**：需要修改某个 Node 的内部实现，但不改变接口

```
修改 {Node名称} 的 {方法名} 逻辑。

## 当前代码
```typescript
{粘贴当前代码片段}
```

## 期望行为
{描述期望的行为变化}

## 约束
- 只修改 process() 内部逻辑
- 不要修改输入/输出接口
- 不要修改其他文件

请提供修改后的完整代码。
```

**示例**：

```
修改 useProject 的 createProject 方法，添加项目名称重复检查。

当前代码：
```typescript
createProject: async (name) => {
  const res = await api.post('/projects', { name })
  set(state => ({ projects: [...state.projects, res] }))
}
```

期望：在调用 API 前检查项目名称是否已存在，如果存在则抛出错误。

约束：
- 只修改这一方法内部
- 不要改变返回值类型
- 不要修改其他文件
```

---

## 模板 2：新增 Node

**场景**：需要添加新的功能，创建新的 Node

```
在 src/hooks/ 下创建新的 Node：useXXX

## 功能描述
{描述新功能}

## 输入
- param1: type, description
- param2: type, description

## 输出
- result1: type, description
- result2: type, description

## 依赖
- 需要调用 api.xxx
- 可能需要访问 store.yyy

## 示例
```typescript
// 期望的使用方式
const { result } = useXXX({ param1: 'value' })
```

请创建完整的 Node 文件，包括：
1. TypeScript 类型定义
2. Zustand store 创建
3. 所有必要的方法
4. 错误处理
5. JSDoc 注释

不要修改任何现有文件。
```

**示例**：

```
在 src/hooks/ 下创建 useAudioPlayer Node，用于音频播放控制。

功能：
- 创建和管理 HTMLAudioElement 实例
- 提供 play/pause/seek/setVolume 方法
- 自动更新 currentTime 和 duration
- 支持循环、静音

输入：
- audioUrl: string（初始音频地址）

输出：
- isPlaying: boolean
- currentTime: number
- duration: number
- volume: number
- play(): Promise<void>
- pause(): void
- seek(time: number): void

依赖：
- 不需要外部 API，纯浏览器 API

请创建完整的 useAudioPlayer.ts 文件。
```

---

## 模板 3：修改样式

**场景**：只调整颜色、布局等样式，不改变结构

```
修改 {组件名} 的样式。

## 当前代码
```tsx
{粘贴组件代码}
```

## 期望样式
{描述期望的视觉变化}
- 颜色：从 #xxx 改为 #yyy
- 间距：增加/减少 padding
- 字体：调整大小/粗细

## 约束
- 只修改 CSS 类名或 style 属性
- 不要改变 JSX 结构（不要增删元素）
- 不要修改组件逻辑

请只提供需要修改的部分。
```

---

## 模板 4：问题诊断

**场景**：遇到问题，需要 AI 帮助分析

```
我遇到了一个问题：

## 问题描述
{描述具体现象}

## 期望行为
{描述期望结果}

## 复现步骤
1. ...
2. ...
3. ...

## 相关代码
{粘贴相关代码片段}

## 已尝试
{列出已尝试的解决方法}

## 错误信息
{粘贴完整错误信息}

请分析可能的原因，并提供解决方案。
```

---

## 模板 5：代码审查

**场景**：让 AI 审查代码质量

```
请审查以下代码：

## 代码
```typescript
{粘贴代码}
```

## 审查重点
- [ ] 是否符合 NodeNet 架构原则
- [ ] 是否违反任何 L1/L2/L3 约束
- [ ] 是否有潜在的 bug
- [ ] 性能是否有问题
- [ ] 可读性如何
- [ ] TypeScript 类型是否严谨

请逐条列出发现的问题和改进建议。
```

---

## 模板 6：生成任务文件

**场景**：根据实现内容生成对应的任务 JSON

```
根据以下代码变更，生成对应的任务文件：

## 变更摘要
- 文件：src/hooks/useProject.ts
- 改动：新增 deleteProject 方法
- 原因：需要支持删除项目功能

## 任务元数据
- task_id: T20260413_005（按顺序）
- title: 实现项目删除功能
- type: feature
- tech_node: frontend
- priority: P1
- status: completed

## 验收标准
- [x] deleteProject 方法能调用 DELETE /api/projects/:id
- [x] 删除后从列表中移除
- [x] 有确认对话框防止误操作

## 完成时间
created_at: 2026-04-13T14:00:00Z
completed_at: 2026-04-13T14:30:00Z

请生成完整的任务 JSON。
```

---

## 模板 7：更新路线图

**场景**：功能完成后需要更新技术路线图

```
更新 roadmap 中的节点状态。

## 变更
- 节点：R2（自检钩子）
- 旧状态：in_progress
- 新状态：completed
- 完成时间：2026-04-13

## 相关任务
- T20260413_003: 实现 validate-tasks.js
- T20260413_004: 实现 update-dashboard.js
- T20260413_005: 编写 HOOKS.yaml

请更新：
1. roadmap/evolution/M01-核心框架.md
2. 3_共享/dashboard.md
3. decisions/INDEX.md（如有）
```

---

## 重要提示

### 不要这样做

❌ **模糊指令**：
```
帮我优化代码
```

✅ **明确指令**：
```
优化 useProject 的 createProject 方法，添加错误重试逻辑（最多 3 次），并更新相关测试。
```

❌ **跨层修改**：
```
同时修改组件和 hook
```

✅ **单层修改**：
```
只修改 useProject.ts 的逻辑，不要碰组件文件
```

❌ **无边界的请求**：
```
让这个功能更好
```

✅ **有验收标准的请求**：
```
添加项目名称验证：
- 长度 1-50 字符
- 不能包含特殊字符
- 重复名称提示用户
```

### 最佳实践

1. **先给上下文**：告诉 AI 你在哪个 Node、哪个文件
2. **再给目标**：明确说要实现什么
3. **后给约束**：列出不能做什么
4. **提供示例**：代码片段、API 文档链接
5. **定义完成**：什么算"完成"（验收标准）

---

## 快速参考卡

| 场景 | 模板 | 关键词 |
|------|------|--------|
| 改逻辑 | 模板 1 | "修改 X 的 Y 方法" |
| 新增功能 | 模板 2 | "创建新的 Node" |
| 改样式 | 模板 3 | "修改样式" |
| 查问题 | 模板 4 | "我遇到了问题" |
| 代码审查 | 模板 5 | "请审查" |
| 生成任务 | 模板 6 | "生成任务文件" |
| 更新路线图 | 模板 7 | "更新 roadmap" |

---

**记住**：AI 是你的协作者，不是魔法棒。清晰的指令 = 高质量的产出。
