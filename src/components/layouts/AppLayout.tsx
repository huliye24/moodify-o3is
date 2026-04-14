import { ReactNode } from 'react'

interface AppLayoutProps {
  children?: ReactNode
  // 保留接口以备将来扩展
}

export default function AppLayout({ children }: AppLayoutProps) {
  // 暂时返回一个简单的占位，后续可扩展为带侧边栏的布局
  return (
    <div className="h-screen flex flex-col bg-dark-500">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-light text-white mb-4">歌词创作器</h1>
          <p className="text-gray-500">此功能正在重构中...</p>
        </div>
      </div>
    </div>
  )
}
