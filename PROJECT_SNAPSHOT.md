# Moodify 项目快照
> 本文件由 Cursor AI 自动生成和维护
> 最后更新时间：2026-04-10

---

## 1. 项目概览

| 项目 | 详情 |
|------|------|
| **项目名称** | Moodify |
| **当前版本状态** | v1.0.3（桌面端支持版） |
| **项目类型** | 情绪化音乐平台 + 智能歌词生成器 |
| **主要技术栈** | React 18 + TypeScript + Zustand + Tailwind CSS + Flask + SQLite + Electron（桌面端） |
| **运行环境** | Node.js 18+ / Python 3.8+ / Electron 28 |

---

## 2. 完整文件树

```
C:\Users\Administrator\Desktop\moodify\
│
├── package.json                        # 项目配置（npm scripts + 依赖）
├── index.html                         # React SPA 入口（16行）
│
├── server.py                          # Flask API 服务器（273行）
├── database.py                        # SQLite 数据库管理（380行）
├── moodify.db                         # SQLite 数据库文件
│
├── desktop/                           # ⭐ 桌面端（Electron）
│   ├── main.js                        # 桌面端主进程（直接加载 app.html）
│   ├── preload.js                     # 预加载脚本（暴露桌面 API）
│   └── electron-builder.js            # 打包配置
│
├── src/                               # React TypeScript 前端（歌词生成器）
│   ├── main.tsx                       # React 入口（10行）
���   ├── App.tsx                       # 主应用组件（36行）
│   ├── index.css                      # Tailwind CSS 入口（59行）
│   ├── types/
│   │   └── index.ts                  # TypeScript 类型定义（109行）
│   ├── stores/
│   │   └── useStore.ts               # Zustand 状态管理（322行）
│   └── components/
│       ├── Sidebar.tsx               # 侧边栏（215行）
│       ├── MainContent.tsx           # 主内容区（399行）
│       ├── RulesModal.tsx            # 规则管理弹窗（295行）
│       └── SettingsModal.tsx         # 设置弹窗（124行）
│
├── moodify_web/                       # 静态前端（SPA + 艺术化着陆页）
│   ├── index.html                    # 情绪潮汐着陆页（427行）
│   ├── app.html                      # ⭐ SPA 单页应用入口（204行）前言已植入
│   ├── playlist.html                  # 歌单管理页面（527行）
│   ├── videos.html                   # 视频管理页面（480行）
│   ├── boundary.html                  # 音乐边界说明页（249行）
│   ├── voice.html                    # 品牌声音页（365行）
│   ├── products.html                 # 情绪容器产品页（309行）
│   │
│   ├── css/
│   │   ├── style.css                 # 全局样式（1789行）
│   │   ├── app.css                  # ⭐ SPA + 播放器 + 前言样式（~760行）
│   │   ├── player.css               # 播放器样式（630行）
│   │   ├── playlist.css             # 歌单页面样式（598行）
│   │   ├── voice.css                # 品牌声音页样式（871行）
│   │   ├── boundary.css             # 音乐边界页样式（676行）
│   │   └── products.css             # 产品页样式（582行）
│   │
│   ├── js/
│   │   ├── main.js                  # 主脚本（407行）
│   │   ├── app.js                  # ⭐ SPA 应用 + 播放器核心（~500行）前言导航已添加
│   │   ├── player.js                # 播放器核心类（493行）
│   │   ├── voice.js                 # 品牌声音页脚本（157行）
│   │   ├── boundary.js             # 音乐边界页脚本（112行）
│   │   └── products.js             # 产品页脚本（106行）
│   │
│   └── music/
│       └── README.md
│
└── music/                             # 音乐文件夹（用户上传）
└── videos/                            # 视频文件夹（按子文件夹分类）
```

---

## 3. 重要文件详解

### 3.1 `moodify_web/app.html` — SPA 单页应用入口（204行）

**主要作用：** Moodify 的核心 SPA 入口，整合了导航、4个页面 section、情绪潮汐选择器、创始人前言、持久化播放器和"开始聆听"按钮。

**核心结构：**
```html
<nav class="nav">                    <!-- 固定顶部导航（4个链接）-->
    <a data-page="index">情绪潮汐</a>
    <a data-page="boundary">音乐边界</a>
    <a data-page="products">情绪容器</a>
    <a data-page="voice">品牌声音</a>
</nav>

<main id="app-content">             <!-- 4个页面 section -->
    <section id="page-index" style="display:block">
        <!-- Hero 区 + 雾层 + 粒子 -->
        <!-- ⭐ 宣言钩子（点击跳转前言）-->
        <!-- ⭐ 情绪潮汐选择器（4个圆形按钮，点击切换音乐） -->
    </section>
    <section id="page-boundary" style="display:none"> <!-- 音乐边界 -->
    <section id="page-products" style="display:none"><!-- 情绪容器 -->
    <section id="page-voice" style="display:none">
        <!-- Hero + ⭐ 创始人前言区块（完整前言+签名）-->
</main>
```

