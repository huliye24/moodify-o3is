# AIP 协议工具集

## 自动化工具

| 工具 | 说明 | 用法 |
|------|------|------|
| `update-decision-index.js` | 更新决策索引 | `node AIP_Protocol/tools/update-decision-index.js` |
| `validate-decisions.js` | 验证决策格式 | `node AIP_Protocol/tools/validate-decisions.js` |
| `validate-tasks.js` | 验证任务格式 | `node AIP_Protocol/tools/validate-tasks.js` |
| `update-dashboard.js` | 更新仪表盘 | `node AIP_Protocol/tools/update-dashboard.js` |
| `weekly-report.js` | 生成周报 | `node AIP_Protocol/tools/weekly-report.js <周次> <主题>` |

## Git Hooks

### pre-commit hook

在 `.git/hooks/pre-commit` 中添加:

```bash
#!/bin/sh
node AIP_Protocol/tools/validate-tasks.js
node AIP_Protocol/tools/validate-decisions.js
```

### commit-msg hook

自动更新决策索引:

```bash
#!/bin/sh
node AIP_Protocol/tools/update-decision-index.js
```

## 使用示例

```bash
# 验证决策文件
node AIP_Protocol/tools/validate-decisions.js

# 更新决策索引
node AIP_Protocol/tools/update-decision-index.js

# 验证任务文件
node AIP_Protocol/tools/validate-tasks.js

# 更新仪表盘
node AIP_Protocol/tools/update-dashboard.js

# 生成周报
node AIP_Protocol/tools/weekly-report.js 1 "M1核心框架"
```

## package.json 脚本

```json
{
  "scripts": {
    "aip:validate:decisions": "node AIP_Protocol/tools/validate-decisions.js",
    "aip:validate:tasks": "node AIP_Protocol/tools/validate-tasks.js",
    "aip:decisions:index": "node AIP_Protocol/tools/update-decision-index.js",
    "aip:dashboard": "node AIP_Protocol/tools/update-dashboard.js",
    "aip:report": "node AIP_Protocol/tools/weekly-report.js"
  }
}
```

## 工具开发指南

### 创建新工具

1. 在 `AIP_Protocol/tools/` 下创建 `.js` 文件
2. 使用 CommonJS 模块格式
3. 添加命令行参数解析（使用 `process.argv`）
4. 添加 `--help` 支持
5. 遵循退出码规范（0=成功，1=失败）

### 工具规范

- 所有工具必须输出中文
- 使用 Emoji 增强可读性
- 遵循 Unix 约定（stdout 输出，stderr 错误）
- 工具必须能独立运行（不依赖其他工具）
