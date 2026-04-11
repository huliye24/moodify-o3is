import { useState } from 'react'
import { useStore } from '../stores/useStore'
import { Music, Plus, Settings, BookOpen, Heart, ChevronLeft, Trash2, FolderOpen } from 'lucide-react'

export default function Sidebar({
  onOpenSettings,
  onOpenRules
}: {
  onOpenSettings: () => void
  onOpenRules: () => void
}) {
  const {
    projects,
    currentProject,
    o3icsList,
    favoriteLyrics,
    selectProject,
    createProject,
    deleteProject,
    showSidebar,
    toggleSidebar,
    loadFavorites,
    selectLyrics,
    selectedLyrics
  } = useStore()

  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [showFavorites, setShowFavorites] = useState(false)

  const handleCreateProject = async () => {
    if (newProjectName.trim()) {
      await createProject(newProjectName.trim())
      setNewProjectName('')
      setShowNewProject(false)
    }
  }

  const handleSelectProject = async (project: any) => {
    setShowFavorites(false)
    await selectProject(project)
  }

  const handleShowFavorites = async () => {
    setShowFavorites(true)
    await selectProject(null)
    await loadFavorites()
  }

  return (
    <>
      {/* 侧边栏 */}
      <div
        className={`${
          showSidebar ? 'w-64' : 'w-0'
        } bg-dark-300 border-r border-gray-800 flex flex-col transition-all duration-300 overflow-hidden`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-gray-800">
          <Music className="w-6 h-6 text-primary-500 mr-2" />
          <span className="text-lg font-bold text-white">Moodify</span>
        </div>

        {/* 新建项目按钮 */}
        <div className="p-3">
          <button
            onClick={() => setShowNewProject(true)}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新建项目
          </button>
        </div>

        {/* 新建项目表单 */}
        {showNewProject && (
          <div className="px-3 pb-3">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              placeholder="项目名称..."
              className="input-field text-sm mb-2"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={handleCreateProject} className="btn-primary text-sm flex-1">
                创建
              </button>
              <button onClick={() => setShowNewProject(false)} className="btn-secondary text-sm">
                取消
              </button>
            </div>
          </div>
        )}

        {/* 收藏入口 */}
        <button
          onClick={handleShowFavorites}
          className={`mx-3 mb-2 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            showFavorites ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-dark-200'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span className="text-sm">我的收藏</span>
          {favoriteLyrics.length > 0 && (
            <span className="ml-auto bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
              {favoriteLyrics.length}
            </span>
          )}
        </button>

        {/* 项目列表 */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <FolderOpen className="w-3 h-3" />
            项目列表
          </div>
          <div className="space-y-1 px-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  currentProject?.id === project.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-dark-200'
                }`}
                onClick={() => handleSelectProject(project)}
              >
                <BookOpen className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 truncate text-sm">{project.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(`确定删除项目"${project.name}"吗？`)) {
                      deleteProject(project.id)
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600 rounded transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 底部工具 */}
        <div className="border-t border-gray-800 p-3 space-y-2">
          <button
            onClick={onOpenRules}
            className="w-full btn-secondary text-sm flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4" />
            规则管理
          </button>
          <button
            onClick={onOpenSettings}
            className="w-full btn-secondary text-sm flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4" />
            设置
          </button>
        </div>
      </div>

      {/* 折叠按钮 */}
      <button
        onClick={toggleSidebar}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-dark-300 border border-gray-700 rounded-r-lg p-1 hover:bg-dark-200 transition-colors z-10"
        style={{ left: showSidebar ? '256px' : '0' }}
      >
        <ChevronLeft className={`w-4 h-4 transition-transform ${!showSidebar && 'rotate-180'}`} />
      </button>

      {/* 收藏列表悬浮面板 */}
      {showFavorites && (
        <div className="absolute left-64 top-14 bottom-14 w-72 bg-dark-300 border-r border-gray-800 overflow-y-auto z-20">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              我的收藏
            </h3>
          </div>
          <div className="p-2 space-y-1">
            {favoriteLyrics.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">暂无收藏</p>
            ) : (
              favoriteLyrics.map((lyrics) => (
                <div
                  key={lyrics.id}
                  onClick={() => {
                    selectLyrics(lyrics)
                    setShowFavorites(false)
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedLyrics?.id === lyrics.id
                      ? 'bg-primary-600'
                      : 'hover:bg-dark-200'
                  }`}
                >
                  <h4 className="text-sm font-medium truncate">{lyrics.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {lyrics.content.substring(0, 50)}...
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  )
}