**前言区块结构（foreword-section）：**
- 章节标签：`前言 · From Prompt to Profit`
- 标题：`两个词之间，隔着一整个时代。`
- 正文：完整前言（一字不改）
- 签名：`欢迎登船。Moodify创始人 2026年4月`
- 装饰：翻页纹理背景 + 波浪线条

**宣言钩子结构（manifesto-hook）：**
- 位置：Hero slogan 下方，scroll-hint 上方
- 内容：`从 Prompt 到 Profit，记录 AI 做不到的事。`
- 行为：点击跳转到 `#page-voice`，自动滚动到前言区块

<div id="persistent-player">         <!-- ⭐ 持久播放器（底部常驻）-->
    <canvas id="waveform-canvas">   <!-- 波形可视化 -->
    <div id="track-cover">          <!-- 封面（带情绪徽章）-->
    <div id="track-title/artist">  <!-- 歌曲信息 -->
    <div id="btn-play/prev/next">  <!-- 控制按钮 -->
    <div id="progress-bar/fill">   <!-- 进度条（支持触屏） -->
    <div id="volume-control">       <!-- 音量静音 -->
    <div id="btn-loop/like">        <!-- 循环+收藏 -->
</div>

<div id="listen-btn">              <!-- 开始聆听按钮（2秒淡入）-->
```

---

### 3.2 `js/app.js` — 完整播放器 + 路由 + 情绪绑定（~490行）

**主要作用：** SPA 路由控制 + 完整播放器功能 + 情绪潮汐绑定 + 波形可视化 + 键盘快捷键。

**核心新增功能（v1.0.1）：**
- 情绪潮汐选择器（点击即切歌 + 播放）
- "开始聆听"按钮隐藏后可重新唤起（通过 `hidePlayer()` 方法）
- 进度条支持触屏拖拽
- 键盘 `1-4` 快速切换情绪

**内置示例歌单（硬编码）：**
```javascript
this.playlist = [
    { name: '蜷缩 · 深蓝呼吸', mood: 'coil', color: '#6B7A8F',
      url: 'https://cdn.pixabay.com/...' },
    { name: '迷茫 · 灰雾飘散', mood: 'lost', color: '#7A8A9F',
      url: 'https://cdn.pixabay.com/...' },
    { name: '觉醒 · 透光微暖', mood: 'awaken', color: '#A8B8C9',
      url: 'https://cdn.pixabay.com/...' },
    { name: '舒展 · 透明呼吸', mood: 'expand', color: '#C4D4E4',
      url: 'https://cdn.pixabay.com/...' }
];
```

**类方法一览：**

| 方法 | 功能 |
|------|------|
| `init()` | 初始化所有模块 |
| `initListenButton()` | "开始聆听"按钮 |
| `startListening()` | 显示播放器 + 自动播放 |
| `showPlayer() / hidePlayer()` | 显示/隐藏播放器（按钮重新出现）|
| `initNavigation()` | SPA 路由 + Hash 监听 |
| `navigateTo(page)` | 切换页面 + 更新 title |
| `initTidalSelector()` | **⭐ 情绪潮汐选择器事件** |
| `selectMood(index)` | **⭐ 切换情绪 + 加载音乐 + 播放** |
| `initPlayerControls()` | 所有播放器事件绑定（含触屏） |
| `loadTrack(index)` | 加载歌曲 + 更新封面颜色 + 更新潮汐选中状态 |
| `play() / pause() / togglePlay()` | 播放控制 |
| `onPlay() / onPause()` | UI 状态更新 + 波形动画开关 |
| `skipPrev() / skipNext()` | 切歌（支持索引循环） |
| `updateProgress() / updateDuration()` | 进度条实时更新 |
| `seek(e)` | 点击进度条跳转（支持触屏） |
| `toggleMute() / toggleLoop() / toggleLike()` | 辅助功能 |
| `initWaveAnimation()` | Canvas 波形初始化 |
| `drawIdleWave()` | 静态波形（暂停时） |
| `drawPlayingWave()` | 动态波形（播放时） |
| `initKeyboardShortcuts()` | 空格/↑↓/←→/1-4 快捷键 |

**键盘快捷键：**
```
空格键       → 播放/暂停
← / →      → 快退/快进 5 秒
↑ / ↓      → 音量增减 10%
1 / 2 / 3 / 4 → 快速切换蜷缩/迷茫/觉醒/舒展
```

---

### 3.3 `css/app.css` — SPA + 播放器 + 前言样式（~760行）

**新增样式模块：**
```css
.manifesto-hook              /* 宣言钩子（3秒淡入，hover 下划线）*/
.foreword-section             /* 前言容器（翻页纹理背景）*/
.foreword-body p              /* 前言正文（衬线字体，行高2）*/
.foreword-signature           /* 签名区块（分隔线+署名）*/
.foreword-wave-deco           /* 波浪装饰 SVG*/
```

---

### 3.4 `js/main.js` — 主脚本（407行）

**主要作用：** 导航、滚动动画、潮汐阶段动画、粒子效果、视差、键盘快捷键。

**核心函数一览：**

| 函数 | 行数 | 功能 |
|------|------|------|
| `initNavigation()` | 52-99 | 导航链接 + 滚动时高亮当前 section |
| `initScrollAnimations()` | 132-158 | IntersectionObserver 淡入动画 |
| `initTidalAnimation()` | 163-195 | 4阶段循环（4秒）+ 点击跳转 |
| `initAmbientParticles()` | 200-233 | Hero 区域环境粒子 |
| `initParallax()` | 256-287 | 雾层视差 + Hero 内容淡出 |
| `initSmoothScroll()` | 292-302 | 平滑滚动锚点 |
| `initKeyboardNavigation()` | 342-361 | `↑↓` / `j k` 切换页面 |
| `consoleEasterEgg()` | 392-406 | 控制台彩蛋信息 |

---

### 3.5 `server.py` — Flask API 服务器（273行）

**启动地址：** http://localhost:5000

**API 端点：**
- 歌单 CRUD：`/api/playlists`, `/api/playlists/<id>`
- 歌曲管理：`/api/songs`, `/api/songs/scan`
- 视频管理：`/api/video-folders`, `/api/videos/scan`
- 文件服务：`/music/<path>`, `/video/<path>`

---

### 3.6 `database.py` — SQLite 数据库管理（380行）

**数据库表结构：**
- `playlists` — 歌单
- `songs` — 歌曲
- `videos` — 视频
- `video_folders` — 视频文件夹

---

### 3.7 `src/` 目录（React SPA — 歌词生成器）

| 文件 | 行数 | 功能 |
|------|------|------|
| `App.tsx` | 36 | 主组件：侧边栏 + 主内容区 + 弹窗 |
| `stores/useStore.ts` | 322 | Zustand store：项目/歌词/规则/API Key 状态管理 |
| `components/MainContent.tsx` | 399 | 歌词生成主逻辑：输入文案 + 选择参数 + 调用 API |
| `components/Sidebar.tsx` | 215 | 项目列表 + 新建 + 规则管理入口 |
| `components/RulesModal.tsx` | 295 | 规则 CRUD：emotion/theme/style/rhyme/length 五维度 |
| `components/SettingsModal.tsx` | 124 | DeepSeek API Key 配置 |

---

## 4. 当前已实现的功能清单

### 4.1 MVP 核心功能（SPA — app.html）

| 功能 | 状态 | 说明 |
|------|------|------|
| SPA 页面切换（无刷新） | ✅ | Hash 路由 + pushState |
| 导航 active 高亮 | ✅ | |
| "开始聆听"按钮 | ✅ | 点击 → 显示播放器 + 自动播放 + 可重新唤起 |
| 持久播放器（底部常驻） | ✅ | slide-up 动画 |
| 播放/暂停 | ✅ | 图标切换 + 封面旋转 |
| 上一首/下一首 | ✅ | 4首情绪音乐循环 |
| 进度条（实时更新 + 点击跳转） | ✅ | 支持触屏 |
| 进度条 thumb 悬停放大 | ✅ | CSS 过渡动画 |
| 波形可视化（Canvas） | ✅ | 静态/动态柔和波浪动画 |
| 音量静音切换 | ✅ | 图标随状态变化 |
| 循环播放 | ✅ | 图标高亮 |
| 收藏 | ✅ | 心形变红 |
| 键盘快捷键 | ✅ | 空格/↑↓/←→/1-4 |
| 封面颜色随情绪变化 | ✅ | coil/lost/awaken/expand |
| **情绪潮汐选择器（核心新增）** | ✅ | 点击即切歌 + 播放 |
| **创始人前言区块** | ✅ | 完整前言一字不改，排版优雅 |
| **宣言钩子（Hero → 前言）** | ✅ | 点击跳转 + 自动滚动到前言 |
| 品牌声音页前言淡入动画 | ✅ | 前言区块 fadeIn 动画 |

### 4.2 原多页面静态站（index.html + 各子页面）

| 功能 | 状态 | 说明 |
|------|------|------|
| Hero 雾层动画 | ✅ | 三层视差雾 + 环境粒子 |
| 潮汐四阶段可视化 | ✅ | 4秒自动循环 + 点击跳转 |
| 四情绪层详情页 | ✅ | 蜷缩/迷茫/觉醒/舒展 |
| 情绪潮汐模型图 | ✅ | SVG 圆环 + 流程箭头 |
| 导航高亮 | ✅ | IntersectionObserver |
| 平滑滚动 | ✅ | easeOutQuart 缓动 |
| 键盘导航 | ✅ | ↑↓/jk/Home/End |
| 艺术化播放器 | ✅ | 柔和波浪 + 唱片旋转 |
| 歌单管理页面 | ✅ | CRUD + 扫描 |
| 视频管理页面 | ✅ | 文件夹 + 扫描 |
| 音乐边界页 | ✅ | 完整内容 |
| 品牌声音页 | ✅ | 完整内容 |
| 情绪容器页 | ✅ | 完整内容 |

### 4.3 智能歌词生成器（src/）

| 功能 | 状态 | 说明 |
|------|------|------|
| 项目管理（列表/新建/删除） | ✅ | |
| 歌词生成（调用 DeepSeek） | ✅ | 5维度参数选择 |
| 歌词保存 | ✅ | |
| 规则管理（5维度） | ✅ | CRUD + 启用禁用 |
| API Key 配置 | ✅ | 格式验证 |

---

## 5. 待办事项 & 已知问题

### 🔴 待完成

1. **示例歌单 CDN 音频** — 当前使用 Pixabay 公开音频，需替换为自有音乐文件
2. **Electron 打包** — 需配置 icon 和构建流程
3. **React 歌词生成器完善** — 歌词编辑/��制导出功能

### 🟡 已知问题

1. `package.json` 中引用的 `prisma/` 目录实际不存在（删除了 Prisma），但依赖声明还在
2. `server.py` 的 `/api/music` 端点未实现（`player.js` 调用的端点实际不存在）
3. `app.html`（SPA）和 `index.html`（多页）共存，入口需明确

---

## 6. 额外信息

### 6.1 依赖版本
- React 18.2.0 / Zustand 4.4.7 / Axios 1.6.2
- Electron 28.0.0 / Vite 5.0.4
- Flask / flask-cors / sqlite3（内置）
- Tailwind CSS 3.3.6 / PostCSS / Autoprefixer

### 6.2 设计风格
- **情绪色谱**（低饱和度灰蓝色调）：#6B7A8F → #7A8A9F → #A8B8C9 → #C4D4E4
- **字体**：Cormorant Garamond（英文衬线）+ Noto Serif SC（中文衬线）
- **动画哲学**：柔和、不眼花、呼吸感、自然演化

### 6.3 启动方式

**桌面端启动（推荐）：**
```bash
# 方式1：双击运行
双击 "启动桌面端.bat"

