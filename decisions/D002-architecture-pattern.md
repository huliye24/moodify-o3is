# D002: 架构模式

> **ID**: D002
> **状态**: approved
> **日期**: 2026-04-13
> **版本**: 1.0.0

## 决策内容

### 整体架构模式

采用 **分层架构 + 模块化插件** 模式：

```
┌─────────────────────────────────────────────────────────────┐
│                      表现层                                  │
│  Electron 客户端 │ Web SPA │ CLI 工具                      │
├─────────────────────────────────────────────────────────────┤
│                      网关层                                  │
│              IPC / REST API / WebSocket                     │
├─────────────────────────────────────────────────────────────┤
│                      服务层                                  │
│    业务逻辑服务 │ 数据服务 │ 集成服务 (Suno API)           │
├─────────────────────────────────────────────────────────────┤
│                      基础设施层                              │
│         Go Runtime │ Python Worker │ SQLite                 │
└─────────────────────────────────────────────────────────────┘
```

### 模块划分

| 模块 | 职责 | 技术 |
|------|------|------|
| `frontend` | UI 展示和交互 | React + Zustand |
| `electron` | 桌面应用入口 | Electron + IPC |
| `backend` | 业务逻辑 API | Go + Gin |
| `prisma` | 数据库 ORM | Prisma Client |
| `python` | 音频处理 | Python subprocess |

### IPC 通信模式

```
前端 (React)
    ↓
Electron Preload (暴露 API)
    ↓
Main Process (Node.js)
    ↓
IPC 通道
    ↓
Go 后端服务 (HTTP/gRPC)
```

### 数据流

```
用户操作 → 前端状态 → IPC 调用 → Go API
    → 业务处理 → Prisma/SQLite
    → Python Worker (可选) → 音频处理
    → 响应 → 状态更新 → UI 渲染
```

### 约束契约

```yaml
# contracts/architecture.yaml
architecture:
  pattern: "layered_module"
  
layers:
  - name: "presentation"
    components: ["electron", "frontend"]
  - name: "gateway"
    components: ["ipc", "rest_api", "websocket"]
  - name: "service"
    components: ["api_handlers", "business_logic"]
  - name: "infrastructure"
    components: ["go_runtime", "python_worker", "sqlite"]

communication:
  frontend_to_electron: "ipc_invoke"
  electron_to_backend: "http_post"
  backend_to_python: "subprocess_json"
  
constraints:
  max_layer_depth: 4
  no_circular_dependency: true
  service_boundaries: "per_feature"
```

## 理由

### 选择分层架构的理由
- 结构清晰，职责分明
- 易于团队分工
- 便于测试和替换
- 符合直觉，便于新人上手

### 选择 IPC 通信的理由
- Electron 原生支持
- 安全性好（contextBridge）
- 性能足够（JSON 序列化）

## 影响范围

- 新模块必须遵循分层原则
- 跨层调用必须通过定义好的接口
- 模块间不能有循环依赖

## 约束规则

1. **单向依赖**: 上层依赖下层，下层不能依赖上层
2. **接口隔离**: 通过接口通信，不直接引用
3. **无循环依赖**: 模块依赖图必须是 DAG
4. **最小化共享**: 共享代码放到公共模块

## 修订历史

| 日期 | 版本 | 修改内容 | 决策者 |
|------|------|----------|--------|
| 2026-04-13 | 1.0.0 | 初始版本 | 团队 |
