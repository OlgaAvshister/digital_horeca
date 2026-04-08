# Mandates - распределение прав доступа

Назначение мандатов ролям в домене oor_manager. Каждый мандат связывает роль с переходом или действием; проверка выполняется по [Rules](Rules.md) (в т.ч. R-MANDATE-TRANSITION-EXISTS, R-TRANSITION-MANDATE-REQUIRED).

---

## Стандарт слоя мандатов (OOR - Этап 5)

**Назначение:** Единый шаблон и правила описания мандатов по всем доменам. Мандат - формализованное разрешение, которое домен выдаёт роли; единственный легальный способ доступа к данным или действиям внутри домена.

### 1. Концепция слоя
Мандат отделяет личность (кто просит) от логики (что разрешено). В коде транслируется в слой политик доступа (Policies), разрешений (Permissions) и фильтров данных (Data Scopes).

### 2. Типология мандатов

**A. Action Mandates (Мандаты на действие)**
Дают право на инициацию конкретного метода (перехода состояния), описанного в transitions.md домена.

- **Связь:** Role → Transition Method
- **Префикс ID:** M-[DOM]-ACT-
- **Пример:** M-OOR-ACT-APPROVE, M-OOR-ACT-REJECT

**B. Visibility Mandates (Мандаты на видимость)**
Определяют "горизонт видимости" - какие атрибуты сущности из entities.md доступны данной роли для чтения или редактирования.

- **Связь:** Role → Entity Attributes
- **Префикс ID:** M-[DOM]-VIEW-
- **Пример:** M-OOR-VIEW-DRAFT, M-OOR-VIEW-VALIDATED

---

## 3. Стандарт описания (реестр мандатов)

### Action Mandates - таблица

| ID мандата | Тип | Целевой объект (Target) | Условия (Rules) | Описание |
|------------|-----|-------------------------|-----------------|----------|
| M-OOR-ACT-APPROVE | Action | Transitions.md#transition_approve | Rules.md#R-TRANSITION-FROM-STATUS | Утверждение артефакта: перевод доменного модуля в статус Validated |
| M-OOR-ACT-REJECT | Action | Transitions.md#transition_reject | Rules.md#R-TRANSITION-FROM-STATUS | Возврат на доработку: перевод из Validated в Draft |
| M-OOR-ACT-FREEZE | Action | Transitions.md#transition_freeze | Rules.md#R-TRANSITION-FROM-STATUS | Фиксация версии: перевод в Frozen для релиза или архива |

### Visibility Mandates - таблица

| ID мандата | Тип | Сущность (Target) | Доступные поля / уровень | Описание |
|------------|-----|-------------------|--------------------------|----------|
| M-OOR-VIEW-DRAFT | Visibility | Entities.md#Domain_Module | Read: [name, description, status, created_at, updated_at]; Write: [name, description] (только при status = Draft) | Чтение и редактирование черновиков |
| M-OOR-VIEW-VALIDATED | Visibility | Entities.md#Domain_Module | Read: [all fields] | Чтение утверждённых артефактов |
| M-OOR-CREATE | Visibility | Entities.md#Requirement_Project | Write: [title, description] | Создание новых проектов требований |

---

## 4. Распределение по ролям

### Analyst (Аналитик)
- **Action Mandates:** M-OOR-ACT-APPROVE (утверждение), M-OOR-ACT-REJECT (возврат на доработку)
- **Visibility Mandates:** M-OOR-CREATE, M-OOR-VIEW-DRAFT, M-OOR-VIEW-VALIDATED

### Reviewer (Рецензент)
- **Action Mandates:** M-OOR-ACT-APPROVE, M-OOR-ACT-REJECT, M-OOR-ACT-FREEZE
- **Visibility Mandates:** M-OOR-VIEW-DRAFT, M-OOR-VIEW-VALIDATED

### AI-Developer (ИИ-разработчик)
- **Action Mandates:** (нет)
- **Visibility Mandates:** M-OOR-VIEW-VALIDATED (только чтение утверждённых артефактов)

---

## 5. Правила для аналитика

1. **Запрет прямых ссылок:** В профиле роли (roles/) никогда не ссылайтесь на Transitions.md напрямую. Всегда ссылайтесь на мандат (ID).
2. **Атомарность:** Один мандат - одно конкретное право. Не создавать мандат вида "Доступ ко всему домену".
3. **Синхронизация:** Если в Transitions.md добавлен новый метод, в Mandates.md обязан появиться соответствующий M-ACT.
4. **Связь с UI:** Этап 6 (UI Flow) опирается на мандаты: нет мандата - нет кнопки/действия в интерфейсе.

---

## 6. Именование методов для трассировки

В доменах с таблицей переходов "Из состояния | В состояние | Действие | Роль" в Transitions.md должна быть колонка "Метод" с явными именами методов (например `approveDomainModule()`, `rejectDomainModule()`) для однозначной трассировки Target в мандатах.

---

## 7. Трассировка до UI

В интерфейсе OOR-IDE каждая кнопка или действие должно быть привязано к мандату и при необходимости к переходу:

- Кнопка "Утвердить" (Draft - Validated) - мандат **M-OOR-ACT-APPROVE**, переход `transition_approve`.
- Кнопка "Вернуть на доработку" - **M-OOR-ACT-REJECT**, переход `transition_reject`.
- Кнопка "Зафиксировать версию" - **M-OOR-ACT-FREEZE**, переход `transition_freeze`.
- Редактирование полей артефакта в Draft - **M-OOR-VIEW-DRAFT** (проверка роли и статуса перед сохранением).

Это обеспечивает выполнение критерия Traceability: от кнопки до Mandate и Transition (см. [глоссарий](../../glossary/core/README.md) - Traceability Chain).

---

## 8. Ссылки

- [roles/_map.yaml](../../roles/_map.yaml) - реестр ролей и capabilities
- [index.yaml](../../index.yaml) - навигация по доменам и specs (в т.ч. mandates)
