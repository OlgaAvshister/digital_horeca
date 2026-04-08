// Мок-данные для OOR-IDE
// Соответствует структуре из docs/oor/domains/oor_manager/Entities.md

export const mockProjects = [
  { 
    id: 'proj-1', 
    title: 'OOR-IDE', 
    description: 'Система управления требованиями',
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-04-02T09:30:00Z',
    domain_module_ids: ['mod-1', 'mod-2']
  },
]

export const mockModules = [
  {
    id: 'mod-1',
    project_id: 'proj-1',
    name: 'oor_manager',
    status: 'Draft',
    description: 'Домен управления OOR (сущности, переходы, правила, мандаты)',
    created_at: '2026-04-01T11:00:00Z',
    updated_at: '2026-04-02T10:00:00Z',
    method_definition_ids: ['method-1', 'method-2', 'method-3']
  },
  {
    id: 'mod-2',
    project_id: 'proj-1',
    name: 'glossary',
    status: 'Validated',
    description: 'Терминология Core + Domain',
    created_at: '2026-04-01T12:00:00Z',
    updated_at: '2026-04-01T15:00:00Z',
    method_definition_ids: []
  },
  {
    id: 'mod-3',
    project_id: 'proj-1',
    name: 'roles',
    status: 'Frozen',
    description: 'Роли участников процесса (Analyst, Reviewer, AI-Developer)',
    created_at: '2026-04-01T13:00:00Z',
    updated_at: '2026-04-01T18:00:00Z',
    method_definition_ids: []
  },
]

export const mockMethodDefinitions = [
  {
    id: 'method-1',
    domain_module_id: 'mod-1',
    name: 'approveDomainModule',
    description: 'Утверждение доменного модуля (переход Draft → Validated)',
    rule_schema: {
      rule_id: 'R-TRANSITION-FROM-STATUS',
      params: { from: 'Draft', to: 'Validated' }
    }
  },
  {
    id: 'method-2',
    domain_module_id: 'mod-1',
    name: 'rejectDomainModule',
    description: 'Возврат доменного модуля на доработку (переход Validated → Draft)',
    rule_schema: {
      rule_id: 'R-TRANSITION-FROM-STATUS',
      params: { from: 'Validated', to: 'Draft' }
    }
  },
  {
    id: 'method-3',
    domain_module_id: 'mod-1',
    name: 'freezeDomainModule',
    description: 'Фиксация версии доменного модуля (переход Validated → Frozen)',
    rule_schema: {
      rule_id: 'R-TRANSITION-FROM-STATUS',
      params: { from: 'Validated', to: 'Frozen' }
    }
  },
]

export const mockAuthorizationMandates = [
  {
    id: 'mandate-1',
    code: 'M-OOR-ACT-APPROVE',
    role_id: 'Analyst',
    transition_id: 'transition_approve',
    method_definition_id: 'method-1',
    scope: { entity_type: 'Domain_Module', allowed_statuses: ['Draft'] }
  },
  {
    id: 'mandate-2',
    code: 'M-OOR-ACT-APPROVE',
    role_id: 'Reviewer',
    transition_id: 'transition_approve',
    method_definition_id: 'method-1',
    scope: { entity_type: 'Domain_Module', allowed_statuses: ['Draft'] }
  },
  {
    id: 'mandate-3',
    code: 'M-OOR-ACT-REJECT',
    role_id: 'Reviewer',
    transition_id: 'transition_reject',
    method_definition_id: 'method-2',
    scope: { entity_type: 'Domain_Module', allowed_statuses: ['Validated'] }
  },
  {
    id: 'mandate-4',
    code: 'M-OOR-ACT-REJECT',
    role_id: 'Analyst',
    transition_id: 'transition_reject',
    method_definition_id: 'method-2',
    scope: { entity_type: 'Domain_Module', allowed_statuses: ['Validated'] }
  },
  {
    id: 'mandate-5',
    code: 'M-OOR-ACT-FREEZE',
    role_id: 'Reviewer',
    transition_id: 'transition_freeze',
    method_definition_id: 'method-3',
    scope: { entity_type: 'Domain_Module', allowed_statuses: ['Validated'] }
  },
]

export const mockTransitions = [
  {
    id: 'transition_approve',
    code: 'transition_approve',
    from_status: 'Draft',
    to_status: 'Validated',
    method: 'approveDomainModule()',
    description: 'Утверждение артефакта после проверки'
  },
  {
    id: 'transition_reject',
    code: 'transition_reject',
    from_status: 'Validated',
    to_status: 'Draft',
    method: 'rejectDomainModule()',
    description: 'Возврат на доработку'
  },
  {
    id: 'transition_freeze',
    code: 'transition_freeze',
    from_status: 'Validated',
    to_status: 'Frozen',
    method: 'freezeDomainModule()',
    description: 'Фиксация версии'
  },
]

// Данные для трассировки (Traceability Chain)
export const traceabilityData = {
  approve: {
    ui_element: 'Кнопка "Утвердить"',
    mandate: 'M-OOR-ACT-APPROVE',
    transition: 'transition_approve',
    method: 'approveDomainModule()',
    description: 'Трассировка: UI → Мандат → Переход → Метод'
  },
  reject: {
    ui_element: 'Кнопка "Вернуть на доработку"',
    mandate: 'M-OOR-ACT-REJECT',
    transition: 'transition_reject',
    method: 'rejectDomainModule()',
    description: 'Трассировка: UI → Мандат → Переход → Метод'
  },
  freeze: {
    ui_element: 'Кнопка "Зафиксировать версию"',
    mandate: 'M-OOR-ACT-FREEZE',
    transition: 'transition_freeze',
    method: 'freezeDomainModule()',
    description: 'Трассировка: UI → Мандат → Переход → Метод'
  },
  edit: {
    ui_element: 'Поля редактирования',
    mandate: 'M-OOR-VIEW-DRAFT',
    transition: null,
    method: 'editDomainModule()',
    description: 'Трассировка: UI → Мандат → Метод'
  }
}

// Наследование от [Base] Document (демонстрация)
export const baseDocumentInheritance = {
  '[Base] Document': {
    attributes: ['RegistrationNumber', 'Title', 'Initiator', 'State', 'Жизненный цикл'],
    inherited_by: ['Requirement_Project', 'Domain_Module', 'Method_Definition', 'Authorization_Mandate']
  },
  'Requirement_Project': {
    id: 'RegistrationNumber',
    title: 'Title',
    created_at: 'Жизненный цикл',
    updated_at: 'Жизненный цикл'
  },
  'Domain_Module': {
    id: 'RegistrationNumber',
    name: 'Title',
    status: 'State',
    created_at: 'Жизненный цикл',
    updated_at: 'Жизненный цикл'
  }
}
