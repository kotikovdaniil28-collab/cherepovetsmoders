# Cherepovets 89 Refactored Panel

Чистая сборка панели модерации без разделов АП и ФСБ.

## Структура

```txt
index.refactored.html
assets/css/app.css
assets/js/app.js
check-refactor.mjs
```

## Запуск локально

```bash
python -m http.server 8080
```

Открыть:

```txt
http://localhost:8080/index.refactored.html
```

## Проверка

```bash
node check-refactor.mjs
node --check assets/js/app.js
```

## Миграция

1. Сохранить старый файл как `index.legacy.working.html`.
2. Залить `index.refactored.html` рядом и проверить на домене.
3. После проверки переименовать `index.refactored.html` в `index.html`.

## Что внутри

- Supabase auth.
- Роли: player, moderator, senior, mod_leadership, creator.
- Отчёты и таблица отчётов.
- Магазин модерации.
- Игры.
- Тренажёр, жалобы, квесты.
- Руководство, creator-панель, логи.
- AI Gemini / DeepSeek через настройки creator-панели.

API-ключи AI всё ещё используются клиентом. Для продакшена лучше вынести вызовы в Supabase Edge Function.
