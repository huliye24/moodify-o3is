# Phase 1: 核心框架搭建

## 阶段目标

在 7 天内完成可运行的基础版本，具备以下能力：
- 音频文件 → 乐谱提取
- 乐谱 → Prompt 生成
- 基于乐谱的相似歌曲搜索
- 完整的 Electron 应用

## 时间安排

| 天数 | 任务 | 产出 |
|------|------|------|
| Day 1-2 | 项目初始化 + 核心框架 | 项目结构、数据库、插件骨架 |
| Day 3-4 | 核心插件实现 | Extractor、Comparator、Encoder、Generator |
| Day 5 | 服务层 + API | REST API、WebSocket |
| Day 6 | 前端集成 | Electron UI |
| Day 7 | 测试 + 优化 + 发布 | 可执行文件 |

---

## 技术选型

| 组件 | 选择 | 理由 |
|------|------|------|
| 提取器 | BasicPitch (Spotify) | 开源、Python、支持旋律+和弦 |
| 比对器 | DTW | 动态时间规整，旋律比对标准方法 |
| 编码器 | RuleEncoder | 基于规则，无依赖 |
| 向量库 | Qdrant | 功能全，支持过滤 |
| Prompt 生成 | 规则映射 | 无需 LLM，快速上线 |
| 数据库 | SQLite | 单文件，无需部署 |

---

## 任务清单

### Day 1-2: 项目初始化 + 核心框架

- [ ] 01-项目初始化
  - [ ] 项目目录结构创建
  - [ ] Go + Python 项目配置
  - [ ] 依赖安装 (go.mod, requirements.txt)
  - [ ] 数据库 Schema 设计
  - [ ] README.md 编写

- [ ] 02-核心框架搭建
  - [ ] TypeScript 接口定义
  - [ ] 乐谱数据结构 (Score)
  - [ ] 插件基类实现
  - [ ] 插件注册表实现
  - [ ] 配置文件加载

### Day 3-4: 核心插件实现

- [ ] 03-插件系统实现
  - [ ] BasicPitchExtractor 插件
  - [ ] DTWComparator 插件
  - [ ] RuleEncoder 插件
  - [ ] QdrantStore 插件
  - [ ] RuleGenerator 插件

### Day 5: 服务层 + API

- [ ] 04-服务层实现
  - [ ] AudioAnalysisService
  - [ ] SimilarityService
  - [ ] PromptService

- [ ] 05-API层实现
  - [ ] REST API 路由
  - [ ] WebSocket 进度推送
  - [ ] 错误处理
  - [ ] 日志系统

### Day 6: 前端集成

- [ ] 06-前端集成
  - [ ] Electron 主进程
  - [ ] IPC 通信
  - [ ] 分析面板 UI
  - [ ] 相似歌曲面板
  - [ ] 批量分析 UI

### Day 7: 测试 + 优化 + 发布

- [ ] 07-测试与发布
  - [ ] 单元测试
  - [ ] 集成测试
  - [ ] 性能优化
  - [ ] 打包发布
  - [ ] 文档完善

---

## 成功标准

- [ ] 单个音频文件分析时间 < 10 秒
- [ ] 批量分析支持进度显示
- [ ] 相似歌曲搜索准确率 > 70%
- [ ] Electron 应用可正常启动
- [ ] 可生成有效的 Suno Prompt

---

## 文档更新记录

| 日期 | 更新内容 | 状态 |
|------|----------|------|
| 2026-04-13 | 创建 Phase 1 文档 | 进行中 |
