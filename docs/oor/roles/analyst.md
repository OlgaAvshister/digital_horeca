# Роль: Analyst (Аналитик)

**Идентификатор роли:** `Analyst`
**Abstract:** Нет - роль назначается напрямую.

## 1. Purpose (Назначение)

**Проектировщик смыслов.** Аналитик формулирует и структурирует объектно-ориентированные требования (OOR), проектирует домены и сущности системы, задаёт глоссарий и сценарии. Отвечает за то, чтобы требования были однозначными и пригодными для последующей передачи ИИ-агентам и разработке.

## 2. Domain Visibility (Видимость в домене)

### Domain_Module
- **Read:** [id, project_id, name, description, status, method_definition_ids, created_at, updated_at] (только при `status === Draft` или `status === Validated`)
- **Write:** [name, description] (только при `status === Draft`)

### Requirement_Project
- **Read:** [id, title, description, created_at, updated_at, domain_module_ids]
- **Write:** [title, description] (создание новых проектов)

### Method_Definition
- **Read:** [id, domain_module_id, name, description, rule_schema] (только в рамках Domain_Module со статусом Draft или Validated)
- **Write:** [name, description, rule_schema] (только в рамках Domain_Module со статусом Draft)

### Authorization_Mandate
- **Read:** [id, code, role_id, transition_id, method_definition_id, scope] (только для мандатов, назначенных роли Analyst)
- **Write:** []

## 3. Capabilities (Возможности)

### 3.1 CreateRequirementProject()
Создание нового проекта требований.
- **Мандаты:** M-OOR-CREATE
- **Описание:** Создание Requirement_Project с заполнением полей title и description.

### 3.2 EditDomainModuleDraft()
Редактирование доменных модулей в статусе Draft.
- **Мандаты:** M-OOR-VIEW-DRAFT
- **Описание:** Изменение полей name и description Domain_Module при условии `status === Draft`.

### 3.3 CreateMethodDefinition()
Создание определений методов для доменного модуля.
- **Мандаты:** M-OOR-VIEW-DRAFT
- **Описание:** Создание Method_Definition в рамках Domain_Module со статусом Draft.

### 3.4 ApproveDomainModule()
Утверждение артефакта (перевод Draft → Validated).
- **Мандаты:** M-OOR-ACT-APPROVE
- **Описание:** Инициация перехода состояния Domain_Module из Draft в Validated.

### 3.5 RejectDomainModule()
Возврат артефакта на доработку (перевод Validated → Draft).
- **Мандаты:** M-OOR-ACT-REJECT
- **Описание:** Инициация перехода состояния Domain_Module из Validated в Draft.

### 3.6 ViewValidatedArtifacts()
Чтение утверждённых артефактов.
- **Мандаты:** M-OOR-VIEW-VALIDATED
- **Описание:** Доступ на чтение Domain_Module и связанных сущностей при `status === Validated`.

### 3.7 ViewOwnDrafts()
Чтение собственных черновиков.
- **Мандаты:** M-OOR-VIEW-DRAFT
- **Описание:** Доступ на чтение Domain_Module и связанных сущностей при `status === Draft`, созданных текущим пользователем.

## 4. Intent & KPI (Цель и метрики)

**Фокус:** Качество и однозначность требований.

**KPI (Key Performance Indicators):**
- Время от Draft до Validated (среднее)
- Количество возвратов на доработку (reject rate)
- Полнота глоссария (процент покрытия терминов)
- Количество выявленных противоречий в требованиях

## 5. Collaboration (Взаимодействие)

- **С Reviewer:** Передаёт подготовленные требования для проверки и фиксации SSOT (Single Source of Truth). Получает обратную связь по качеству требований.
- **С AI-Developer:** Результаты, утверждённые Reviewer, передаются AI-Developer для генерации кода и синхронизации с IDE.
- **С другими Analyst:** Совместная работа над крупными проектами через разделение доменных модулей.

## 6. Ограничения

- Не выполняет финальное утверждение качества (это роль Reviewer).
- Не генерирует код напрямую (исполнение - роль AI-Developer).
- Действия ограничены мандатами (см. `domains/oor_manager/Mandates.md`), назначенными данной роли.
- Не может переводить артефакты в статус Frozen (только Reviewer).

## 7. Примеры использования

1. **Создание нового проекта требований:**
   - Analyst создаёт Requirement_Project с названием "Система управления заказами"
   - Добавляет Domain_Module "OrderManagement" в статусе Draft
   - Определяет Method_Definition "createOrder", "cancelOrder"

2. **Утверждение артефакта:**
   - После завершения работы над Domain_Module Analyst инициирует переход Draft → Validated
   - Для этого требуется мандат M-OOR-ACT-APPROVE
   - После утверждения артефакт становится доступен AI-Developer для генерации кода
