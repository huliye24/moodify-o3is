# Moodify 分形结构树

> NodeNet 架构在 Moodify 项目中的完整映射

---

## 整体树状结构

```
Moodify (Root)
│
├── L1: 结构层 (UI Layer) — 锁定
│   │
│   ├── App.tsx                    [页面路由 / Tab 切换]
│   │   │
│   │   ├── LyricsPage             [歌词创作页面]
│   │   │   ├── ProjectSelector    [项目选择器] ← L1
│   │   │   ├── ParamsSelector     [参数选择器] ← L1
│   │   │   ├── LyricsEditor       [歌词编辑器] ← L1
│   │   │   ├── O3icsList          [歌词列表] ← L1
│   │   │   └── RulesSection       [规则区域] ← L1
│   │   │
│   │   ├── MoodPage               [情绪播放页面]
│   │   │   └── (内联组件)         [情绪卡片 / 播放控制] ← L1
│   │   │
│   │   ├── LibraryPage            [本地乐库页面]
│   │   │   └── (内联组件)         [歌曲列表 / 搜索] ← L1
│   │   │
│   │   └── BrandPage              [品牌故事页面]
│   │       └── (内联组件)         [章节内容] ← L1
│   │
│   └── SunoPrompts                [Suno提示词卡片] ← L1
│   └── RulesModal                 [规则弹窗] ← L1
│
├── L2: 逻辑层 (Node Layer) — 可改逻辑
│   │
│   ├── useProjects.ts             [项目 Node]
│   │   ├── input: 项目名称
│   │   ├── process: 创建/查询/删除
│   │   └── output: Project[]
│   │
│   ├── useO3ics.ts               [歌词生成 Node]
│   │   ├── input: content + params
│   │   ├── process: 调用 API 生成
│   │   └── output: GenerateResponse
│   │
│   ├── useRules.ts               [规则引擎 Node]
│   │   ├── input: 规则类型
│   │   ├── process: 加载/创建/导入/导出
│   │   └── output: Rule[]
│   │
│   ├── useOptions.ts              [配置 Node]
│   │   ├── input: 无
│   │   ├── process: 加载选项
│   │   └── output: Options
│   │
│   └── store/index.ts            [全局状态 Store]
│       ├── projects, currentProject
│       ├── o3icsList, rules, options
│       └── set*, add*, remove*, update* 方法
│
├── L3: 配置层 (Flow Layer) — JSON 驱动
│   ├── ports.json                [端口配置]
│   ├── .nodesplit.json            [架构规范]
│   └── vite.config.ts             [Vite 代理配置]
│
└── 后端 (独立)
    └── backend/                   [Go API 服务 :3001]
```

---

## 当前违反 NodeNet 原则的问题

| 问题 | 位置 | 违反规则 |
|------|------|----------|
| 所有 hooks 写在一个文件 | `src/hooks/index.ts` | Node 隔离原则 |
| Tab 页面直接内联在 App.tsx | `App.tsx` (MoodPage 等) | L1/L2 边界模糊 |
| RulesSection 放在 hooks/index.ts | `RulesSection` 组件 | 组件混入 L2 |

---

## 重构计划

### Phase 1: Node 拆分（立即）

将 `src/hooks/index.ts` 拆分为独立文件：

```
src/hooks/
├── index.ts              [导出汇总]
├── useProjects.ts        [新文件]
├── useO3ics.ts          [新文件]
├── useRules.ts          [新文件]
├── useOptions.ts        [新文件]
└── RulesSection.tsx     [从 hooks/index.ts 移出 → L1]
```

### Phase 2: 页面提取

将 `App.tsx` 中的页面提取为独立文件：

```
src/pages/
├── LyricsPage.tsx       [新文件]
├── MoodPage.tsx         [新文件]
├── LibraryPage.tsx      [新文件]
└── BrandPage.tsx        [新文件]
```

### Phase 3: 可视化编辑器（未来）

基于分形树结构，开发类似 ComfyUI 的节点编辑器。

---

## 改动影响分析

| 改动范围 | 影响 |
|---------|------|
| 拆分 hooks | 只影响导入路径，无功能影响 |
| 提取页面 | 只影响 App.tsx 的引用 |
| 样式/配色 | 只影响 index.css 和内联 style |

> **所有改动都在叶子节点进行，不影响上层结构**