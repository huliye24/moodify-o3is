# 工具集

## 自动化工具

| 工具 | 说明 | 用法 |
|------|------|------|
| `update-decision-index.js` | 更新决策索引 | `node tools/update-decision-index.js` |
| `validate-decisions.js` | 验证决策格式 | `node tools/validate-decisions.js` |
| `weekly-report.js` | 生成周报 | `node tools/weekly-report.js <周次> <主题>` |
| `check-dependencies.js` | 检查循环依赖 | `node tools/check-dependencies.js` |

## Git Hooks

### pre-commit hook

在 `.git/hooks/pre-commit` 中添加:

```bash
#!/bin/sh
node tools/validate-decisions.js
```

### commit-msg hook

自动更新决策索引:

```bash
#!/bin/sh
node tools/update-decision-index.js
```

## 使用示例

```bash
# 验证决策文件
npm run validate:decisions

# 更新索引
npm run decisions:index

# 生成周报
npm run report:weekly -- 1 "M1核心框架"
```

## package.json 脚本

```json
{
  "scripts": {
    "validate:decisions": "node tools/validate-decisions.js",
    "decisions:index": "node tools/update-decision-index.js",
    "report:weekly": "node tools/weekly-report.js"
  }
}
```
