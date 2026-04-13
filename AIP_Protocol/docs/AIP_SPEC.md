---
layout: "mdc"
title: "AIP Protocol - AI Intent Protocol"
version: "1.0.0"
last_updated: "2026-04-13"
authors:
  - "Moodify Team"
  - "AI Assistant"
status: "active"
---

# AIP Protocol 技术规范

> **AI Intent Protocol** - 让 AI 能够持久化记忆、自我进化、规范协作的"项目蛋白质"协议

## 文档信息

| 字段 | 值 |
|------|-----|
| 协议名称 | AI Intent Protocol (AIP) |
| 版本 | 1.0.0 |
| 状态 | 草案 |
| 创建日期 | 2026-04-13 |
| 最后更新 | 2026-04-13 |
| 适用项目 | Moodify 及所有 AI 协作项目 |

## 协议层级

### L0: 宪法层 (0_decision/)

**不可变意图** - 项目的终极目标、约束、价值观

- 愿景（Vision）：项目存在的意义
- 约束（Constraints）：不可逾越的红线
- 价值观（Values）：优先级判断标准

**修改频率**: 极低（数月/年）

### L1: 路线图层 (1_roadmap/)

**可演化科技树** - 技术演进方向、里程碑规划

- 组件定义（Components）
- 依赖关系（Dependencies）
- 演进路线（Evolution）

**修改频率**: 中等（周/月）

### L2: 任务层 (2_tasks/)

**原子任务系统** - 可执行的最小工作单元

- 任务定义（Task Definition）
- 状态管理（Status Management）
- 依赖图谱（Dependency Graph）

**修改频率**: 高（日/小时）

### L3: 共享层 (3_shared/)

**全局状态与钩子** - 实时同步的共享状态

- 事件日志（Event Log）
- 仪表盘（Dashboard）
- 自检钩子（Hooks）
- 状态快照（Snapshots）

**修改频率**: 实时

---

## 核心机制

### 1. 持久化记忆

传统 AI 对话：无记忆，每次都是新的

AIP 协议：
```
对话开始 → AI 读取 3_shared/event_log.yaml → 了解历史
对话执行 → AI 更新 2_tasks/ → 记录进度
对话结束 → AI 写入 3_shared/ → 为下次对话准备
```

**效果**：AI 有了"长期记忆"。

### 2. 自我进化

当 AI 发现：
- 某个 Node 经常出问题 → 在 `1_roadmap/优化记录/` 中提案
- 某个流程低效 → 创建优化任务
- 缺少钩子 → 直接添加到 `3_shared/HOOKS.yaml`

**效果**：AI 可以改进自己的工作方式。

### 3. 规范协作

通过明确的角色分工：

```
人：决定结构（What → How）
  - 设计 Node 划分
  - 定义输入输出
  - 批准架构变更

AI：实现逻辑（How）
  - 填充 Node 内部
  - 执行原子任务
  - 执行自检钩子

配置：参数驱动（Config）
  - 修改 ports.json
  - 调整 nodesplit.json
  - 不写代码
```

**效果**：协作有章可循，不会混乱。

---

## 文件格式规范

### 任务文件（2_tasks/）

```json
{
  "$schema": "https://aip.moodify/schemas/task.json",
  "task_id": "T20260413_001",
  "title": "简明标题",
  "description": "详细描述",
  "type": "feature|bugfix|docs|refactor|test",
  "tech_node": "R0|backend|frontend|bugfix|docs",
  "priority": "P0|P1|P2|P3",
  "status": "pending|in_progress|completed|blocked",
  "created_at": "ISO 8601",
  "completed_at": "ISO 8601|null",
  "assignee": "AI Assistant|Human|Team",
  "preconditions": ["T20260413_000"],
  "postconditions": ["T20260413_002"],
  "acceptance_criteria": ["标准1", "标准2"],
  "dependencies": [],
  "files_modified": ["path/to/file.ext"],
  "notes": "执行过程中的备注"
}
```

### 事件日志（3_shared/event_log.yaml）

```yaml
- timestamp: "2026-04-13T10:00:00Z"
  task_id: "T20260413_001"
  event_type: "task_started|task_completed|task_blocked"
  assignee: "AI Assistant"
  duration_minutes: 45
  files_touched: ["src/hooks/useProject.ts"]
  notes: "任务完成，无问题"
```

