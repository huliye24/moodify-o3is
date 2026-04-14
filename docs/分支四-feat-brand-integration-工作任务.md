# 分支四：feat/brand-integration 工作任务拆分

> 创建时间：2026-04-14
> 分支名：feat/brand-integration
> 目标：将 BrandPage 正确接入 AppTabLayout，优化品牌故事页面的移动端体验

---

## 一、任务概述

### 1.1 背景
- `AppTabLayout` 定义了 4 个 Tab（歌词创作/情绪播放/本地乐库/品牌故事），但品牌故事 Tab 内容为空
- `AppLayout.tsx` 当前仅显示占位文本，功能未实现
- 移动端适配缺失

### 1.2 任务目标
1. 将 BrandPage 正确接入 AppTabLayout
2. 优化移动端适配（响应式布局、触控区域）

---

## 二、任务拆分

### 任务一：重构 AppLayout.tsx

**文件**：`src/components/layouts/AppLayout.tsx`

**当前状态**：仅显示占位文本，功能未实现

**目标**：集成 AppTabLayout，实现 Tab 切换逻辑

**具体工作**：
1. 引入 `useState` 管理 Tab 状态
2. 引入 `AppTabLayout` 组件
3. 引入 4 个 Tab 内容组件（MainContent、MoodPage、LibraryPage、BrandPage）
4. 实现 Tab 状态管理 `activeTab` 和 `onTabChange`
5. 将 `AppTabLayout` 的 `children` 作为 render function 传入

**验收标准**：
- AppLayout 正确渲染 AppTabLayout
- Tab 切换时内容区域正确更新

---

### 任务二：修改 App.tsx 路由配置

**文件**：`src/App.tsx`

**当前状态**：`/app` 路由下仅渲染 `<AppLayout />` 和 `<PersistentPlayer />`

**目标**：将 AppLayout 改造为接收 children 的容器

**具体工作**：
1. 在 `/app` 路由下传入 render function：`{(tab) => renderTabContent(tab)}`
2. 如果 AppLayout 内部管理状态，App.tsx 可能不需要传递 Tab props
3. 确保 AppTabLayout 的 children render function 签名正确

**验收标准**：
- 访问 `/app` 时，Tab 导航正常工作
- 各 Tab 内容正确渲染

---

### 任务三：接入 BrandPage 组件

**依赖**：任务一完成

**具体工作**：
1. 确认 BrandPage 作为 Tab 内容时不显示重复的 Tab 栏（由 AppTabLayout 提供）
2. 确认 BrandPage 背景与 AppTabLayout 深色主题一致
3. 确保 BrandPage 的 `useScrollReveal` hook 在 Tab 切换后正常工作

**验收标准**：
- 点击"品牌故事" Tab 时，显示 BrandPage 内容
- 滚动动画正常触发

---

### 任务四：MoodSelector 响应式布局

**文件**：`src/components/MoodSelector.tsx`

**当前状态**：4 个情绪卡片在所有屏幕尺寸下均为水平排列

**目标**：小屏幕（< 640px）下改为 2x2 网格

**具体工作**：
1. 找到情绪卡片的父容器
2. 修改 grid 布局：`grid-cols-2`（sm）/ `grid-cols-4`（lg）
3. 调整卡片间距和尺寸以适应小屏幕

**验收标准**：
- 在 375px 宽度下，4 个卡片显示为 2x2 网格
- 在桌面端保持原来的 4 列水平排列

---

### 任务五：PersistentPlayer 触控区域优化

**文件**：`src/components/Player/PersistentPlayer.tsx`

**当前状态**：播放器控制按钮在移动端可能点击区域过小

**目标**：确保所有触控按钮最小尺寸为 44x44px

**具体工作**：
1. 找到所有控制按钮（播放/暂停、上一首、下一首、音量、静音、循环）
2. 添加 `min-w-[44px] min-h-[44px]` 样式
3. 确保图标居中显示

**验收标准**：
- 所有按钮在移动端易于点击
- 图标不因按钮尺寸变大而偏移

---

### 任务六：AppLayout 移动端菜单

**文件**：`src/components/layouts/AppLayout.tsx`

**当前状态**：无移动端菜单

**目标**：屏幕宽度 < 768px 时，显示汉堡菜单按钮

**具体工作**：
1. 添加 `sidebarOpen` 状态
2. 添加汉堡菜单按钮（仅在 < 768px 显示）
3. 添加侧边栏抽屉组件（或使用简单的 overlay）
4. 侧边栏应包含导航链接

**验收标准**：
- 在 375px 宽度下，侧边栏隐藏，汉堡菜单可见
- 点击汉堡菜单可打开侧边导航

---

## 三、文件修改清单

| 任务 | 文件 | 操作 | 说明 |
|------|------|------|------|
| 任务一 | `src/components/layouts/AppLayout.tsx` | 重写 | 集成 AppTabLayout |
| 任务二 | `src/App.tsx` | 修改 | 传入 render function |
| 任务三 | `src/pages/BrandPage.tsx` | 检查 | 确认背景和动画正常 |
| 任务四 | `src/components/MoodSelector.tsx` | 修改 | 响应式网格 |
| 任务五 | `src/components/Player/PersistentPlayer.tsx` | 修改 | 增大触控区域 |
| 任务六 | `src/components/layouts/AppLayout.tsx` | 修改 | 添加汉堡菜单 |

---

## 四、依赖关系

```
任务一（AppLayout 重写）
    ├── 任务二（App.tsx 修改） — 依赖任务一
    ├── 任务三（BrandPage 接入） — 依赖任务一
    └── 任务六（汉堡菜单） — 依赖任务一

任务四（MoodSelector 响应式） — 独立
任务五（PersistentPlayer 触控） — 独立
```

**说明**：
- 任务四、五可与其他任务并行开发
- 任务一完成后，任务二、三、六才可进行

---

## 五、验收检查清单

### 功能检查
- [ ] 访问 `/app`，4 个 Tab 均可点击切换
- [ ] 点击"品牌故事" Tab 时，正确显示 BrandPage 内容
- [ ] BrandPage 滚动动画正常触发
- [ ] BrandPage 背景与 AppTabLayout 深色主题一致

### 移动端适配
- [ ] 在 375px 宽度下，App 各 Tab 均可正常浏览
- [ ] MoodSelector 显示为 2x2 网格
- [ ] 播放器控制按钮触控区域 >= 44x44px
- [ ] 无横向溢出（overflow-x: hidden）

### 代码质量
- [ ] `npm run build` 编译通过
- [ ] 无 TypeScript 类型错误

---

## 六、注意事项

1. **AppTabLayout Props 签名**：
   ```tsx
   interface AppTabLayoutProps {
     activeTab: TabId
     onTabChange: (tab: TabId) => void
     children: (activeTab: TabId) => React.ReactNode
   }
   ```

2. **PersistentPlayer 已全局渲染**：无需在各个 Tab 页面重复引入

3. **分支隔离**：本分支只修改上述 6 个文件，不影响其他分支的功能

4. **与其他分支的依赖**：
   - 本分支依赖 `fix/routing-and-stores`（分支一）先完成
   - 如果分支一未完成，AppTabLayout 可能仍无法正常工作
