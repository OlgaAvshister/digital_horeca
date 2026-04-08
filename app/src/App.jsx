import { useState } from 'react'
import Layout from './components/Layout'
import EntityEditor from './components/EntityEditor'
import StateMachineViewer from './components/StateMachineViewer'
import { mockProjects, mockModules } from './data/mock'

const VIEWS = { editor: 'editor', stateMachine: 'stateMachine' }

export default function App() {
  const [currentRole, setCurrentRole] = useState('Analyst')
  const [view, setView] = useState(VIEWS.editor)
  const [selectedProjectId, setSelectedProjectId] = useState(mockProjects[0]?.id ?? null)
  const [selectedModuleId, setSelectedModuleId] = useState(mockModules[0]?.id ?? null)
  const [modules, setModules] = useState(mockModules)
  const [projects] = useState(mockProjects)

  const selectedModule = modules.find((m) => m.id === selectedModuleId) ?? null
  const projectModules = modules.filter((m) => m.project_id === selectedProjectId)

  const handleStatusTransition = (moduleId, newStatus) => {
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, status: newStatus } : m))
    )
  }

  const handleModuleUpdate = (moduleId, updates) => {
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, ...updates } : m))
    )
  }

  return (
    <Layout
      currentRole={currentRole}
      onRoleChange={setCurrentRole}
      view={view}
      onViewChange={setView}
      projects={projects}
      projectModules={projectModules}
      selectedProjectId={selectedProjectId}
      selectedModuleId={selectedModuleId}
      onSelectProject={setSelectedProjectId}
      onSelectModule={setSelectedModuleId}
      rightPanel={
        <AiSyncPanel
          selectedModule={selectedModule}
          currentRole={currentRole}
        />
      }
    >
      {view === VIEWS.editor ? (
        <EntityEditor
          selectedModule={selectedModule}
          currentRole={currentRole}
          onStatusTransition={handleStatusTransition}
          onModuleUpdate={handleModuleUpdate}
        />
      ) : (
        <StateMachineViewer currentStatus={selectedModule?.status} />
      )}
    </Layout>
  )
}

