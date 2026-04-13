# 1_roadmap - 可演化的科技树

此目录包含 Moodify 项目的技术演进路线图，定义"什么时间做什么事"。

## 目录结构

```
1_roadmap/
├── README.md                # 本文件
├── components/              # 组件定义与依赖
│   ├── definition.yaml      # 组件清单
│   ├── dependencies.yaml    # 依赖关系图
│   └── architecture.mmd     # Mermaid 架构图
├── evolution/               # 演进路线
│   ├── monthly/             # 月度里程碑
│   │   ├── M01-核心框架.md
│   │   ├── M02-创作流程.md
│   │   └── ...
│   └── weekly/              # 周任务分解
└── diagrams/                # 架构图源文件
    ├── architecture.mmd
    └── dataflow.mmd
```

## 更新频率

- **月度更新**：每月初更新当月目标
- **周度同步**：每周五根据任务进度调整
- **实时调整**：遇到重大变更时立即更新

## 节点状态

| 状态 | 说明 |
|------|------|
| `planned` | 计划中，未开始 |
| `in_progress` | 进行中 |
| `completed` | 已完成 |
| `blocked` | 被阻塞，需解决依赖 |

## 快速导航

- [技术路线总览](./README.md)
- [月度里程碑](../roadmap/README.md)
- [组件定义](./components/definition.yaml)
