# Cherepovets89 site — Supabase hcefoztytkfskmdchqos

В этой сборке сайт подключен к новому Supabase-проекту:

`https://hcefoztytkfskmdchqos.supabase.co`

Публичный ключ сайта находится в:

- `supabase.config.js`
- `public/supabase.config.js`

Перед первым запуском открой Supabase -> SQL Editor и выполни:

`supabase/full_schema_new_db.sql`

Важно: SQL создаёт таблицы сайта (`reports`, `user_stats`, `admin_logs`, `vk_links`, `vk_report_sessions`), но не переносит старых Auth-пользователей и пароли. Пользователи должны зарегистрироваться заново, либо их нужно мигрировать отдельно из старого Supabase Auth.

Для VK-бота в Vercel нужно поставить тот же URL Supabase и service role key именно от этого нового проекта.