# 方式2：命令行启动
cd C:\Users\Administrator\Desktop\moodify
npm run desktop

# 方式3：打包构建 Windows 安装程序
npm run desktop:build:win
```

**浏览器端启动：**
```bash
cd C:\Users\Administrator\Desktop\moodify
python server.py                          # 启动 Flask 后端（可选，app.html 可独立运行）
# 然后用浏览器直接打开 moodify_web/app.html
```

### 6.4 入口说明
| 文件 | 用途 |
|------|------|
| `启动桌面端.bat` | ⭐ **推荐入口**，双击启动桌面应用，自动播放音乐 |
| `app.html` | SPA 单页，播放器已激活，情绪选择器已就绪 |
| `index.html` | 原多页静态展示站 |
| `src/` + Vite | React 歌词生成器（需 `npm run dev`） |

### 6.5 桌面端功能
| 功能 | 状态 | 说明 |
|------|------|------|
| 独立窗口运行 | ✅ | 不依赖浏览器，直接打开桌面窗口 |
| 自动播放音乐 | ✅ | 启动后自动开始播放第一个情绪音乐 |
| 情绪潮汐选择器 | ✅ | 点击即切歌 |
| 波形可视化 | ✅ | Canvas 波形动画 |
| 窗口控制 | ✅ | 最小化、最大化、关闭 |
| 单实例运行 | ✅ | 防止重复启动 |