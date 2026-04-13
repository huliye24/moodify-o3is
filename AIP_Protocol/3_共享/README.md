# 3_共享 - 全局状态与钩子

此目录包含跨所有任务的共享状态、自检钩子和事件日志。

## 文件说明

| 文件 | 用途 |
|------|------|
| `HOOKS.yaml` | 每个任务完成后必须执行的自检清单 |
| `event_log.yaml` | 所有任务执行的历史记录 |
| `dashboard.md` | 全局进度仪表盘（自动生成） |
| `state_snapshot/` | 定期状态快照备份 |

## HOOKS.yaml - 自检清单

每个任务完成后，AI 必须执行以下检查：

```yaml
hooks:
  - id: "check_files_modified"
    description: "检查修改的文件是否符合预期"
    action: "运行 git diff，确认只修改了目标文件"

  - id: "run_tests"
    description: "运行相关测试确保无回归"
    action: "npm test 或 go test"

  - id: "validate_task_format"
    description: "验证任务文件格式"
    action: "node tools/validate-tasks.js"

  - id: "update_dashboard"
    description: "更新全局仪表盘"
    action: "node tools/update-dashboard.js"

  - id: "commit_changes"
    description: "提交更改到 Git（可选）"
    action: "git add . && git commit -m '描述'"

  - id: "log_completion"
    description: "记录任务完成事件"
    action: "追加到 event_log.yaml"
```

## 事件日志格式

```yaml
- timestamp: "2026-04-13T15:30:00Z"
  task_id: "T20260413_001"
  event: "task_completed"
  assignee: "AI Assistant"
  duration_minutes: 45
  notes: "任务完成，无问题"
```

## 仪表盘（dashboard.md）

自动生成的全局进度视图，包含：

- 任务总数与完成率
- 各技术节点进度
- 活跃任务列表
- 最近完成事件
- 成功标准进度

更新命令：

```bash
node tools/update-dashboard.js
```

---

> **重要**：HOOKS 是协议强制要求，每个任务完成后必须执行。
