# 分支四：feat/brand-integration

> 创建时间：2026-04-14
> 目标：将 BrandPage 正确接入 AppTabLayout，优化品牌故事页面的移动端体验

---

## 一、任务概述

根据项目计划，`AppTabLayout` 已定义 4 个 Tab（歌词创作/情绪播放/本地乐库/品牌故事），但品牌故事 Tab 的内容区域为空。

### 当前问题
- `BrandPage.tsx` 是完整的营销页面，但目前仅在 `/products` 路由下展示
- AppTabLayout 的品牌故事 Tab 内容区域为空
- AppLayout.tsx 当前仅显示占位文本，功能未实现
- 移动端适配缺失，侧边栏、情绪选择器、播放器在小屏幕下可能存在布局问题

---

## 二、实施方案

### 2.1.1 BrandPage 接入 AppTabLayout

**修改文件：**
1. `src/App.tsx` — 在 `/app` 路由下集成 AppTabLayout 并管理 Tab 状态
2. `src/components/layouts/AppLayout.tsx` — 移除占位内容，集成 AppTabLayout

**做法：**

1. 在 `App.tsx` 中为 `/app` 路由添加 Tab 状态管理：

```tsx
// App.tsx 修改
import { useState } from 'react'
import { TabId } from './components/AppTabLayout'
import AppTabLayout from './components/AppTabLayout'
import MainContent from './components/MainContent'
import MoodPage from './pages/MoodPage'
import LibraryPage from './pages/LibraryPage'
import BrandPage from './pages/BrandPage'

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('o3ics')
  
  // Tab 内容映射
  const renderTabContent = (tab: TabId) => {
    switch (tab) {
      case 'o3ics': return <MainContent />
      case 'mood': return <MoodPage />
      case 'library': return <LibraryPage />
      case 'brand': return <BrandPage />
      default: return <MainContent />
    }
  }

  return (
    <Routes>
      <Route path="/app" element={
        <>
          <AppLayout>
            {(tab) => renderTabContent(tab)}
          </AppLayout>
          <PersistentPlayer mode="minimal" />
        </>
      } />
    </Routes>
  )
}
```

2. 修改 `AppLayout.tsx` 以接受 AppTabLayout：

```tsx
// AppLayout.tsx 修改
import { ReactNode } from 'react'
import { TabId } from '../AppTabLayout'

interface AppLayoutProps {
  children: (activeTab: TabId) => ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabId>('o3ics')

  return (
    <div className="h-screen flex flex-col bg-dark-500">
      <AppTabLayout 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
      >
        {children}
      </AppTabLayout>
    </div>
  )
}
```

**验收标准：**
- 访问 `/app` 时，4 个 Tab 均可点击切换
- 点击"品牌故事" Tab 时，正确显示 BrandPage 内容
- BrandPage 中的滚动动画（Intersection Observer）正常触发
- BrandPage 背景与 AppTabLayout 的深色主题一致

---

### 2.1.2 移动端适配优化

**修改文件：**
1. `src/components/layouts/AppLayout.tsx` — 添加移动端响应式逻辑
2. `src/components/MoodSelector.tsx` — 小屏幕下 2x2 网格布局
3. `src/components/Player/PersistentPlayer.tsx` — 增大触控按钮点击区域

**做法：**

1. **AppLayout.tsx** — 添加汉堡菜单：

```tsx
// AppLayout.tsx 添加移动端逻辑
const [sidebarOpen, setSidebarOpen] = useState(false)

// 移动端显示逻辑
// < 768px 时隐藏侧边栏，用汉堡菜单代替
// 在 Header 或顶部导航添加菜单按钮
```

2. **MoodSelector.tsx** — 响应式网格：

```tsx
// 当前 4 个情绪卡片在小屏幕下改为 2x2 网格
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 情绪卡片 */}
</div>
```

3. **PersistentPlayer.tsx** — 增大触控区域：

```tsx
// 按钮最小触控区域 44x44px
<button className="p-3 min-w-[44px] min-h-[44px] ...">
```

**验收标准：**
- 在 375px 宽度（iPhone SE）下，App 各 Tab 均可正常浏览
- 播放器控制按钮在移动端易于点击（至少 44x44px）
- 无横向溢出（overflow-x: hidden）

---

## 三、文件修改清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/App.tsx` | 修改 | 添加 Tab 状态管理，传入 AppLayout |
| `src/components/layouts/AppLayout.tsx` | 重写 | 集成 AppTabLayout，实现 Tab 切换逻辑 |
| `src/components/MoodSelector.tsx` | 修改 | 添加响应式网格布局 |
| `src/components/Player/PersistentPlayer.tsx` | 修改 | 增大触控按钮区域 |

---

## 四、依赖关系

- 本分支依赖 **fix/routing-and-stores**（分支一）先完成
- 需要 AppTabLayout 组件已正确实现（已确认存在）
- 需要各 Tab 内容组件存在（MainContent、MoodPage、LibraryPage、BrandPage）

---

## 五、验收检查清单

- [ ] 访问 `/app`，4 个 Tab 均可点击切换
- [ ] 点击"品牌故事" Tab 时，正确显示 BrandPage 内容
- [ ] BrandPage 滚动动画正常触发
- [ ] 在 375px 宽度下，布局正常无溢出
- [ ] 播放器控制按钮触控区域 >= 44x44px
- [ ] 编译通过，无 TS 类型错误

---

## 六、注意事项

1. **AppTabLayout Props 传递**：`AppTabLayout` 使用 `children` 作为 render function，签名为 `children: (activeTab: TabId) => React.ReactNode`
2. **BrandPage 背景处理**：BrandPage 自带深色背景，在 App 模式下需确保与 AppTabLayout 背景协调
3. **PersistentPlayer 已在全局渲染**：根据 `App.tsx`，PersistentPlayer 已在 `/app` 路由下全局渲染，无需在各个 Tab 页面重复引入
