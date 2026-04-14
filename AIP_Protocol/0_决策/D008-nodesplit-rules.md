# D008: NodeSplit 架构规则

> **ID**: D008
> **状态**: approved
> **日期**: 2026-04-13
> **版本**: 1.0.0

## 决策内容

### 核心原则

> **让 AI 改逻辑，不让 AI 改结构**

Moodify 项目采用 NodeSplit 架构，将系统分为三层，严格控制 AI 修改范围。

### 三层架构

| 层级 | 状态 | 说明 |
|------|------|------|
| UI 层 | **锁定** | `src/components/*.tsx`，禁止结构性修改 |
| Node 层 | **可改逻辑** | `src/hooks/*.ts`，只改业务逻辑 |
| Flow 层 | **配置驱动** | `ports.json`, `.nodesplit.json` |

### 修改权限矩阵

| 操作类型 | UI 层 | Node 层 | Flow 层 |
|---------|-------|---------|---------|
| 样式/配色 | ✅ 可以 | ✅ 可以 | ❌ 不需要 |
| 组件结构 | ❌ 禁止 | ❌ 禁止 | ❌ 不需要 |
| 业务逻辑 | ❌ 禁止 | ✅ 可以 | ❌ 不需要 |
| 数据处理 | ❌ 禁止 | ✅ 可以 | ❌ 不需要 |
| 配置参数 | ❌ 禁止 | ❌ 禁止 | ✅ 可以 |

### 防崩规则

1. **UI 锁定**: 组件结构一旦确定，除非用户明确要求，否则不修改
2. **单节点修改**: 一次只修改一个 Node，不跨文件修改业务逻辑
3. **错误隔离**: 修改 Node 层不影响 UI 层，UI 永远保持可用
4. **强制输入输出**: 每个 hook 必须有明确的输入和输出

### 典型错误

| 错误做法 | 正确做法 |
|----------|----------|
| ❌ 在 `MainContent.tsx` 中直接写 API 调用逻辑 | ✅ 将 API 调用封装到 `src/hooks/useO3ics.ts` |
| ❌ 修改组件的 JSX 结构来"快速修复" | ✅ 在对应的 hook 中修改逻辑 |
| ❌ 在 UI 组件中使用 useState 存储业务数据 | ✅ 使用 zustand store（`src/stores/`） |
| ❌ 硬编码端口号分散在多个文件 | ✅ 统一在 `ports.json` 中管理 |

### 约束契约

```yaml
# contracts/nodesplit.yaml
nodesplit:
  layers:
    - name: "UI"
      status: "locked"
      pattern: "*.tsx in src/components/"
    - name: "Node"
      status: "logic_only"
      pattern: "*.ts in src/hooks/"
    - name: "Flow"
      status: "config_driven"
      pattern: "ports.json, .nodesplit.json"

  rules:
    - "UI 结构永久锁定"
    - "一次只修改一个 Node"
    - "错误隔离，Node 崩溃不影响 UI"
    - "强制输入输出接口"

  quick_reference:
    modify_color: "src/index.css, tailwind.config.js"
    modify_logic: "src/hooks/*.ts"
    modify_structure: "❌ 禁止"
    add_feature: "在 src/hooks/ 创建新文件"
    modify_port: "ports.json"
```

## 影响范围

- 所有 AI 修改必须遵循此权限矩阵
- 违反规则的修改必须回滚
- 架构验证工具检查合规性

## 修订历史

| 日期 | 版本 | 修改内容 | 决策者 |
|------|------|----------|--------|
| 2026-04-13 | 1.0.0 | 初始版本 | 团队 |
