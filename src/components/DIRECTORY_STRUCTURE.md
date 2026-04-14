# 组件目录结构说明

## 新增目录

```
src/
├── components/
│   ├── pages/              # 页面组件
│   │   ├── TidalHome.tsx   # 情绪潮汐主页
│   │   ├── BoundaryPage.tsx # 音乐边界页
│   │   ├── ProductsPage.tsx # 情绪容器页
│   │   └── VoicePage.tsx   # 品牌声音页
│   ├── Player/             # 播放器组件
│   │   ├── PersistentPlayer.tsx
│   │   ├── WaveCanvas.tsx
│   │   ├── TrackInfo.tsx
│   │   └── PlayerControls.tsx
│   └── shared/             # 共享组件
│       ├── Navbar.tsx
│       ├── BackToFlow.tsx
│       ├── FogLayers.tsx
│       └── TidalSelector.tsx
├── hooks/                  # 自定义 Hooks
│   ├── useTidalPlayer.ts
│   ├── useWaveAnimation.ts
│   ├── useScrollAnimation.ts
│   └── useAudioPlayer.ts   # 已有
├── styles/                 # 样式文件
│   ├── global.css
│   ├── tidal.css
│   ├── boundary.css
│   ├── products.css
│   └── voice.css
```
