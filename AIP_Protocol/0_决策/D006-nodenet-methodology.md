# D006: NodeNet 方法论

> **ID**: D006
> **状态**: approved
> **日期**: 2026-04-13
> **版本**: 1.0.0

## 决策内容

> 软件开发的本质，是对结构进行分形拆解，使所有改动收敛到最小单元，从而实现系统稳定与可演化。

### 核心定义

**NodeNet** = Node（节点）+ Network（网络）

- **Node**：最小的结构单元，每个 Node 有明确的输入、处理、输出
- **Network**：由多个 Node 组成的结构树，上层 Node 组合下层 Node

### 三层结构模型

| 层级 | 名称 | 状态 | 职责 | 文件位置 |
|------|------|------|------|----------|
| L1 | 结构层 | LOCKED | 定义"是什么" | `src/components/*.tsx` |
| L2 | 逻辑层 | LOGIC_ONLY | 定义"怎么做" | `src/hooks/*.ts`, `src/stores/*.ts` |
| L3 | 配置层 | CONFIG_DRIVEN | 定义"用什么配置" | `ports.json`, `.nodesplit.json` |

### 分形拆分原则

一个 Node 满足以下全部条件时，才应该被拆分：

1. 有**独立的输入**（明确的入参）
2. 有**独立的输出**（明确的返回值）
3. 可以**独立测试**（不依赖其他 Node 的内部实现）
4. 有**明确的边界**（不跨文件修改）

### 人机协作范式

| 角色 | 职责 | 范围 |
|------|------|------|
| 人 | 结构设计 | L1 (决定有哪些Node) |
| AI | 逻辑实现 | L2 (实现Node内部) |
| 配置 | 参数驱动 | L3 (JSON配置) |

### 防崩策略

1. **结构锁定**: L1 层组件的 JSX 结构、props 接口永久锁定
2. **单节点修改**: 一次只修改一个 Node，不跨 Node 写逻辑
3. **接口不变**: Node 的输入输出接口保持稳定
4. **错误隔离**: 单个 Node 崩溃不影响其他 Node

### 约束契约

```yaml
# contracts/nodenet.yaml
nodenet:
  layers:
    - name: "L1"
      type: "structure"
      status: "locked"
      files: ["src/components/*.tsx"]
    - name: "L2"
      type: "logic"
      status: "logic_only"
      files: ["src/hooks/*.ts", "src/stores/*.ts"]
    - name: "L3"
      type: "config"
      status: "config_driven"
      files: ["ports.json", ".nodesplit.json"]

  rules:
    - "UI 层结构永久锁定"
    - "一次只修改一个 Node"
    - "Node 接口保持稳定"
    - "错误隔离，单节点崩溃不影响整体"
```

## 影响范围

- 所有 React 组件修改必须遵循三层分离
- AI 修改只能操作 L2 层逻辑
- L1 层结构变更必须用户明确授权

## 修订历史

| 日期 | 版本 | 修改内容 | 决策者 |
|------|------|----------|--------|
| 2026-04-13 | 1.0.0 | 初始版本 | 团队 |
