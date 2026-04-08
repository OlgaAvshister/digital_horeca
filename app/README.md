# OOR-IDE - веб-прототип

MVP интерфейса системы управления требованиями OOR-IDE (редактор сущностей, State Machine, AI-Sync).

## Запуск

```bash
cd app
npm install
npm run dev
```

Откройте в браузере адрес, который выведет Vite (обычно http://localhost:5173).

## Сборка

```bash
npm run build
npm run preview
```

## Структура

- `src/App.jsx` - состояние (роль, выбранный модуль, вид), Layout и AI-Sync.
- `src/components/Layout.jsx` - трёхколоночный layout: навигация, контент, AI-Sync.
- `src/components/EntityEditor.jsx` - форма модуля, кнопки переходов (привязаны к мандатам).
- `src/components/StateMachineViewer.jsx` - рендер Mermaid-диаграммы из Transitions.
- `src/data/mock.js` - тестовые проекты и модули.

Спецификации и трассировка: см. `../docs/oor/` и `../.cursorrules`.
