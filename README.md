# Cherepovets 89 v26 — Vercel fixed

Исправлена проблема 404 при Output Directory = public: добавлены public/index.html и public/404.html.
Также index.html остаётся в корне для обычного статического деплоя.

Для Vercel:
- Framework Preset: Other
- Build Command: пусто
- Output Directory: пусто или public
- Root Directory: корень репозитория
