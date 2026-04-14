# Moodify NodeSplit 架构规则

## 核心原则

> **让 AI 改逻辑，不让 AI 改结构**

Moodify 项目采用 NodeSplit 架构，将系统分为三层，严格控制 AI 修改范围。

---

## 三层架构

### 1. UI 层 — 锁定层（`src/components/`）

**状态：锁定，禁止结构性修改**

- 组件的 JSX 结构、props、state 逻辑**不可修改**
- AI **只能**调整样式、颜色、CSS className
- 如果需要改功能，必须在 Node 层实现

### 2. Node 层 — 逻辑层（`src/hooks/`）

**状态：可修改，但只改逻辑**

- 业务逻辑、数据处理、API 调用在这里
- 每个 hook 是一个独立的 Node
- AI 只能修改对应 Node 的内部逻辑
- **禁止**跨 Node 修改代码

### 3. Flow 层 — 配置层（`ports.json`, `.nodesplit.json`）

**状态：配置驱动**

- 端口配置、流程配置通过 JSON 文件管理
- 修改流程不需要改代码

---

## 修改权限矩阵

| 操作类型 | UI 层 | Node 层 | Flow 层 |
|---------|-------|---------|---------|
| 样式/配色 | ✅ 可以 | ✅ 可以 | ❌ 不需要 |
| 组件结构 | ❌ 禁止 | ❌ ��止 | ❌ 不需要 |
| 业务逻辑 | ❌ 禁止 | ✅ 可以 | ❌ 不需要 |
| 数据处理 | ❌ 禁止 | ✅ 可以 | ❌ 不需要 |
| 配置参数 | ❌ 禁止 | ❌ 禁止 | ✅ 可以 |

---

## 开发规范

### 修改已有功能

1. 找到对应的 Node 文件（`src/hooks/*.ts`）
2. 只修改该文件中的逻辑代码
3. 如果需要新参数，通过 props 传递，不改组件结构

### 新增功能

1. 在 `src/hooks/` 下创建新的 Node 文件
2. 在 UI 组件中通过 props 使用新 Node
3. 不修改现有组件的 JSX 结构

### 修改配色/样式

1. 定位到 `src/index.css` 或对应的 `.module.css`
2. 只修改颜色值和样式
3. **不修改组件的 HTML 结构**

---

## 防崩规则

### 规则 1：UI 锁定
组件结构一旦确定，除非用户明确要求，否则不修改。

### 规则 2：单节点修改
一次只修改一个 Node，不跨文件修改业务逻辑。

### 规则 3：错误隔离
修改 Node 层不影响 UI 层，UI 永远保持可用。

### 规则 4：强制输入输出
每个 hook 必须有明确的输入（props/state）和输出（返回值/回调）。

---

## 文件路径参考

- **UI 组件**：`src/components/*.tsx`（锁定）
- **业务逻辑**：`src/hooks/*.ts`（可改逻辑）
- **状态管理**：`src/stores/*.ts`（可改逻辑）
- **样式**：`src/index.css`（可改样式）
- **配置**：`ports.json`、`.nodesplit.json`
- **后端**：`backend/`（Go 服务，独立修改）

---

## 违反架构的典型错误

❌ 在 `MainContent.tsx` 中直接写 API 调用逻辑
✅ 将 API 调用封装到 `src/hooks/useO3ics.ts`

❌ 修改组件的 JSX 结构来"快速修复"
✅ 在对应的 hook 中修改逻辑

❌ 在 UI 组件中使用 useState 存储业务数据
✅ 使用 zustand store（`src/stores/`）

❌ 硬编码端口号分散在多个文件
✅ 统一在 `ports.json` 中管理

---

## 快速参考

**修改配色？** → `src/index.css`、tailwind.config.js
**修改业务逻辑？** → `src/hooks/*.ts`
**修改组件结构？** → ❌ 禁止，联系用户确认需求
**新增功能？** → 在 `src/hooks/` 创建新文件
**修改端口？** → `ports.json`