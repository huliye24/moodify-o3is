# 2_任务 - 原子任务系统

此目录存放所有待执行和已完成的原子任务，采用 JSON 格式。

## 任务文件命名规范

```
TYYYYMMDD_NNN_描述.json
例如：
T20260413_001_初始化AIP协议目录.json
T20260413_002_创建决策文档.json
```

## 任务 JSON Schema

```json
{
  "task_id": "T20260413_001",           // 唯一ID（日期+序号）
  "title": "任务标题",                    // 简明扼要
  "description": "详细描述",             // 做什么、为什么
  "type": "feature",                    // feature/bugfix/docs/refactor
  "tech_node": "R0",                    // 所属技术节点（见 roadmap）
  "priority": "P0",                     // P0/P1/P2/P3
  "status": "pending",                  // pending/in_progress/completed/blocked
  "created_at": "2026-04-13T10:00:00Z",
  "completed_at": null,
  "assignee": "AI Assistant",          // 执行者
  "preconditions": [],                  // 前置条件（任务ID列表）
  "postconditions": [],                 // 后置条件（任务ID列表）
  "acceptance_criteria": [],            // 验收标准
  "dependencies": [],                   // 依赖的其他任务
  "files_modified": [],                 // 修改的文件列表
  "notes": ""                           // 执行笔记
}
```

## 任务状态流转

```
pending → in_progress → completed
    ↓
blocked (遇到阻塞)
    ↓
pending (问题解决后)
```

## 执行流程

1. **读取任务**：按 `created_at` 排序，取第一个 `pending` 任务
2. **执行任务**：完成代码修改、文档更新等
3. **更新状态**：改为 `completed`，填入 `completed_at`
4. **记录事件**：追加到 `3_共享/event_log.yaml`
5. **更新路线图**：更新 `1_roadmap/` 中对应节点进度
6. **执行钩子**：运行 `3_shared/HOOKS.yaml` 中定义的自检

## 原子性原则

- 一个任务只做一件事
- 任务之间通过 `preconditions` 和 `postconditions` 关联
- 单个任务执行时间建议不超过 4 小时

## 工具支持

- `tools/validate-tasks.js` - 验证任务格式
- `tools/update-dashboard.js` - 更新仪表盘
- `tools/weekly-report.js` - 生成周报

## 快速命令

```bash
# 验证所有任务文件
node tools/validate-tasks.js

# 更新仪表盘
node tools/update-dashboard.js

# 生成周报
node tools/weekly-report.js 1 "M1核心框架"
```

---

> **重要**：每次完成一个任务后，必须执行钩子（HOOKS）并更新仪表盘。
