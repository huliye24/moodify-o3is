import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, FolderOpen } from 'lucide-react'
import type { Project } from '@/types'

interface ProjectSelectorProps {
  projects: Project[]
  currentProject: Project | null
  onSelect: (project: Project | null) => void
  onCreate: (name: string, description?: string) => Promise<Project>
  onDelete: (id: string) => Promise<void>
}

export function ProjectSelector({ projects, currentProject, onSelect, onCreate, onDelete }: ProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      const project = await onCreate(newName, newDesc)
      onSelect(project)
      setNewName('')
      setNewDesc('')
      setIsCreating(false)
      setIsOpen(false)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary-600" />
          <span className="font-medium">
            {currentProject ? currentProject.name : '选择项目'}
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
          <div className="p-2 border-b">
            <button
              onClick={() => onSelect(null)}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors"
            >
              不选择项目
            </button>
          </div>
          
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-2 border-b last:border-b-0 flex items-center justify-between hover:bg-gray-50"
            >
              <button
                onClick={() => { onSelect(project); setIsOpen(false) }}
                className="flex-1 text-left px-3 py-2"
              >
                <div className="font-medium">{project.name}</div>
                <div className="text-sm text-gray-500">{project.o3ics_count} 首歌词</div>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(project.id) }}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {isCreating ? (
            <div className="p-4">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="项目名称"
                className="input mb-2"
                autoFocus
              />
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="项目描述（可选）"
                className="input mb-2"
              />
              <div className="flex gap-2">
                <button onClick={handleCreate} className="btn btn-primary flex-1">
                  创建
                </button>
                <button onClick={() => setIsCreating(false)} className="btn btn-secondary">
                  取消
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full p-4 flex items-center justify-center gap-2 text-primary-600 hover:bg-primary-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>新建项目</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}