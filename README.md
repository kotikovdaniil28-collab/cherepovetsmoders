# CH89 v11 auth-visible-stable

Исправление поверх v10: после успешной авторизации основной интерфейс принудительно раскрывается, даже если старый auth-patch оставил `ch89-auth-lock` или не успел снять экран входа.

Структура для Vercel:

- `index.html`
- `assets/css/app.css`
- `assets/js/app.js`
- `assets/img/favicon.png`

Проверки:

```bash
node --check assets/js/app.js
node check-refactor.mjs
```
