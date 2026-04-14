# Git Hooks 安装指南

## 概述

Git Hooks 允许在 Git 操作（如提交）前后自动执行脚本。AIP Protocol 使用 Git Hooks 来确保代码质量和自动更新索引。

## 提供的 Hooks

| Hook | 触发时机 | 功能 |
|------|----------|------|
| `pre-commit` | `git commit` 之前 | 验证任务和决策文件格式 |
| `commit-msg` | `git commit` 之后 | 更新决策索引和仪表盘 |

## 安装方法

### 方法 1: 手动复制（推荐）

```bash
# 复制 pre-commit hook
cp AIP_Protocol/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# 复制 commit-msg hook
cp AIP_Protocol/hooks/commit-msg .git/hooks/commit-msg
chmod +x .git/hooks/commit-msg
```

### 方法 2: 使用符号链接

```bash
ln -s ../../AIP_Protocol/hooks/pre-commit .git/hooks/pre-commit
ln -s ../../AIP_Protocol/hooks/commit-msg .git/hooks/commit-msg
chmod +x .git/hooks/pre-commit .git/hooks/commit-msg
```

### 方法 3: 使用 git hooks 命令（Git 2.9+）

```bash
git config core.hooksPath AIP_Protocol/hooks
```

## 验证安装

```bash
# 检查 hooks 目录
ls -la .git/hooks/

# 测试 pre-commit hook
git commit --allow-empty -m "test hook"
```

## Hooks 行为

### pre-commit hook

1. 验证 `AIP_Protocol/2_任务/` 中的任务 JSON 格式
2. 验证 `AIP_Protocol/0_决策/` 中的决策 MD 格式
3. 如果验证失败，阻止提交

### commit-msg hook

1. 自动运行 `update-decision-index.js` 更新索引
2. 自动运行 `update-dashboard.js` 更新仪表盘
3. 即使失败也不会阻止提交

## 跳过 Hooks

如果需要跳过 hooks，可以使用 `--no-verify` 选项：

```bash
git commit --no-verify -m "跳过 hooks 的提交"
```

## 故障排除

### Hook 不执行

1. 确保文件有执行权限：`chmod +x .git/hooks/pre-commit`
2. 确保是正确的工作目录

### 验证总是失败

1. 检查 `node` 是否在 PATH 中
2. 手动运行验证脚本检查错误

## 卸载 Hooks

```bash
rm .git/hooks/pre-commit
rm .git/hooks/commit-msg
```
