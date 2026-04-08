// Система мандатов OOR-IDE
// Загружает мандаты из документации OOR (в реальной системе - из API, здесь - мок)

// Мандаты из roles/_map.yaml (упрощённая версия для демонстрации)
export const mandates = {
  // Action Mandates (Мандаты на действие)
  'M-OOR-ACT-APPROVE': {
    id: 'M-OOR-ACT-APPROVE',
    type: 'action',
    transition: 'transition_approve',
    method: 'approveDomainModule()',
    description: 'Утверждение артефакта (Draft → Validated)',
    requiredStatus: 'Draft',
    targetStatus: 'Validated'
  },
  'M-OOR-ACT-REJECT': {
    id: 'M-OOR-ACT-REJECT',
    type: 'action',
    transition: 'transition_reject',
    method: 'rejectDomainModule()',
    description: 'Возврат на доработку (Validated → Draft)',
    requiredStatus: 'Validated',
    targetStatus: 'Draft'
  },
  'M-OOR-ACT-FREEZE': {
    id: 'M-OOR-ACT-FREEZE',
    type: 'action',
    transition: 'transition_freeze',
    method: 'freezeDomainModule()',
    description: 'Фиксация версии (Validated → Frozen)',
    requiredStatus: 'Validated',
    targetStatus: 'Frozen'
  },
  
  // Visibility Mandates (Мандаты на видимость)
  'M-OOR-VIEW-DRAFT': {
    id: 'M-OOR-VIEW-DRAFT',
    type: 'visibility',
    entity: 'Domain_Module',
    access: {
      read: ['name', 'description', 'status', 'created_at', 'updated_at', 'method_definition_ids'],
      write: ['name', 'description']
    },
    requiredStatus: 'Draft',
    description: 'Чтение и редактирование черновиков'
  },
  'M-OOR-VIEW-VALIDATED': {
    id: 'M-OOR-VIEW-VALIDATED',
    type: 'visibility',
    entity: 'Domain_Module',
    access: {
      read: ['all'],
      write: []
    },
    requiredStatus: ['Validated', 'Frozen'],
    description: 'Чтение утверждённых артефактов'
  },
  'M-OOR-CREATE': {
    id: 'M-OOR-CREATE',
    type: 'visibility',
    entity: 'Requirement_Project',
    access: {
      read: [],
      write: ['title', 'description']
    },
    requiredStatus: null,
    description: 'Создание новых проектов требований'
  }
};

// Роли и их мандаты (из roles/_map.yaml)
export const roleMandates = {
  'Analyst': [
    'M-OOR-ACT-APPROVE',
    'M-OOR-ACT-REJECT',
    'M-OOR-CREATE',
    'M-OOR-VIEW-DRAFT',
    'M-OOR-VIEW-VALIDATED'
  ],
  'Reviewer': [
    'M-OOR-ACT-APPROVE',
    'M-OOR-ACT-REJECT',
    'M-OOR-ACT-FREEZE',
    'M-OOR-VIEW-DRAFT',
    'M-OOR-VIEW-VALIDATED'
  ],
  'AI-Developer': [
    'M-OOR-VIEW-VALIDATED'
  ]
};

// Переходы (из Transitions.md)
export const transitions = {
  'transition_approve': {
    id: 'transition_approve',
    from: 'Draft',
    to: 'Validated',
    method: 'approveDomainModule()',
    mandate: 'M-OOR-ACT-APPROVE'
  },
  'transition_reject': {
    id: 'transition_reject',
    from: 'Validated',
    to: 'Draft',
    method: 'rejectDomainModule()',
    mandate: 'M-OOR-ACT-REJECT'
  },
  'transition_freeze': {
    id: 'transition_freeze',
    from: 'Validated',
    to: 'Frozen',
    method: 'freezeDomainModule()',
    mandate: 'M-OOR-ACT-FREEZE'
  }
};

// Утилиты для работы с мандатами

/**
 * Проверяет, есть ли у роли указанный мандат
 * @param {string} role - Роль (Analyst, Reviewer, AI-Developer)
 * @param {string} mandateId - ID мандата (например, 'M-OOR-ACT-APPROVE')
 * @returns {boolean}
 */
export function hasMandate(role, mandateId) {
  return roleMandates[role]?.includes(mandateId) || false;
}

/**
 * Проверяет, может ли роль выполнить переход
 * @param {string} role - Роль
 * @param {string} transitionId - ID перехода
 * @returns {boolean}
 */
export function canPerformTransition(role, transitionId) {
  const transition = transitions[transitionId];
  if (!transition) return false;
  
  return hasMandate(role, transition.mandate);
}

/**
 * Проверяет, может ли роль редактировать сущность в текущем статусе
 * @param {string} role - Роль
 * @param {string} entityType - Тип сущности ('Domain_Module', 'Requirement_Project')
 * @param {string} status - Текущий статус сущности
 * @param {string} action - Действие ('read', 'write')
 * @returns {boolean}
 */
export function canAccessEntity(role, entityType, status, action = 'read') {
  // Для каждого мандата visibility проверяем доступ
  const roleMands = roleMandates[role] || [];
  
  for (const mandateId of roleMands) {
    const mandate = mandates[mandateId];
    if (!mandate || mandate.type !== 'visibility') continue;
    
    if (mandate.entity !== entityType) continue;
    
    // Проверка статуса
    if (mandate.requiredStatus !== null) {
      if (Array.isArray(mandate.requiredStatus)) {
        if (!mandate.requiredStatus.includes(status)) continue;
      } else if (mandate.requiredStatus !== status) {
        continue;
      }
    }
    
    // Проверка доступа
    if (action === 'read' && mandate.access.read.length > 0) return true;
    if (action === 'write' && mandate.access.write.length > 0) return true;
  }
  
  return false;
}

/**
 * Возвращает все мандаты роли
 * @param {string} role - Роль
 * @returns {Array} Массив объектов мандатов
 */
export function getRoleMandates(role) {
  const mandateIds = roleMandates[role] || [];
  return mandateIds.map(id => mandates[id]).filter(Boolean);
}

/**
 * Возвращает трассировку для кнопки/действия
 * @param {string} buttonId - Идентификатор кнопки ('approve', 'reject', 'freeze', 'edit')
 * @returns {Object} Объект трассировки
 */
export function getTraceability(buttonId) {
  const traceMap = {
    'approve': {
      button: 'Кнопка "Утвердить"',
      mandate: 'M-OOR-ACT-APPROVE',
      transition: 'transition_approve',
      method: 'approveDomainModule()',
      description: 'Трассировка: UI → Мандат → Переход → Метод'
    },
    'reject': {
      button: 'Кнопка "Вернуть на доработку"',
      mandate: 'M-OOR-ACT-REJECT',
      transition: 'transition_reject',
      method: 'rejectDomainModule()',
      description: 'Трассировка: UI → Мандат → Переход → Метод'
    },
    'freeze': {
      button: 'Кнопка "Зафиксировать версию"',
      mandate: 'M-OOR-ACT-FREEZE',
      transition: 'transition_freeze',
      method: 'freezeDomainModule()',
      description: 'Трассировка: UI → Мандат → Переход → Метод'
    },
    'edit': {
      button: 'Редактирование полей',
      mandate: 'M-OOR-VIEW-DRAFT',
      transition: null,
      method: 'editDomainModule()',
      description: 'Трассировка: UI → Мандат → Метод'
    }
  };
  
  return traceMap[buttonId] || null;
}