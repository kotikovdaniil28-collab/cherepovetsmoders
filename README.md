# CHEREPOVETS 89 — Vercel fixed single-page build

Исправление для деплоя на Vercel:

- используется один основной `index.html` из Gemini-дизайна;
- основная страница сайта остаётся внутри `index.html` и открывается после успешного входа;
- авторизация подключена через Supabase Auth, настройки вынесены в `supabase.config.js`;
- нет перехода на `/dashboard.html`, поэтому после входа не будет `404 Not Found`;
- добавлен `vercel.json` с rewrites на `index.html` для `/dashboard` и любых внутренних путей;
- добавлены модальные окна условий использования и политики конфиденциальности;
- `public/` продублирован на случай, если в Vercel выбран output directory `public`.

## Supabase

В файле `supabase.config.js` укажите URL проекта и publishable/anon key:

```js
window.CH89_SUPABASE_URL = 'https://your-project.supabase.co';
window.CH89_SUPABASE_ANON_KEY = 'your-publishable-or-anon-key';
```

В Supabase Dashboard включите `Authentication -> Providers -> Email`.

## Как заливать

Лучший вариант: очистить репозиторий и залить содержимое этого архива целиком.
Не докидывать поверх старого архива, иначе в репозитории могут остаться старые `package.json`, `dashboard.html` и Vite-настройки.

На Vercel желательно выставить:

- Framework Preset: Other
- Build Command: пусто
- Output Directory: пусто или `public`, если проект уже так настроен
