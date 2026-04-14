import { useState } from 'react'
import { useStore } from '../stores/useStore'
import { Music, Plus, Settings, BookOpen, Trash2, FolderOpen } from 'lucide-react'
import { useAuroraTheme } from '../context/ThemeContext'

export default function Sidebar({
  onOpenSettings,
  onOpenRules
}: {
  onOpenSettings: () => void
  onOpenRules: () => void
}) {
  const { theme } = useAuroraTheme()
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
      <div style={{
        width: '16rem', flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: 'rgba(107,122,143,0.03)',
        borderRight: `1px solid ${theme.border.subtle}`
      }}>
        {/* Logo */}
        <div style={{
          height: '3.5rem', display: 'flex', alignItems: 'center', padding: '0 1rem',
          borderBottom: `1px solid ${theme.border.subtle}`
        }}>
          <Music className="w-6 h-6 mr-2" style={{ color: theme.text.secondary }} />
          <span style={{ fontSize: '1.125rem', fontWeight: 700, color: theme.text.white }}>Moodify</span>
        </div>

        {/* 新建项目按钮 */}
        <div style={{ padding: '0.75rem' }}>
          <button
            onClick={() => setShowNewProject(true)}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" style={{ color: theme.text.body }} />
            <span style={{ color: theme.text.white }}>新建项目</span>
          </button>
        </div>

        {/* 新建项目表单 */}
        {showNewProject && (
          <div style={{ padding: '0 0.75rem 0.75rem' }}>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              placeholder="项目名称..."
              className="input-field text-sm mb-2"
              autoFocus
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleCreateProject} className="btn-primary text-sm flex-1">
                <span style={{ color: theme.text.white }}>创建</span>
              </button>
              <button onClick={() => setShowNewProject(false)} className="btn-secondary text-sm">
                取消
              </button>
            </div>
          </div>
        )}

        {/* 项目列表 */}
        <div className="flex-1 overflow-y-auto">
          <div style={{
            padding: '0.5rem 1rem',
            fontSize: '0.75rem', color: theme.text.tertiary, textTransform: 'uppercase',
            letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <FolderOpen className="w-3 h-3" style={{ color: theme.text.tertiary }} />
            项目列表
          </div>
          <div className="space-y-1 px-2">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleSelectProject(project)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: currentProject?.id === project.id
                    ? theme.chip.activeBg
                    : 'transparent',
                  border: currentProject?.id === project.id
                    ? `1px solid ${theme.chip.activeBorder}`
                    : '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (currentProject?.id !== project.id) {
                    (e.currentTarget as HTMLElement).style.background = theme.chip.hoverBg
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentProject?.id !== project.id) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent'
                  }
                }}
              >
                <BookOpen className="w-4 h-4 flex-shrink-0" style={{ color: currentProject?.id === project.id ? theme.chip.activeText : theme.text.secondary }} />
                <span className="flex-1 truncate text-sm" style={{
                  fontSize: '0.875rem',
                  color: currentProject?.id === project.id ? theme.chip.activeText : theme.text.body,
                }}>
                  {project.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(`确定删除项目"${project.name}"吗？`)) {
                      deleteProject(project.id)
                    }
                  }}
                  style={{
                    opacity: 0, padding: '0.25rem', borderRadius: '0.25rem',
                    background: 'transparent', transition: 'opacity 0.2s'
                  }}
                  className="delete-btn"
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent'
                  }}
                >
                  <Trash2 className="w-3 h-3" style={{ color: 'rgba(239,68,68,0.7)' }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 底部工具 */}
        <div style={{ borderTop: `1px solid ${theme.border.subtle}`, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={onOpenRules}
            className="btn-secondary text-sm flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4" style={{ color: theme.text.secondary }} />
            <span>规则管理</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="btn-secondary text-sm flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4" style={{ color: theme.text.secondary }} />
            <span>设置</span>
          </button>
        </div>
      </div>

      <style>{`
        [class*="rounded-lg"][class*="cursor-pointer"]:hover .delete-btn { opacity: 1 !important; }
      `}</style>
    </>
  )
}
