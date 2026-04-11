# Moodify O3ics - AI 歌词创作工具

一个基于 AI 的歌词生成工具，支持通过规则引擎自定义创作风格，让每一条规则都成为你的创作资产。

## 特性

- **规则引擎**: 自定义情感、主题、风格等创作规则
- **AI 生成**: 基于 DeepSeek API 智能生成歌词
- **社区分享**: 支持导入/导出规则包，与社区共享创作资产
- **项目管理**: 按项目组织歌词创作历史
- **Suno 集成**: 可将歌词提交至 Suno 生成音乐

## 技术栈

- **前端**: React + TypeScript + TailwindCSS
- **桌面**: Electron
- **后端**: Prisma + SQLite
- **AI**: DeepSeek API

## 开发

```bash
# 安装依赖
npm install

# 生成 Prisma Client
npx prisma generate

# 运行开发服务器
npm run dev
```

## 规则格式

规则采用 JSON 格式，方便分享和导入：

```json
{
  "name": "失恋疗愈",
  "type": "emotion",
  "author": "社区用户A",
  "version": "1.0",
  "tags": ["爱情", "治愈", "释怀"],
  "description": "适合表达失恋后逐渐释怀的情���",
  "config": "放下\n释然\n解脱\n从容\n淡然\n释怀"
}
```

## 许可证

MIT License
