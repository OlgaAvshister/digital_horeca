import { useEffect, useRef, useState } from 'react'
import { traceabilityData } from '../data/mock.js'

const MERMAID_CODE = `
stateDiagram
  [*] --> Draft
  Draft --> Validated : approve
  Validated --> Frozen : freeze
  Validated --> Draft : reject
  Frozen --> [*]
`

// Роли, имеющие доступ к каждому мандату (из docs/oor/roles/_map.yaml)
const mandateRoles = {
  'M-OOR-ACT-APPROVE': ['Analyst', 'Reviewer'],
  'M-OOR-ACT-REJECT': ['Analyst', 'Reviewer'],
  'M-OOR-ACT-FREEZE': ['Reviewer'],
  'M-OOR-VIEW-DRAFT': ['Analyst', 'Reviewer'],
}

export default function StateMachineViewer({ currentStatus }) {
  const containerRef = useRef(null)
  const [svg, setSvg] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setError(null)
    import('mermaid')
      .then(({ default: mermaid }) => {
        mermaid.initialize({ startOnLoad: false, theme: 'neutral' })
        return mermaid.render('state-machine', MERMAID_CODE)
      })
      .then(({ svg: result }) => {
        if (!cancelled) setSvg(result)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(String(err.message ?? err))
          setSvg('')
        }
      })
    return () => { cancelled = true }
  }, [])

  // Получить данные трассировки для отображения
  const traceabilityEntries = Object.values(traceabilityData || {})

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          Визуализатор State Machine
        </h2>
        <p className="text-sm text-slate-600">
          Жизненный цикл: Draft → Validated (approve) → Frozen (freeze);
          Validated → Draft (reject). Источник: docs/oor/domains/oor_manager/Transitions.md
        </p>
        {currentStatus && (
          <p className="text-sm mt-2">
            Текущий статус выбранного модуля:{' '}
            <span className="font-medium text-indigo-600">{currentStatus}</span>
          </p>
        )}
      </div>

      <div
        ref={containerRef}
        className="rounded border border-slate-200 bg-white p-4 min-h-[280px] flex items-center justify-center"
      >
        {error && (
          <div className="text-sm text-red-600">
            Ошибка Mermaid: {error}. Убедитесь, что mermaid установлен.
          </div>
        )}
        {svg && !error && (
          <div
            className="mermaid-svg"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
        {!svg && !error && <div className="text-slate-400 text-sm">Загрузка…</div>}
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-slate-700">Трассировка переходов (Traceability Chain)</h3>
        <p className="text-sm text-slate-600">
          Каждый переход в state machine требует определённого мандата. Цепочка трассировки:
          UI элемент → Мандат → Переход → Метод реализации.
        </p>
        
        <div className="overflow-x-auto rounded border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Переход
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Мандат
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Роли с доступом
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  UI элемент
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Метод
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {traceabilityEntries.map((entry, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {entry?.transition?.replace('transition_', '') || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {entry?.mandate || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {entry?.mandate && mandateRoles[entry.mandate]?.map((role, i) => (
                      <span key={role} className="mr-2">
                        {role}
                        {i < mandateRoles[entry.mandate].length - 1 ? ', ' : ''}
                      </span>
                    )) || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {entry?.ui_element || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-800">
                    {entry?.method || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-slate-500 space-y-1">
          <p>
            <strong>Принцип OOR:</strong> Авторизация основана на мандатах, а не на ролях напрямую.
            Роли - это лишь контейнеры для мандатов.
          </p>
          <p>
            <strong>Источник:</strong> Документация мандатов в{' '}
            <code className="text-indigo-600">docs/oor/domains/oor_manager/Mandates.md</code>
          </p>
        </div>
      </div>
    </div>
  )
}
