# ТЕХНИЧЕСКОЕ ЗАДАНИЕ: «Новогодняя Ёлка 2027»
## Telegram Mini App + Supabase Backend

> **Актуализация:** добавлены вызовы `window.ElkaBackend.logEvent(...)` для отслеживания клиентских событий аналитики (`daily_claim`, `santa_caught`, `gift_tapped`, `share_copied`, `star_upgraded`, `palette_bought`).

## 1. АРХИТЕКТУРА И СОСТОЯНИЕ
- Клиент корректно синхронизирует состояние с Supabase при старте через `tg-auth` и `SupabaseAdapter.load()`.
- События логируются в таблицу `events` через `backend.js` как на бэкенде, так и на клиенте.
- Отладка доступна через кнопку 🔍 в правом нижнем углу.