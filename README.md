# Cherepovets 89 — v8 clean assets legacy UI

Эта версия собрана по правильной схеме:

```txt
index.html
assets/css/app.css
assets/js/app.js
check-refactor.mjs
README.md
```

## Что изменено

- Внешний вид входа и общей панели приближен к старому дизайну.
- Код больше не является старым монолитом на 30 000 строк.
- CSS вынесен в `assets/css/app.css`.
- JS вынесен в `assets/js/app.js`.
- Проверка сессии не должна висеть бесконечно: есть timeout.
- АП/ФСБ/Организации не возвращались.
- Старые MutationObserver-патчи не используются.

## Как загрузить на GitHub Pages

1. Загрузить в корень репозитория содержимое этой папки.
2. Главный файл должен называться `index.html`.
3. Включить GitHub Pages: Settings → Pages → Deploy from branch → main → /root.
4. После публикации открыть сайт через Ctrl+F5 или в инкогнито.

## Проверка локально

```bash
node --check assets/js/app.js
node check-refactor.mjs
```