### 仪表盘（3_shared/dashboard.md）

自动生成，包含：
- 任务统计（总数/完成/进行中/待开始）
- 技术节点进度
- 活跃任务列表
- 最近事件
- 成功标准进度

---

## 工具链

### 验证工具

```bash
# 验证所有任务文件
node tools/validate-tasks.js

# 检查约束合规性
node tools/validate-constraints.js
```

### 更新工具

```bash
# 更新仪表盘
node tools/update-dashboard.js

# 更新决策索引
node tools/update-decision-index.js

# 生成周报
node tools/weekly-report.js 1 "M1核心框架"
```

### Git Hooks（可选）

```bash
# pre-commit: 自动验证任务
node tools/validate-tasks.js

# commit-msg: 自动更新索引
node tools/update-decision-index.js
```

---

## 工作流程

### 标准流程

```
1. 读取任务
   ↓ 读取 2_tasks/ 中第一个 pending 任务

2. 执行任务
   ↓ 修改代码、文档、配置

3. 执行钩子
   ↓ 运行 HOOKS.yaml 中的自检

4. 更新状态
   ↓ 任务标记为 completed
   追加 event_log.yaml
   更新 dashboard.md

5. 提交（可选）
   ↓ git commit
```

### 阻塞处理

```
任务执行中遇到问题
    ↓
标记 status = "blocked"
    ↓
在 notes 中记录阻塞原因
    ↓
追加 event_log.yaml（event: task_blocked）
    ↓
继续执行下一个任务
```

---

## 成功标准

AIP 协议被认为是成功的，当：

- ✅ **SC-01**: 协议文档完整，可供第三方开发者独立实现
- ✅ **SC-02**: 有一个示例项目（Moodify）证明协议有效
- ✅ **SC-03**: 协议能够驱动 AI 完成至少 50 个连续任务而不丢失上下文
- ✅ **SC-04**: 所有文件是纯文本（JSON/YAML/Markdown），便于 Git 管理
- ✅ **SC-05**: 协议不绑定特定 AI 模型或编程语言

---

## 演进计划

### Phase 1: 结构固化（2026-04）

- [x] 创建三层目录结构
- [x] 编写核心文档
- [x] 实现基础工具链

### Phase 2: 工具增强（2026-05）

- [ ] Git Hooks 集成
- [ ] VS Code 插件
- [ ] 在线仪表盘
- [ ] 任务分配系统

### Phase 3: 生态扩展（2026-06+）

- [ ] 多项目管理
- [ ] 任务模板市场
- [ ] 插件系统
- [ ] 云端同步（可选）

---

## 与 Moodify 的关系

**Moodify 是 AIP 协议的首个示例项目**。

在 Moodify 项目中：
- `decisions/` → `0_决策/` 的软链接（或实际文件）
- `roadmap/` → `1_roadmap/` 的软链接
- `tasks/` → `2_任务/` 的软链接
- 全局状态 → `3_共享/`

**目标**：用 AIP 协议管理 Moodify 的开发，同时验证协议的有效性。

---

## 快速开始

### 第一次使用

```bash
# 1. 阅读宪法
cat AIP_Protocol/AIP_CONSTITUTION.md

# 2. 查看当前任务
ls AIP_Protocol/2_任务/

# 3. 执行第一个任务
# 编辑任务文件，完成后更新状态

# 4. 运行钩子
node AIP_Protocol/tools/validate-tasks.js
node AIP_Protocol/tools/update-dashboard.js

# 5. 查看进度
cat AIP_Protocol/3_共享/dashboard.md
```

### 日常开发

```bash
# 查看待办任务
cat AIP_Protocol/3_共享/dashboard.md

# 执行第一个 pending 任务
# ... 写代码 ...

# 执行自检
node tools/validate-tasks.js

# 更新进度
node tools/update-dashboard.js

# 标记任��完成
# 编辑任务文件，设置 status: "completed"
```

---

## 贡献

AIP 协议本身也遵循 AIP 协议管理。

如果你想改进协议：
1. 在 `decisions/` 创建提案
2. 创建任务实施
3. 经过评审后合并

---

**让每一次 AI 协作，都成为项目的永久资产。**

---

*最后更新：2026-04-13*  
*文档版本：1.0.0*  
*协议状态：草案*
