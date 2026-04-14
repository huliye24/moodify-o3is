# 0_决策 - 不可变意图

此目录包含 Moodify 项目的宪法级文件，定义项目的终极目标、约束条件和价值判断。

**核心原则**：
- 一旦批准，永久锁定
- 修改需经过正式评审
- 是技术决策的上层约束

## 文件说明

| 文件 | 用途 | 修改频率 |
|------|------|----------|
| `愿景.yaml` | 项目终极目标与成功标准 | 极少修改 |
| `约束.yaml` | 硬性技术与非技术约束 | 极少修改 |
| `价值观.yaml` | 核心价值判断与优先级 | 从不修改 |

## 决策流程

```
1. 提出提案 → 创建决策文档草稿
2. 团队评审 → 讨论影响与风险
3. 批准/拒绝 → 状态更新为 approved/rejected
4. 实施 → 创建任务并执行
5. 归档 → 移动到 decisions/ 历史目录
```

## 快速导航

- [D000: 核心愿景](./decisions/D000-core-vision.md)
- [D001: 技术栈选择](./decisions/D001-tech-stack.md)
- [D002: 架构模式](./decisions/D002-architecture-pattern.md)
- [D003: 数据策略](./decisions/D003-data-strategy.md)
- [D004: 部署模式](./decisions/D004-deployment-model.md)
- [D005: 一年演进计划](./decisions/D005-evolution-plan.md)
- [D006: NodeNet 方法论](./decisions/D006-nodenet-methodology.md)
- [D007: 分形树结构](./decisions/D007-fractal-tree.md)
- [D008: NodeSplit 规则](./decisions/D008-nodesplit-rules.md)

---

> **注意**：此目录下的文件是动态的，已批准的决策会移动到 `decisions/` 归档。
