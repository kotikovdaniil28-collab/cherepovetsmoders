# CHEREPOVETS 89 — full functional redesign v35

Это сборка от старого рабочего сайта, а не Next-тренажёр.

Сохранены основные функции старой версии:

- Supabase Auth и профиль пользователя;
- сдача отчётов;
- подача неактивов;
- таблица отчётов;
- руководство модерации;
- руководство АП;
- панель создателя;
- логи;
- магазины;
- лидерборд;
- игровой XP;
- реальный XP;
- баллы АП;
- разделы общего доступа и служебные панели.

Дизайн вынесен в отдельный CSS-файл:

```text
assets/cherepovets-redesign-v35.css
public/assets/cherepovets-redesign-v35.css
```

Рабочий JavaScript старого сайта не переписывался.

## Supabase

В файле `supabase.config.js` укажите URL проекта и publishable/anon key:

```js
window.CH89_SUPABASE_URL = 'https://your-project.supabase.co';
window.CH89_SUPABASE_ANON_KEY = 'your-publishable-or-anon-key';
```

В Supabase Dashboard включите `Authentication -> Providers -> Email`.

## Как заливать

Лучший вариант: очистить репозиторий и залить содержимое этого архива целиком.
Не докидывать поверх Next-версии, иначе в репозитории могут остаться старые `package.json`, `.next`, `src/`, Vite/Next-настройки.

На Vercel желательно выставить:

- Framework Preset: Other
- Build Command: пусто
- Output Directory: пусто или `public`, если проект уже так настроен
