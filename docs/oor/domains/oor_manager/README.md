# Домен: oor_manager

Домен управления объектно-ориентированными требованиями в OOR-IDE.

| Раздел | Описание |
|--------|----------|
| [Entities](Entities.md) | Сущности и типы данных для хранения требований |
| [Transitions](Transitions.md) | Жизненный цикл требований (Draft - Validated - Frozen) |
| [Rules](Rules.md) | Правила и инварианты проверок |
| [Mandates](Mandates.md) | Назначение прав ролям на переходы и действия |

Все артефакты домена наследуют от [Base] Document (см. [глоссарий](../../glossary/README.md)).

---

## Workflow домена (Mermaid)

```mermaid
flowchart TD
    %% Роли
    A[Analyst] -->|создает| P[Requirement_Project]
    A -->|редактирует| DM_Draft[Domain_Module<br/>Draft]
    A -->|определяет| MD[Method_Definition]
    
    DM_Draft -->|approve| DM_Validated[Domain_Module<br/>Validated]
    DM_Validated -->|reject| DM_Draft
    DM_Validated -->|freeze| DM_Frozen[Domain_Module<br/>Frozen]
    
    R[Reviewer] -->|проверяет| DM_Draft
    R -->|утверждает| DM_Validated
    R -->|фиксирует| DM_Frozen
    
    AI[AI-Developer] -->|читает| DM_Validated
    AI -->|читает| DM_Frozen
    AI -->|генерирует код| Code[Код]
    
    %% Мандаты
    M1[M-OOR-CREATE] --> A
    M2[M-OOR-VIEW-DRAFT] --> A
    M3[M-OOR-ACT-APPROVE] --> A
    M3 --> R
    M4[M-OOR-ACT-REJECT] --> A
    M4 --> R
    M5[M-OOR-ACT-FREEZE] --> R
    M6[M-OOR-VIEW-VALIDATED] --> AI
    
    %% Стили
    classDef role fill:#e1f5fe,stroke:#01579b
    classDef entity fill:#f3e5f5,stroke:#4a148c
    classDef mandate fill:#e8f5e8,stroke:#1b5e20
    
    class A,R,AI role
    class P,DM_Draft,DM_Validated,DM_Frozen,MD,Code entity
    class M1,M2,M3,M4,M5,M6 mandate
```

---

## Ключевые концепции

### 1. Наследование от [Base] Document
Все сущности домена (Requirement_Project, Domain_Module, Method_Definition, Authorization_Mandate) наследуют атрибуты базового документа:
- `id` (UUID) - уникальный идентификатор
- `title`/`name` - название
- `created_at`/`updated_at` - жизненный цикл
- Неявный `created_by` - создатель

### 2. Жизненный цикл Domain_Module
- **Draft** - разработка Analyst, редактирование разрешено
- **Validated** - утверждён Reviewer, доступен AI-Developer
- **Frozen** - зафиксированная версия, неизменяема

### 3. Трассируемость
Каждое действие в системе прослеживается через цепочку:
```
UI элемент → Мандат → Переход → Method_Definition → Код реализации
```

### 4. Роли и мандаты
- **Analyst** - создание и редактирование Draft, утверждение/возврат
- **Reviewer** - проверка, утверждение, фиксация версий  
- **AI-Developer** - чтение Validated/Frozen артефактов, генерация кода

---

## Связи между артефактами

1. **Requirement_Project** содержит множество **Domain_Module**
2. **Domain_Module** содержит множество **Method_Definition**
3. **Authorization_Mandate** ссылается на **Transition** и **Method_Definition**
4. **Transition** определяет изменение состояния **Domain_Module**
5. **Rules** проверяют корректность всех операций

---

## Использование в OOR-IDE

Домен `oor_manager` является центральным для работы OOR-IDE:
- **Analyst** использует редактор сущностей для создания требований
- **Reviewer** использует панель проверки для утверждения артефактов
- **AI-Developer** использует панель AI-Sync для получения контекста
- Все действия проверяются через **Mandates** и **Rules**

Подробнее в [сценариях использования](../../scenarios.md).
