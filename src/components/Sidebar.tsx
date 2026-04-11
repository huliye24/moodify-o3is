import { useState } from 'react'
import { useStore } from '../stores/useStore'
import { Music, Plus, Settings, BookOpen, Trash2, FolderOpen } from 'lucide-react'

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
    createProject,
    deleteProject,
    selectProject
  } = useStore()

  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName.trim())
      setNewProjectName('')
      setShowNewProject(false)
    }
  }

  const handleSelectProject = (project: any) => {
    selectProject(project)
  }

  return (
    <>
      {/* 侧边栏 */}
      <div className="w-64 bg-dark-300 border-r border-gray-800 flex flex-col">
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
    </>
  )
}
