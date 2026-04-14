# D001: 技术栈选择

> **ID**: D001
> **状态**: approved
> **日期**: 2026-04-13
> **版本**: 1.0.0

## 决策内容

### 前端技术栈

| 层级 | 技术 | 版本 | 理由 |
|------|------|------|------|
| 框架 | React | 18.x | 生态成熟，组件化强 |
| 构建 | Vite | 5.x | 极速 HMR，开发体验好 |
| 桌面 | Electron | 28.x | 跨平台桌面首选 |
| 状态 | Zustand | 4.x | 轻量、TypeScript 友好 |
| 样式 | Tailwind CSS | 3.x | 原子化，开发效率高 |
| 图标 | Lucide React | 最新 | 简洁现代 |

### 后端技术栈

| 层级 | 技术 | 版本 | 理由 |
|------|------|------|------|
| 语言 | Go | 1.21+ | 高性能、内置并发、静态编译 |
| HTTP | Gin | 最新 | 轻量、路由性能优秀 |
| ORM | Prisma | 5.x | 类型安全、迁移方便 |
| 数据库 | SQLite | 3.x | 单文件、无需部署 |

### Python 集成

| 用途 | 技术 | 理由 |
|------|------|------|
| 音频处理 | Python subprocess | 成熟生态、避免 Go 重造轮子 |
| 未来扩展 | (预留) | 可扩展为微服务 |

### 约束契约

```yaml
# contracts/tech-stack.yaml
tech_stack:
  frontend:
    react: ">=18.0"
    vite: ">=5.0"
    electron: ">=28.0"
    zustand: ">=4.0"
    tailwind: ">=3.0"

  backend:
    go: ">=1.21"
    gin: "latest"
    prisma: ">=5.0"
    sqlite: ">=3.0"

  python:
    version: ">=3.10"
    use_case: "audio_processing"
    integration: "subprocess_json_stdio"

performance_targets:
  cold_start_ms: 3000
  hot_reload_ms: 100
  api_response_p99_ms: 200
```

## 理由

### 选择 Electron 的理由
- 一次开发，多平台运行
- Web 技术栈统一
- Node.js 原生集成

### 选择 Go 的理由
- 高性能静态编译二进制
- 内置并发，原生支持高并发
- 内存占用小，适合桌面应用
- 编译后无依赖

### 选择 SQLite 的理由
- 单文件，迁移简单
- 无需服务进程
- 性能足够小规模使用
- 跨平台兼容

### 选择 Python subprocess 的理由
- Python 音频处理生态成熟 (librosa, basic-pitch)
- 避免 Go 重写轮子
- 通过 JSON STDIO 通信，简单可靠

## 影响范围

- 项目结构按此技术栈组织
- CI/CD 流程按此技术栈配置
- 新功能开发优先使用现有技术栈

## 回滚条件

如果 Electron 性能问题无法解决，可考虑迁移到 Tauri。
如果 Go 性能不达预期，可考虑 Rust 重写核心模块。

## 替代方案考虑

| 方案 | 优点 | 缺点 | 放弃原因 |
|------|------|------|----------|
| Tauri | 更小更快 | 生态较弱 | Web 开发者少 |
| React Native | 更小更快 | 不适合桌面 | 桌面功能受限 |
| 纯 Python | 开发快 | 性能差 | GIL 限制并发 |

## 修订历史

| 日期 | 版本 | 修改内容 | 决策者 |
|------|------|----------|--------|
| 2026-04-13 | 1.0.0 | 初始版本 | 团队 |
