# AI Intent Protocol (AIP)

> **版本**: 1.0.0  
> **创建日期**: 2026-04-13  
> **状态**: 草案 → 评审中

## 协议概述

AIP (AI Intent Protocol) 是一套让 AI 能够持久化记忆、自我进化、规范协作的"项目蛋白质"协议。

### 核心问题

当前 AI 辅助开发面临的问题：
1. **上下文丢失** - 每次对话都是新的，无法持续
2. **决策无记录** - 技术决策散落在聊天记录中
3. **无法自我进化** - AI 发现的问题无法沉淀
4. **协作不规范** - 人机协作缺乏明确分工

### AIP 的解决方案

通过**三层持久化结构**，让 AI 能够：

```
┌─────────────────────────────────────────────┐
│         0_决策/ - 不可变意图（宪法）          │
│   → 终极目标、约束条件、价值判断（永久锁定）   │
├─────────────────────────────────────────────┤
│         1_roadmap/ - 可演化的科技树          │
│   → 技术路线、组件依赖、演进计划（可更新）     │
├─────────────────────────────────────────────┤
│         2_任务/ - 原子任务系统              │
│   → 待执行/已完成的原子任务（JSON格式）       │
├─────────────────────────────────────────────┤
│         3_共享/ - 全局状态与钩子            │
│   → 事件日志、仪表盘、自检清单（实时同步）     │
└─────────────────────────────────────────────┘
```

## 核心机制

### 1. 三层架构

| 层级 | 目录 | 特性 | 修改频率 |
|------|------|------|----------|
| L0 - 宪法 | `0_决策/` | 永久锁定，重大决策 | 极少 |
| L1 - 科技树 | `1_roadmap/` | 可演化，月度更新 | 中等 |
| L2 - 任务 | `2_任务/` | 原子化，每日执行 | 高 |
| L3 - 状态 | `3_共享/` | 实时同步，自动更新 | 实时 |

### 2. 原子任务

每个任务是一个 JSON 文件，包含：

```json
{
  "task_id": "T20260413_001",
  "title": "任务标题",
  "status": "pending|in_progress|completed|blocked",
  "preconditions": ["T20260413_000"],
  "postconditions": ["T20260413_002"],
  "acceptance_criteria": ["标准1", "标准2"]
}
```

### 3. 自检钩子（HOOKS）

每个任务完成后必须执行的自检清单，包括：
- 验证文件修改范围
- 运行代码检查
- 执行测试
- 更新仪表盘
- 记录事件日志

### 4. 人机协作范式

| 角色 | 职责 | 范围 |
|------|------|------|
| **人** | 结构设计 | L0 + L1（决定有哪些 Node） |
| **AI** | 逻辑实现 | L2（实现 Node 内部） |
| **配置** | 参数驱动 | L3（JSON 配置） |

**核心原则**：
> 人负责切分结构，AI 负责填充细节，所有改动收敛到叶子节点。

---

## 为什么需要 AIP？

### 当前问题

没有协议的情况下：
```
对话 1: AI 创建了文件 A
对话 2: AI 忘记了文件 A 的存在，创建了冲突的文件 B
对话 3: 用户需要手动告诉 AI 之前做了什么
对话 4: AI 再次忘记，重复劳动
```

### AIP 解决方案

有了协议：
```
对话 1: AI 读取 2_任务/，执行 T001，完成后更新 3_共享/event_log.yaml
对话 2: AI 读取 event_log，知道 T001 已完成，执行 T002
对话 3: AI 读取 roadmap，更新节点状态
对话 4: AI 持续积累，形成"项目记忆"
```

---

## 快速开始

### 1. 克隆项目后

```bash
# 阅读 AIP 宪法
cat AIP_Protocol/AIP_CONSTITUTION.md

# 查看当前任务
ls AIP_Protocol/2_任务/

# 查看全局仪表盘
cat AIP_Protocol/3_共享/dashboard.md
```

### 2. 执行任务

```bash
# 1. 找到第一个 pending 任务
cat AIP_Protocol/2_任务/T*.json | grep '"status": "pending"'

# 2. 执行任务（修改代码、文档等）

# 3. 执行钩子
node AIP_Protocol/tools/validate-tasks.js
node AIP_Protocol/tools/update-dashboard.js

# 4. 更新任务状态
# 编辑任务文件，设置 "status": "completed", "completed_at": "..."
```

### 3. 创建新任务

```bash
# 使用模板
cp AIP_Protocol/templates/task-template.json AIP_Protocol/2_任务/T20260413_999_新任务.json

# 编辑任务文件
vim AIP_Protocol/2_任务/T20260413_999_新任务.json
```

---

## 核心概念

### Node（节点）

一个 Node 是最小的结构单元，具有：
- **明确的���入**
- **明确的处理逻辑**
- **明确的输出**

