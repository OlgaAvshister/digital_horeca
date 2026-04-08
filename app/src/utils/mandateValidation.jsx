// Утилиты для валидации мандатов в компонентах React
// Обеспечивает проверку прав доступа на основе ролей и мандатов OOR-IDE

import { mandates, roleMandates } from '../data/mandates.js'

/**
 * Проверяет, имеет ли роль доступ к указанному мандату
 * @param {string} role - Роль пользователя (Analyst, Reviewer, AI-Developer)
 * @param {string} mandateId - ID мандата (например, 'M-OOR-ACT-APPROVE')
 * @returns {boolean} - true если роль имеет доступ к мандату
 */
export function hasMandate(role, mandateId) {
  if (!role || !mandateId) return false
  
  const roleMandateList = roleMandates[role]
  if (!roleMandateList) return false
  
  return roleMandateList.includes(mandateId)
}

/**
 * Проверяет, может ли роль выполнить действие для сущности с текущим статусом
 * @param {string} role - Роль пользователя
 * @param {string} mandateId - ID мандата действия
 * @param {string} currentStatus - Текущий статус сущности
 * @returns {Object} - Результат проверки { isValid: boolean, reason: string }
 */
export function validateActionMandate(role, mandateId, currentStatus) {
  if (!hasMandate(role, mandateId)) {
    return {
      isValid: false,
      reason: `Роль '${role}' не имеет мандата '${mandateId}'`
    }
  }
  
  const mandate = mandates[mandateId]
  if (!mandate) {
    return {
      isValid: false,
      reason: `Мандат '${mandateId}' не найден в системе`
    }
  }
  
  if (mandate.type === 'action' && mandate.requiredStatus) {
    if (currentStatus !== mandate.requiredStatus) {
      return {
        isValid: false,
        reason: `Мандат '${mandateId}' требует статус '${mandate.requiredStatus}', текущий статус: '${currentStatus}'`
      }
    }
  }
  
  return {
    isValid: true,
    reason: 'Действие разрешено',
    mandate,
    targetStatus: mandate.targetStatus
  }
}

/**
 * Проверяет, может ли роль просматривать сущность с указанным статусом
 * @param {string} role - Роль пользователя
 * @param {string} entityStatus - Статус сущности
 * @returns {boolean} - true если роль может просматривать сущность
 */
export function canViewEntity(role, entityStatus) {
  const viewMandates = {
    'Draft': ['M-OOR-VIEW-DRAFT', 'M-OOR-EDIT-DRAFT'],
    'Validated': ['M-OOR-VIEW-VALIDATED', 'M-OOR-READ-VALIDATED'],
    'Frozen': ['M-OOR-VIEW-FROZEN', 'M-OOR-READ-VALIDATED']
  }
  
  const mandatesForStatus = viewMandates[entityStatus] || []
  return mandatesForStatus.some(mandateId => hasMandate(role, mandateId))
}

/**
 * Проверяет, может ли роль редактировать сущность с указанным статусом
 * @param {string} role - Роль пользователя
 * @param {string} entityStatus - Статус сущности
 * @returns {boolean} - true если роль может редактировать сущность
 */
export function canEditEntity(role, entityStatus) {
  if (entityStatus === 'Draft') {
    return hasMandate(role, 'M-OOR-EDIT-DRAFT')
  }
  return false
}

/**
 * Возвращает список доступных действий для роли и статуса сущности
 * @param {string} role - Роль пользователя
 * @param {string} entityStatus - Статус сущности
 * @returns {Array} - Массив доступных мандатов действий
 */
export function getAvailableActions(role, entityStatus) {
  const allActionMandates = Object.values(mandates).filter(m => m.type === 'action')
  
  return allActionMandates
    .filter(mandate => {
      // Проверяем, имеет ли роль доступ к мандату
      if (!hasMandate(role, mandate.id)) return false
      
      // Проверяем, соответствует ли текущий статус требуемому статусу мандата
      if (mandate.requiredStatus && mandate.requiredStatus !== entityStatus) return false
      
      return true
    })
    .map(mandate => ({
      id: mandate.id,
      label: getActionLabel(mandate.id),
      description: mandate.description,
      targetStatus: mandate.targetStatus
    }))
}

/**
 * Возвращает понятное название действия по ID мандата
 * @param {string} mandateId - ID мандата
 * @returns {string} - Понятное название действия
 */
export function getActionLabel(mandateId) {
  const labels = {
    'M-OOR-ACT-APPROVE': 'Утвердить',
    'M-OOR-ACT-REJECT': 'Вернуть на доработку',
    'M-OOR-ACT-FREEZE': 'Зафиксировать версию',
    'M-OOR-EDIT-DRAFT': 'Редактировать',
    'M-OOR-CREATE': 'Создать'
  }
  
  return labels[mandateId] || mandateId
}

/**
 * Хук React для валидации мандатов в компонентах
 * @param {string} role - Текущая роль пользователя
 * @returns {Object} - Объект с функциями валидации
 */
export function useMandateValidation(role) {
  return {
    hasMandate: (mandateId) => hasMandate(role, mandateId),
    validateAction: (mandateId, currentStatus) => validateActionMandate(role, mandateId, currentStatus),
    canView: (entityStatus) => canViewEntity(role, entityStatus),
    canEdit: (entityStatus) => canEditEntity(role, entityStatus),
    getAvailableActions: (entityStatus) => getAvailableActions(role, entityStatus),
    getActionLabel
  }
}

/**
 * Компонент-обёртка для условного рендеринга на основе мандатов
 * @param {Object} props - Свойства компонента
 * @param {string} props.role - Роль пользователя
 * @param {string} props.mandateId - ID мандата для проверки
 * @param {string} props.entityStatus - Статус сущности (для action мандатов)
 * @param {ReactNode} props.children - Дочерние элементы для рендеринга
 * @param {ReactNode} props.fallback - Элемент для рендеринга если мандат отсутствует
 * @returns {ReactNode} - Дочерние элементы или fallback
 */
export function MandateGuard({ role, mandateId, entityStatus, children, fallback = null }) {
  let hasAccess = false
  
  if (mandateId.startsWith('M-OOR-ACT-')) {
    // Для action мандатов проверяем валидацию с учётом статуса
    const validation = validateActionMandate(role, mandateId, entityStatus)
    hasAccess = validation.isValid
  } else {
    // Для view/edit мандатов проверяем только наличие
    hasAccess = hasMandate(role, mandateId)
  }
  
  return hasAccess ? children : fallback
}

/**
 * Декоратор для кнопок действий с валидацией мандатов
 * @param {Object} props - Свойства кнопки
 * @param {string} props.role - Роль пользователя
 * @param {string} props.mandateId - ID мандата
 * @param {string} props.entityStatus - Статус сущности
 * @param {Function} props.onClick - Обработчик клика
 * @param {Object} props.buttonProps - Дополнительные свойства кнопки
 * @returns {ReactNode} - Кнопка или disabled кнопка
 */
export function MandateButton({ role, mandateId, entityStatus, onClick, children, ...buttonProps }) {
  const validation = validateActionMandate(role, mandateId, entityStatus)
  const label = getActionLabel(mandateId)
  
  const handleClick = (e) => {
    if (!validation.isValid) {
      e.preventDefault()
      alert(`Действие запрещено: ${validation.reason}`)
      return
    }
    
    if (onClick) {
      onClick(e, validation)
    }
  }
  
  return (
    <button
      {...buttonProps}
      onClick={handleClick}
      disabled={!validation.isValid}
      title={!validation.isValid ? validation.reason : ''}
    >
      {children || label}
    </button>
  )
}