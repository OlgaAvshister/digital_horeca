export default function Layout({
  currentRole,
  onRoleChange,
  view,
  onViewChange,
  projects,
  projectModules,
  selectedProjectId,
  selectedModuleId,
  onSelectProject,
  onSelectModule,
  rightPanel,
  children,
}) {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-800">
      {/* Left: Navigation */}
      <aside className="w-56 shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-3 border-b border-slate-200">
          <span className="font-semibold text-slate-800">OOR-IDE</span>
        </div>
        <div className="p-2">
          <label className="block text-xs text-slate-500 mb-1">Роль</label>
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="w-full text-sm border border-slate-300 rounded px-2 py-1"
          >
            <option value="Analyst">Analyst</option>
            <option value="Reviewer">Reviewer</option>
            <option value="AI-Developer">AI-Developer</option>
          </select>
        </div>
        <div className="p-2 flex gap-1">
          <button
            type="button"
            onClick={() => onViewChange('editor')}
            className={`flex-1 text-sm py-1 rounded ${view === 'editor' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'}`}
          >
            Редактор
          </button>
          <button
            type="button"
            onClick={() => onViewChange('stateMachine')}
            className={`flex-1 text-sm py-1 rounded ${view === 'stateMachine' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'}`}
          >
            State Machine
          </button>
        </div>
        <nav className="flex-1 overflow-auto p-2">
          <div className="text-xs font-medium text-slate-500 mb-1">Проекты</div>
          {projects.map((p) => (
            <div key={p.id} className="mb-2">
              <button
                type="button"
                onClick={() => onSelectProject(p.id)}
                className={`w-full text-left text-sm px-2 py-1 rounded ${selectedProjectId === p.id ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
              >
                {p.title}
              </button>
              {selectedProjectId === p.id &&
                projectModules.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onSelectModule(m.id)}
                    className={`block w-full text-left text-xs pl-4 py-1 rounded ${selectedModuleId === m.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50'}`}
                  >
                    {m.name} - {m.status}
                  </button>
                ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Center: Main content */}
      <main className="flex-1 overflow-auto p-4">{children}</main>

      {/* Right: AI-Sync */}
      <aside className="w-64 shrink-0 bg-white flex flex-col">
        {rightPanel}
      </aside>
    </div>
  )
}