function AiSyncPanel({ selectedModule, currentRole }) {
  const [contextFormat, setContextFormat] = useState('cursor')
  const [includeGlossary, setIncludeGlossary] = useState(true)
  const [includeStructure, setIncludeStructure] = useState(true)
  const [includeCurrentArtifact, setIncludeCurrentArtifact] = useState(true)
  const [copyStatus, setCopyStatus] = useState('')

  const buildContext = () => {
    const parts = []
    
    if (includeGlossary) {
      parts.push('# Глоссарий OOR-IDE')
      parts.push('- **[Base] Document**: базовый тип для всех файлов спецификаций')
      parts.push('- **Domain**: область/модуль в структуре OOR')
      parts.push('- **Mandate**: право на действие или переход, назначенное роли')
      parts.push('- **Traceability Chain**: цепочка прослеживаемости требований до кода/UI')
      parts.push('- **Invariants**: неизменяемые условия для сущностей и переходов')
    }
    
    parts.push('\n## Жизненный цикл требований')
    parts.push('```mermaid')
    parts.push('stateDiagram-v2')
    parts.push('  [*] --> Draft')
    parts.push('  Draft --> Validated : approve')
    parts.push('  Validated --> Frozen : freeze')
    parts.push('  Validated --> Draft : reject')
    parts.push('  Frozen --> [*]')
    parts.push('```')
    
    parts.push('\n## Роли и их ключевые мандаты')
    parts.push('- **Analyst**: M-OOR-EDIT-DRAFT, M-OOR-CREATE, M-OOR-ACT-APPROVE (для своих артефактов)')
    parts.push('- **Reviewer**: M-OOR-ACT-APPROVE, M-OOR-ACT-REJECT, M-OOR-ACT-FREEZE')
    parts.push('- **AI-Developer**: M-OOR-READ-VALIDATED, M-OOR-EXPORT-CONTEXT')
    
    if (selectedModule && includeCurrentArtifact) {
      parts.push(`\n## Текущий артефакт`)
      parts.push(`- **Тип**: Domain_Module`)
      parts.push(`- **Имя**: ${selectedModule.name}`)
      parts.push(`- **Статус**: ${selectedModule.status}`)
      parts.push(`- **ID**: ${selectedModule.id}`)
      parts.push(`- **Проект**: ${selectedModule.project_id}`)
      
      if (selectedModule.status === 'Draft') {
        parts.push(`- **Доступные действия**: редактирование (M-OOR-EDIT-DRAFT), утверждение (M-OOR-ACT-APPROVE)`)
      } else if (selectedModule.status === 'Validated') {
        parts.push(`- **Доступные действия**: возврат на доработку (M-OOR-ACT-REJECT), заморозка (M-OOR-ACT-FREEZE)`)
      }
    }
    
    if (includeStructure) {
      parts.push('\n## Структура проекта OOR-IDE')
      parts.push('```')
      parts.push('docs/oor/')
      parts.push('├── index.yaml                    # Навигационный слой')
      parts.push('├── scenarios.md                  # Сценарии UI/UX flow')
      parts.push('├── roles/                        # Роли участников')
      parts.push('│   ├── analyst.md')
      parts.push('│   ├── reviewer.md')
      parts.push('│   └── ai_developer.md')
      parts.push('├── glossary/                     # Терминология')
      parts.push('│   ├── core/README.md')
      parts.push('│   └── domain/README.md')
      parts.push('└── domains/oor_manager/         # Доменная модель')
      parts.push('    ├── Entities.md')
      parts.push('    ├── Transitions.md')
      parts.push('    ├── Rules.md')
      parts.push('    └── Mandates.md')
      parts.push('```')
      
      parts.push('\n## Файл .cursorrules')
      parts.push('В корне проекта находится файл `.cursorrules` с полным описанием структуры и терминологии для ИИ-ассистентов.')
    }
    
    parts.push('\n## Контекст генерации')
    parts.push(`- **Текущая роль пользователя**: ${currentRole}`)
    parts.push(`- **Формат контекста**: ${contextFormat === 'cursor' ? 'Cursor Rules' : 'Plain Markdown'}`)
    parts.push(`- **Время**: ${new Date().toISOString()}`)
    
    if (contextFormat === 'cursor') {
      parts.push('\n// Cursor Rules Context')
      parts.push('// Use this context when generating code for OOR-IDE')
      parts.push('// Reference the entity structures and mandates from docs/oor/')
    }
    
    return parts.join('\n')
  }

  const handleCopy = () => {
    const context = buildContext()
    navigator.clipboard.writeText(context)
      .then(() => {
        setCopyStatus('Контекст скопирован в буфер!')
        setTimeout(() => setCopyStatus(''), 3000)
      })
      .catch(err => {
        setCopyStatus('Ошибка копирования: ' + err.message)
      })
  }

  const handleExport = () => {
    const context = buildContext()
    const blob = new Blob([context], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `oor-ide-context-${new Date().toISOString().slice(0, 10)}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setCopyStatus('Контекст экспортирован в файл!')
    setTimeout(() => setCopyStatus(''), 3000)
  }

  return (
    <div className="flex flex-col h-full p-4 bg-slate-50 rounded-l border-l border-slate-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-slate-800">AI-Sync</h3>
        <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded">
          {currentRole}
        </span>
      </div>
      
      <p className="text-sm text-slate-600 mb-4">
        Панель для экспорта контекста OOR-IDE в Cursor, Windsurf или другие ИИ-инструменты.
      </p>
      
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Формат контекста
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setContextFormat('cursor')}
              className={`px-3 py-1.5 text-sm rounded ${contextFormat === 'cursor' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}
            >
              Cursor
            </button>
            <button
              type="button"
              onClick={() => setContextFormat('markdown')}
              className={`px-3 py-1.5 text-sm rounded ${contextFormat === 'markdown' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}
            >
              Markdown
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Включить в контекст:
          </label>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="glossary"
              checked={includeGlossary}
              onChange={(e) => setIncludeGlossary(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="glossary" className="text-sm text-slate-700">
              Глоссарий OOR
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="structure"
              checked={includeStructure}
              onChange={(e) => setIncludeStructure(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="structure" className="text-sm text-slate-700">
              Структуру проекта
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="artifact"
              checked={includeCurrentArtifact}
              onChange={(e) => setIncludeCurrentArtifact(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="artifact" className="text-sm text-slate-700">
              Текущий артефакт
            </label>
          </div>
        </div>
      </div>
      
      <div className="space-y-2 mt-auto">
        {copyStatus && (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
            {copyStatus}
          </div>
        )}
        
        <button
          type="button"
          onClick={handleCopy}
          className="w-full px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
          Копировать контекст
        </button>
        
        <button
          type="button"
          onClick={handleExport}
          className="w-full px-4 py-2 text-sm bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50 flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Экспорт в файл
        </button>
        
        <div className="text-xs text-slate-500 mt-2">
          Контекст включает терминологию OOR, структуру проекта и информацию о текущем артефакте для ИИ-ассистентов.
        </div>
      </div>
    </div>
  )
}