示例：
```typescript
// useProject.ts - 项目节点
input: 项目名称 (string)
process: 创建/查询/删除项目
output: Project[]
```

### 三层结构（NodeNet）

```
L1 - UI 层（锁定）
  └── 组件结构、props 接口不可修改

L2 - 逻辑层（Node）
  └── 每个 hook 是一个 Node，独立可测试

L3 - 配置层（Flow）
  └── ports.json、nodesplit.json 配置驱动
```

### 分形拆分原则

一个 Node 应该被拆分，当且仅当：
1. 有独立的输入
2. 有独立的输出
3. 可以独立测试
4. 有明确的边界

---

## 工具链

| 工具 | 用途 | 命令 |
|------|------|------|
| `validate-tasks.js` | 验证任务文件格式 | `node tools/validate-tasks.js` |
| `update-dashboard.js` | 更新全局仪表盘 | `node tools/update-dashboard.js` |
| `update-decision-index.js` | 更新决策索引 | `node tools/update-decision-index.js` |
| `weekly-report.js` | 生成周报 | `node tools/weekly-report.js` |

---

## 示例：完整任务流程

### 任务文件 T20260413_001

```json
{
  "task_id": "T20260413_001",
  "title": "实现项目创建功能",
  "description": "在 useProject.ts 中实现 createProject 方法",
  "type": "feature",
  "tech_node": "frontend",
  "priority": "P0",
  "status": "pending",
  "created_at": "2026-04-13T10:00:00Z",
  "completed_at": null,
  "preconditions": [],
  "acceptance_criteria": [
    "createProject 方法能正确调用 API",
    "成功后将项目添加到列表",
    "错误时有友好提示"
  ],
  "files_modified": ["src/hooks/useProject.ts"]
}
```

### 执行步骤

1. **找到任务**：读取 `2_任务/` 中第一个 `pending` 任务
2. **执行任务**：修改 `src/hooks/useProject.ts`，实现功能
3. **运行测试**：`npm test` 确保通过
4. **执行钩子**：
   ```bash
   node tools/validate-tasks.js   # ✅ 通过
   node tools/update-dashboard.js # ✅ 仪表盘更新
   ```
5. **更新任务**：
   ```json
   {
     "status": "completed",
     "completed_at": "2026-04-13T11:00:00Z",
     "notes": "一次通过，无问题"
   }
   ```
6. **提交 Git**（可选）：
   ```bash
   git add .
   git commit -m "feat: 实现项目创建功能

   T20260413_001 - createProject 方法实现
   - 调用 POST /api/projects
   - 成功后更新本地状态
   - 添加错误处理"
   ```

---

## 协议哲学

### 为什么需要协议？

因为 AI 没有记忆，协议是**外置的记忆系统**。

### 为什么用文件而不是数据库？

因为 Git 已经是最好的版本控制和协同工具。

### 为什么任务要原子化？

因为原子任务：
- 易于验证
- 易于回滚
- 易于并行
- 易于追踪

---

## 与其他方法的区别

| 方法 | 特点 | 与 AIP 区别 |
|------|------|-------------|
| **传统项目管理** | Jira、Trello | AIP 是文件化的，Git 原生支持 |
| **Git Issues** | 问题跟踪 | AIP 是结构化、可执行的任务 |
| **ADRs** | 架构决策记录 | AIP 包含决策+任务+状态，更全面 |
| **AI 对话** | 一次性 | AIP 提供持久化记忆 |

---

## 适用场景

✅ **适合**：
- 长期 AI 辅助开发项目
- 需要积累决策历史
- 多人 + AI 协作
- 需要规范 AI 行为

❌ **不适合**：
- 一次性的脚本编写
- 简单的 CRUD 功能
- 纯人工开发（无 AI 参与）

---

## 协议演进

AIP 协议本身也在演进，遵循自己的规则：

```
Phase 1: 结构固化（当前）
  → 确立三层架构
  → 编写核心文档
  → 工具链就绪

Phase 2: 工具增强
  → 自检自动化
  → 仪表盘实时化
  → 集成 Git Hooks

Phase 3: 生态扩展
  → 支持多项目
  → 跨项目任务引用
  → 插件化钩子
```

---

## 快速链接

- [三层架构说明](./docs/ARCHITECTURE.md)
- [Node 设计规范](./docs/NODE_DESIGN.md)
- [AI 协作提示词](./docs/AI_PROMPT_GUIDE.md)
- [任务模板](./templates/task-template.json)
- [HOOKS 详细说明](./3_共享/HOOKS.yaml)

---

## 开始使用

1. **阅读宪法** → `AIP_CONSTITUTION.md`
2. **查看任务** → `2_任务/README.md`
3. **执行第一个任务** → `2_任务/T20260413_001_*.json`
4. **运行钩子** → `node tools/validate-tasks.js`

---

**让 AI 的每一次协作，都成为项目的永久资产。**
