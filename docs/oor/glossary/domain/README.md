# Domain Glossary: oor_manager

Терминология домена управления объектно-ориентированными требованиями в OOR-IDE.

## Requirement_Project (Проект требований)

**Definition:** Корневой контейнер для набора требований одного проекта/продукта. Служит для группировки доменных модулей и управления их жизненным циклом.

**Наследование:** Наследует от [Base] Document.

**Business Attributes:**
- `id` (UUID) → RegistrationNumber - Уникальный идентификатор проекта
- `title` (string) → Title - Название проекта требований
- `description` (string, optional) → Описание проекта, цели и scope
- `created_at` (ISO 8601 datetime) → Дата и время создания проекта
- `updated_at` (ISO 8601 datetime) → Дата и время последнего обновления проекта
- `domain_module_ids` (UUID[]) → Список идентификаторов доменных модулей, входящих в проект

**Constraints:**
- Проект может содержать ноль или более Domain_Module
- При удалении проекта все связанные Domain_Module должны быть обработаны согласно правилам домена

## Domain_Module (Доменный модуль)

**Definition:** Логический модуль внутри проекта (например, подсистема или слой OOR: сущности, переходы, правила). Связан с жизненным циклом (статус Draft / Validated / Frozen). Является основной единицей работы в OOR-IDE.

**Наследование:** Наследует от [Base] Document.

**Business Attributes:**
- `id` (UUID) → RegistrationNumber - Уникальный идентификатор модуля
- `project_id` (UUID) → Ссылка на Requirement_Project, к которому принадлежит модуль
- `name` (string) → Имя модуля (например, `oor_manager`, `order_management`)
- `description` (string, optional) → Описание назначения и содержания модуля
- `status` (enum) → Текущий статус: `Draft` | `Validated` | `Frozen`
- `method_definition_ids` (UUID[]) → Идентификаторы определений методов/операций (Method_Definition)
- `created_at` (ISO 8601 datetime) → Дата и время создания модуля
- `updated_at` (ISO 8601 datetime) → Дата и время последнего обновления модуля

**Lifecycle:**
- `Draft` - модуль находится в разработке, доступен для редактирования Analyst
- `Validated` - модуль утверждён Reviewer, доступен только для чтения
- `Frozen` - модуль зафиксирован как неизменяемая версия

## Method_Definition (Определение метода)

**Definition:** Описание операции над сущностями или перехода (например, "создать требование", "перевести в Validated"). Используется для трассировки и привязки мандатов. Каждый метод соответствует конкретному действию в системе.

**Наследование:** Наследует от [Base] Document.

**Business Attributes:**
- `id` (UUID) → RegistrationNumber - Уникальный идентификатор определения метода
- `domain_module_id` (UUID) → Ссылка на Domain_Module, к которому принадлежит метод
- `name` (string) → Имя метода (например, `approve`, `freeze`, `create_requirement`)
- `description` (string, optional) → Описание операции, её назначения и поведения
- `rule_schema` (JSON, optional) → Схема или идентификатор правила проверки. Может содержать:
  - `rule_id` (UUID) - ссылка на правило из Rules.md
  - `params` (object) - параметры для проверки правила
  - `condition` (string) - встроенное условие проверки

**Usage:** Method_Definition используется для:
- Трассировки кода к требованиям (генерация кода AI-Developer)
- Привязки мандатов к конкретным операциям
- Валидации действий через правила

## Authorization_Mandate (Мандат на авторизацию)

**Definition:** Назначение роли права на выполнение перехода или операции. Связывает роль и переход. Является формальным разрешением, проверяемым при выполнении действий в системе.

**Наследование:** Наследует от [Base] Document.

**Business Attributes:**
- `id` (UUID) → RegistrationNumber - Уникальный идентификатор мандата
- `code` (string) → Код мандата (например, `M-OOR-ACT-APPROVE`, `M-OOR-VIEW-DRAFT`)
- `role_id` (string) → Идентификатор роли: `Analyst` | `AI-Developer` | `Reviewer`
- `transition_id` (UUID, optional) → Ссылка на допустимый переход (Transition). Обязателен для Action Mandates.
- `method_definition_id` (UUID, optional) → Ссылка на Method_Definition, если мандат привязан к конкретной операции.
- `scope` (JSON, optional) → Дополнительная область действия:
  - `entity_type` (string) - тип сущности, к которой применяется мандат
  - `allowed_statuses` (string[]) - допустимые статусы сущности
  - `filters` (object) - дополнительные фильтры доступа

**Types:**
- **Action Mandate:** Даёт право на выполнение перехода (изменение состояния)
- **Visibility Mandate:** Определяет видимость атрибутов сущности

## Transition (Переход)

**Definition:** Изменение состояния сущности (например, Domain_Module) из одного статуса в другой. Определяет допустимые пути жизненного цикла.

**Business Attributes:**
- `id` (UUID) → Идентификатор перехода
- `code` (string) → Код перехода (например, `transition_approve`, `transition_reject`)
- `from_status` (enum) → Исходное состояние: `Draft` | `Validated` | `Frozen`
- `to_status` (enum) → Целевое состояние: `Draft` | `Validated` | `Frozen`
- `method` (string) → Имя метода для трассировки (например, `approveDomainModule()`, `rejectDomainModule()`)
- `description` (string, optional) → Описание перехода и его условий
- `rule_ids` (UUID[]) → Список идентификаторов правил, которые должны быть проверены перед переходом

**Examples:**
- `Draft` → `Validated` - утверждение артефакта (требует мандат M-OOR-ACT-APPROVE)
- `Validated` → `Draft` - возврат на доработку (требует мандат M-OOR-ACT-REJECT)
- `Validated` → `Frozen` - фиксация версии (требует мандат M-OOR-ACT-FREEZE)

## Rule (Правило)

**Definition:** Инвариант или условие, которое должно выполняться для корректной работы системы. Проверяется при выполнении переходов и изменении данных.

**Business Attributes:**
- `id` (UUID) → Идентификатор правила
- `code` (string) → Код правила (например, `R-MANDATE-TRANSITION-EXISTS`, `R-TRANSITION-FROM-STATUS`)
- `description` (string) → Описание правила на естественном языке
- `condition` (string/JSON) → Формальное условие проверки (может быть выражением, SQL-подобным условием или ссылкой на функцию)
- `scope` (string) → Область применения правила: `global` | `domain` | `entity`
- `error_message` (string, optional) → Сообщение об ошибке при нарушении правила
- `severity` (enum) → Уровень серьёзности: `warning` | `error` | `blocker`

**Examples from Rules.md:**
- Мандат не может ссылаться на несуществующий переход
- Переход возможен только из допустимого предыдущего состояния
- Сущность в статусе Frozen не может быть изменена
