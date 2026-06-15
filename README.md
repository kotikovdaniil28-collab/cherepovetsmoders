# Cherepovets 89 — v9 stable assets

Сборка сделана из приложенного монолитного `index.html` и старой zip-структуры.

## Структура

```txt
index.html
assets/css/app.css
assets/js/app.js
assets/img/favicon.png
check-refactor.mjs
README.md
```

## Что сделано

- Весь встроенный CSS из монолитного `index.html` вынесен в `assets/css/app.css`.
- Весь встроенный JS из монолитного `index.html` вынесен в `assets/js/app.js` с сохранением порядка выполнения.
- Base64 favicon вынесен в `assets/img/favicon.png`.
- Удалены повторяющиеся Cloudflare beacon-скрипты, которые не нужны для GitHub Pages/обычного хостинга.
- Добавлен лёгкий слой стабилизации интерфейса: меньше hover-прыжков, меньше дёрганий от анимаций, нормальная прокрутка на мобильных.
- Подключение Supabase оставлено через CDN, как в исходном файле.

## Проверка

```bash
node --check assets/js/app.js
node check-refactor.mjs
```

## Загрузка

Загрузите содержимое этой папки в корень сайта/репозитория. Главный файл должен называться `index.html`.
