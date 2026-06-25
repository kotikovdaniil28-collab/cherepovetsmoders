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

## VK-бот для отчетов

В этой версии добавлен блок привязки VK ID на странице отчетности. Пользователь заходит на сайт под своим аккаунтом, вводит числовой VK ID, после чего может сдавать отчет в VK командой `/отчет`.

Перед запуском:

1. В Supabase SQL Editor выполните `supabase/vk_links.sql`.
2. Убедитесь, что сайт и бот смотрят в один и тот же Supabase-проект.
3. В `supabase.config.js` на сайте должен быть только public anon/publishable key. `service_role` / `sb_secret_*` нельзя хранить во фронтенде.
4. Для бота используйте отдельный архив `cherepovets89-vk-report-bot.zip`.

Если меняете Supabase-проект, возьмите новый anon/publishable key в Supabase Dashboard и вставьте его в `supabase.config.js`. Secret/service_role key используется только в `.env` бота.
