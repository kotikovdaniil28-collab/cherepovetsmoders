# CHEREPOVETS 89 — Vercel fixed single-page build

Исправление для деплоя на Vercel:

- используется один основной `index.html` из Gemini-дизайна;
- нет перехода на `/dashboard.html`, поэтому после входа не будет `404 Not Found`;
- добавлен `vercel.json` с rewrites на `index.html` для `/dashboard` и любых внутренних путей;
- добавлены модальные окна условий использования и политики конфиденциальности;
- `public/` продублирован на случай, если в Vercel выбран output directory `public`.

## Как заливать

Лучший вариант: очистить репозиторий и залить содержимое этого архива целиком.
Не докидывать поверх старого архива, иначе в репозитории могут остаться старые `package.json`, `dashboard.html` и Vite-настройки.

На Vercel желательно выставить:

- Framework Preset: Other
- Build Command: пусто
- Output Directory: пусто или `public`, если проект уже так настроен
