import { hasMandate, canPerformTransition, canAccessEntity, getTraceability } from '../data/mandates'
import { useMandateValidation, MandateButton, MandateGuard } from '../utils/mandateValidation'

export default function EntityEditor({
  selectedModule,
  currentRole,
  onStatusTransition,
  onModuleUpdate,
}) {
  if (!selectedModule) {
    return (
      <div className="text-slate-500 text-sm">
        Выберите доменный модуль в левой панели.
      </div>
    )
  }

  const isDraft = selectedModule.status === 'Draft'
  const isValidated = selectedModule.status === 'Validated'
  const isFrozen = selectedModule.status === 'Frozen'
  
  // Проверка мандатов вместо хардкода ролей
  const canEdit = isDraft && canAccessEntity(currentRole, 'Domain_Module', 'Draft', 'write')
  const canApprove = isDraft && hasMandate(currentRole, 'M-OOR-ACT-APPROVE')
  const canReject = isValidated && hasMandate(currentRole, 'M-OOR-ACT-REJECT')
  const canFreeze = isValidated && hasMandate(currentRole, 'M-OOR-ACT-FREEZE')
  
  // Трассировка для кнопок
  const approveTrace = getTraceability('approve')
  const rejectTrace = getTraceability('reject')
  const freezeTrace = getTraceability('freeze')
  const editTrace = getTraceability('edit')

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-lg font-semibold text-slate-800">
        Редактор: {selectedModule.name}
      </h2>
      
      {/* Блок трассировки */}
      <div className="rounded border border-blue-100 bg-blue-50 p-3 text-sm">
        <div className="font-medium text-blue-800 mb-1">Трассируемость (Traceability Chain)</div>
        <div className="text-blue-700 space-y-1">
          <div>Роль: <span className="font-medium">{currentRole}</span></div>
          <div>Статус: <span className="font-medium">{selectedModule.status}</span></div>
          <div>Мандаты роли: {['M-OOR-ACT-APPROVE', 'M-OOR-ACT-REJECT', 'M-OOR-ACT-FREEZE', 'M-OOR-VIEW-DRAFT', 'M-OOR-VIEW-VALIDATED']
            .filter(m => hasMandate(currentRole, m))
            .join(', ')}</div>
        </div>
      </div>

      <div className="rounded border border-slate-200 bg-white p-4 space-y-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Статус</label>
          <span
            className={`inline-block px-2 py-0.5 rounded text-sm font-medium ${
              isDraft
                ? 'bg-amber-100 text-amber-800'
                : isValidated
                  ? 'bg-green-100 text-green-800'
                  : 'bg-slate-200 text-slate-700'
            }`}
          >
            {selectedModule.status}
          </span>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Название</label>
          <input
            type="text"
            value={selectedModule.name}
            onChange={(e) =>
              onModuleUpdate(selectedModule.id, { name: e.target.value })
            }
            disabled={!canEdit}
            className="w-full text-sm border border-slate-300 rounded px-2 py-1.5 disabled:bg-slate-50 disabled:text-slate-500"
            title={canEdit ? editTrace?.description : "Нет мандата M-OOR-VIEW-DRAFT для редактирования"}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Описание</label>
          <textarea
            value={selectedModule.description ?? ''}
            onChange={(e) =>
              onModuleUpdate(selectedModule.id, { description: e.target.value })
            }
            disabled={!canEdit}
            rows={2}
            className="w-full text-sm border border-slate-300 rounded px-2 py-1.5 disabled:bg-slate-50 disabled:text-slate-500"
            title={canEdit ? editTrace?.description : "Нет мандата M-OOR-VIEW-DRAFT для редактирования"}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {canApprove && (
          <button
            type="button"
            onClick={() => onStatusTransition(selectedModule.id, 'Validated')}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            title={`${approveTrace?.description}\nМандат: ${approveTrace?.mandate}\nПереход: ${approveTrace?.transition}\nМетод: ${approveTrace?.method}`}
          >
            Утвердить
          </button>
        )}
        {canReject && (
          <button
            type="button"
            onClick={() => onStatusTransition(selectedModule.id, 'Draft')}
            className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded hover:bg-amber-700"
            title={`${rejectTrace?.description}\nМандат: ${rejectTrace?.mandate}\nПереход: ${rejectTrace?.transition}\nМетод: ${rejectTrace?.method}`}
          >
            Вернуть на доработку
          </button>
        )}
        {canFreeze && (
          <button
            type="button"
            onClick={() => onStatusTransition(selectedModule.id, 'Frozen')}
            className="px-3 py-1.5 text-sm bg-slate-600 text-white rounded hover:bg-slate-700"
            title={`${freezeTrace?.description}\nМандат: ${freezeTrace?.mandate}\nПереход: ${freezeTrace?.transition}\nМетод: ${freezeTrace?.method}`}
          >
            Зафиксировать версию
          </button>
        )}
      </div>
      
      {/* Информация о трассировке */}
      <div className="rounded border border-slate-100 bg-slate-50 p-3 text-xs">
        <div className="font-medium text-slate-700 mb-1">Traceability Chain (цепочка трассируемости):</div>
        <div className="text-slate-600 space-y-1">
          <div>• <span className="font-medium">UI кнопка</span> → <span className="font-medium">Мандат</span> → <span className="font-medium">Переход</span> → <span className="font-medium">Метод</span></div>
          <div>• Наведите курсор на кнопку, чтобы увидеть детали трассировки</div>
          <div>• Кнопки отображаются только при наличии соответствующего мандата у роли</div>
          <div>• Соответствует методологии OOR (см. <a href="../docs/oor/domains/oor_manager/Mandates.md" className="text-blue-600 underline">Mandates.md</a>)</div>
        </div>
      </div>
    </div>
  )
}
