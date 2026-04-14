# D003: 数据策略

> **ID**: D003
> **状态**: approved
> **日期**: 2026-04-13
> **版本**: 1.0.0

## 决策内容

### 存储策略

| 数据类型 | 存储位置 | 技术 | 说明 |
|----------|----------|------|------|
| 结构化数据 | 本地文件 | SQLite + Prisma | 项目、歌词、规则 |
| 用户媒体 | 本地文件 | 文件系统 | 音频文件、封面 |
| 应用配置 | 本地文件 | electron-store | 用户偏好 |
| 临时数据 | 内存 | 内存/文件 | 缓存、会话 |

### 数据库 Schema 概览

```prisma
// 核心模型
Project        // 项目
Lyrics         // 歌词
MusicTrack     // 生成的音轨
Rule           // 创作规则

// 本地音乐库
LocalArtist    // 本地艺术家
LocalAlbum     // 本地专辑
LocalSong      // 本地歌曲
LocalPlaylist  // 本地播放列表
```

### 数据安全策略

1. **隐私优先**: 所有数据本地存储，不上传云端
2. **文件隔离**: 媒体文件存放在独立目录
3. **备份机制**: 支持导出/导入完整数据
4. **清理机制**: 支持清理临时文件和缓存

### 约束契约

```yaml
# contracts/data-strategy.yaml
data_strategy:
  primary_storage: "sqlite_local"
  media_storage: "filesystem"
  config_storage: "electron_store"
  
  paths:
    db: "./data/moodify.db"
    media: "./data/library/"
    cache: "./data/cache/"
    backup: "./data/backup/"
    
  retention:
    cache_days: 7
    backup_versions: 5
    
  limits:
    max_file_size_mb: 100
    max_library_size_gb: 100
    max_projects: 1000
```

## 理由

### SQLite 的优势
- 单文件，迁移简单
- 无需服务进程
- 性能足够小规模使用
- 跨平台兼容

### 文件系统存储的理由
- 大文件不适合数据库存储
- 便于媒体播放器直接访问
- 减少内存压力

## 影响范围

- 数据迁移方案必须支持 SQLite
- 文件路径必须可配置
- 必须支持数据导出/导入

## 修订历史

| 日期 | 版本 | 修改内容 | 决策者 |
|------|------|----------|--------|
| 2026-04-13 | 1.0.0 | 初始版本 | 团队 |
