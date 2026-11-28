# ТЕХНИЧЕСКОЕ ЗАДАНИЕ: «Новогодняя Ёлка 2027»
## Telegram Mini App + Supabase Backend

> **Назначение документа:** полное описание проекта для передачи в новый чат с ИИ.
> Документ самодостаточен — содержит цели, окружение, архитектуру, механики,
> контракты API, текущее состояние и список ближайших задач.

---

## 1. ОБЗОР ПРОЕКТА

### 1.1 Продукт
Вирусная предновогодняя idle-игра в формате Telegram Mini App. Игрок выращивает
виртуальную ёлку в ночном зимнем лесу: поливает её, приглашает друзей (те зажигают
огоньки на его ёлке), покупает подарки под ёлку и звезду на макушку за Telegram Stars.
Финал сезона — праздничный салют 1–3 января.

### 1.2 Сезон и дедлайны
- Активный сезон: ~ноябрь 2026 → 31 декабря 2026, 23:59:59 (UTC+3)
- Салют: 1–3 января 2027
- Закрытие проекта: ~10 января 2027 (таблица аналитики чистится)

### 1.3 Ключевые принципы
1. **Zero-click вирусность** — зашёл по ссылке → твой огонёк уже горит на чужой ёлке.
   Никаких экранов «создать ёлку» или «зарегистрироваться».
2. **Анонимность по умолчанию** — визиты безымянны; имя дарителя видит только хозяин
   и только у подарков.
3. **Мягкая монетизация** — Stars только на импульсивных эмоциях (подарки, звезда,
   живая вода). Никаких paywall.
4. **Лёгкий рендер** — Canvas 2D, без 3D-движков, 60 FPS на бюджетных смартфонах.
5. **Фронтенд-центричность** — вся отрисовка и игровая логика на клиенте.
   Бэкенд — только синхронизация, визиты и платежи.

---

## 2. ОКРУЖЕНИЕ И РАЗВЁРТЫВАНИЕ

### 2.1 Хостинг клиента
- **GitHub Pages**, репозиторий `elka2027`, пользователь `ivakimaki`
- Базовый URL: `https://ivakimaki.github.io/elka2027/`
- Тестируется через **Telegram Beta** (test environment), бот зарегистрирован
- Все файлы лежат **в корне репозитория**, импорты в `index.html` — **относительные**
  (`styles.css`, `app.js`, `backend.js`, `debug.js`)
- Для сброса кэша при обновлении — добавлять `?v=N` к URL бота в @BotFather

### 2.2 Backend: Supabase
- **URL проекта:** `https://mrhomyamfrqbxeazrtzm.supabase.co`
- **Publishable key (публичный, для клиента):** `sb_publishable_OvCWw_CiJz9n0pj83aIyTA_bAh5Hj73`
- **Service role key:** хранится ТОЛЬКО в секретах Edge Functions
  (`SUPABASE_SERVICE_ROLE_KEY`), в клиент не попадает
- **Секреты для функций:** `TELEGRAM_BOT_TOKEN`, `SUPABASE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY` (Settings → Edge Functions → Secrets)
- Тариф: **Free** (лимиты см. раздел 8)

### 2.3 Важные замечания по окружению
- Клиент открывается **внутри Telegram** (`Telegram.WebApp.initData` доступен только там).
  Вне Telegram бэкенд не инициализируется — это нормально, игра работает локально.
- Тест через кнопку 🧪 в диагностике отправляет **реальный** `initData` из
  `Telegram.WebApp.initData`.
- `publishable` ключ — новый формат (`sb_publishable_...`). Он подставляется в заголовок
  `apikey`. Авторизация для PostgREST идёт через JWT, который выдаёт `tg-auth`.

---

## 3. АРХИТЕКТУРА КЛИЕНТА (разделение на файлы)

Клиент разделён на файлы. Все лежат рядом в корне, импорты относительные.
`debug.js` — опциональный: если его не подключать, игра работает без диагностики.

### 3.1 Структура репозитория
elka2027/
├── index.html     ← разметка + конфиг Supabase + импорты скриптов
├── styles.css     ← все стили (НЕ меняется при интеграции бэкенда)
├── app.js         ← игровая логика + хуки для бэкенда (клиентская модель состояния)
├── backend.js     ← Supabase-адаптер (НОВЫЙ файл интеграции)
└── debug.js       ← диагностика + debug-панель (опционально)

### 3.2 Порядок загрузки в `index.html`
```html
<head>
  <link rel="stylesheet" href="styles.css">
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script>
    // === SUPABASE CONFIG (глобальные константы) ===
    const SUPABASE_URL = 'https://mrhomyamfrqbxeazrtzm.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_OvCWw_CiJz9n0pj83aIyTA_bAh5Hj73';
    const USE_BACKEND = true;
  </script>
</head>
<body>
  <!-- ...разметка #app... -->
  <script src="backend.js"></script>   <!-- создаёт window.ElkaBackend и window.ElkaClientHooks={} -->
  <script src="app.js"></script>       <!-- игровая логика, заполняет ElkaClientHooks -->
  <script src="debug.js"></script>     <!-- диагностика (опционально) -->
</body>
```
**Важно:** `backend.js` подключается ДО `app.js`, потому что `backend.js` создаёт
пустой объект `window.ElkaClientHooks`, а `app.js` заполняет его через `Object.assign`.

### 3.3 Контракт клиент ↔ бэкенд (хуки)
`backend.js` обращается к игре через `window.ElkaClientHooks`. `app.js` обязан их предоставить:

```javascript
window.ElkaClientHooks = window.ElkaClientHooks || {};
Object.assign(window.ElkaClientHooks, {
  getSnapshot: () => snapshot(),              // вернуть полную модель состояния
  applySnapshot: (snap, meta) => { ... },     // применить снапшот с сервера
  patchSnapshot: (patch) => { ... },          // применить частичное обновление
  showToast: (text) => showToast(text),
  playWaterAnimation: () => { ... },          // опционально
  onVisitResult: (data, meta) => { ... },     // опционально
  onPaymentStatus: (status, payload) => { ... } // опционально
});
```

**Форма `snapshot()`** (клиентская модель, синхронизируется с сервером):

‎{
sparks, starLevel, starColor,
unlockedPalettes, unlockedStarColors,
palette,
treeLevel, warmth, lightsCount,
waterDay, waterCount, liveWaterDay, liveWaterCount,
visitDay, visitCount, totalVisits,
dailyLastDate, streakCount,
discountEnd,
groundGifts: [{ kind, icon, label, from, scale, message }]
}

Локальные поля (`visitDay`, `visitCount`, `totalVisits`) НЕ отправляются на сервер,
хранятся в `localStorage` под ключом `elka_2027_local_only_fields_v1`.

### 3.4 Публичное API `window.ElkaBackend`

init(), load(), save⁦(diff)⁩, queueSave(), flushSave(),
water(), visit⁦(ownerId)⁩,
buyGift⁦(ownerId, kind, message)⁩, buyStarLevel⁦(level)⁩,
buyStarGift⁦(ownerId)⁩, buyLiveWater(),
createInvoice⁦(params)⁩, openInvoice⁦(link, payload)⁩,
getDonorIds(), getTreesPreview⁦(ids)⁩, getFriendsCarousel⁦(localVisitedIds)⁩,
getMyShareLink(), copyText⁦(text)⁩,
getState(), reload()

### 3.5 Логика инвайт-ссылки (новое поле `invite_code`)
На бэкенде у `users` появилось поле `invite_code` (уникальный короткий код для шаринга).

```javascript
// Поделиться своей ёлкой — возвращаем короткий код, а не "u<tg_id>"
function getMyShareLink() {
  if (!currentUserRow || !currentUserRow.invite_code) return null;
  return currentUserRow.invite_code;   // ссылка: ?startapp=x7Kp2m
}

// Разбор startapp-параметра при входе гостем
async function parseOwnerIdFromStartParam(startParam) {
  if (!startParam) return null;
  // Старый формат (просто цифры) — для обратной совместимости
  if (/^\d+$/.test(startParam)) return startParam;
  // Новый короткий код (4–10 букв/цифр) → ищем реальный tg_id
  if (/^[a-zA-Z0-9]{4,10}$/.test(startParam)) {
    const { data, error } = await sb
      .from('users').select('tg_id').eq('invite_code', startParam).single();
    if (error || !data) return null;
    return data.tg_id;
  }
  return null;
}
```

---

## 4. СХЕМА БАЗЫ ДАННЫХ

```sql
-- USERS
create table users (
  tg_id            text primary key,
  username         text,
  first_name       text,
  created_at       timestamptz default now(),
  last_seen        timestamptz default now(),
  -- экономика
  sparks           int not null default 45,
  -- прогрессия ёлки
  tree_level       int not null default 1,
  warmth           int not null default 0,
  lights_count     int not null default 4,
  -- звезда
  star_level       int not null default 0,
  star_color       text not null default 'ruby',
  star_source      text,                    -- null=сам, иначе tg_id дарителя
  unlocked_star_colors jsonb not null default '{"ruby":true}',
  -- гирлянда
  palette          text not null default 'champagne',
  unlocked_palettes jsonb not null default '{"champagne":true}',
  -- дневные лимиты
  water_day        date,  water_count      int not null default 0,
  live_water_day   date,  live_water_count int not null default 0,
  daily_last_date  date,  streak_count     int not null default 0,
  -- Дед Мороз / скидка
  santa_last_date  date,
  santa_total      int not null default 0,
  discount_end     timestamptz,
  -- инвайт-код для шаринга
  invite_code      text unique
);

-- GIFTS (подарки под ёлку)
create table gifts (
  id         bigserial primary key,
  owner_id   text not null references users(tg_id),
  donor_id   text not null references users(tg_id),
  kind       text not null,      -- coal|orange|candy|shoe|champagne|bear|horse|car
  message    text,               -- бесплатная подпись до 40 символов
  price_paid int,
  created_at timestamptz default now()
);
create index idx_gifts_owner on gifts(owner_id);
create index idx_gifts_donor on gifts(donor_id);

-- VISITS (визиты / огоньки)
create table visits (
  id         bigserial primary key,
  owner_id   text not null references users(tg_id),
  visitor_id text not null references users(tg_id),
  visit_date date not null default current_date,
  created_at timestamptz default now(),
  unique (owner_id, visitor_id, visit_date)  -- 1 огонёк от друга на ёлку в сутки
);
create index idx_visits_owner_date on visits(owner_id, visit_date);

-- STAR GIFTS (звезда в подарок другу)
create table star_gifts (
  id           bigserial primary key,
  owner_id     text not null references users(tg_id),
  donor_id     text not null references users(tg_id),
  target_level int not null,
  price_paid   int not null,
  created_at   timestamptz default now()
);

-- PAYMENTS (платежи Telegram Stars)
create table payments (
  token      text primary key,   -- payment token из Telegram
  tg_id      text not null,
  item_type  text not null,      -- gift|star_level|star_gift|live_water
  item_ref   jsonb,              -- {kind, owner_id, level, message...}
  amount     int not null,
  status     text not null default 'pending',  -- pending|paid|failed
  created_at timestamptz default now(),
  paid_at    timestamptz
);

-- EVENTS (аналитика, чистится после 10 января)
create table events (
  id         bigserial primary key,
  tg_id      text not null,
  event      text not null,
  payload    jsonb,
  created_at timestamptz default now()
);
create index idx_events_tg_date on events(tg_id, created_at);
```

### 4.1 Row Level Security
```sql
alter table users  enable row level security;
alter table gifts  enable row level security;
alter table visits enable row level security;

create policy users_sel on users for select using (auth.uid()::text = tg_id);
create policy users_upd on users for update using (auth.uid()::text = tg_id);
create policy gifts_sel on gifts for select
  using (auth.uid()::text = owner_id or auth.uid()::text = donor_id);
create policy visits_sel on visits for select using (auth.uid()::text = owner_id);
```
> Записи, меняющие чужие данные или деньги (подарок, визит, звезда другу, покупка),
> идут через Edge Functions с service-ролью, а не напрямую через PostgREST.

---

## 5. ИГРОВЫЕ МЕХАНИКИ

### 5.1 Две валюты
| Валюта | Заработок | Траты |
|---|---|---|
| 🔥 Искры (софт) | Полив +10, ежедневный бонус +50 (стрик 3/7: +100/+250), Дед Мороз +10, визит к другу +10 | Палитры 60–200, цвета звезды 250–400, уровни звезды 1–2 (100/250) |
| ⭐ Telegram Stars | Покупка через `openInvoice` | Подарки 10–100, уровни звезды 3–5 (50/100/150), живая вода 20, звезда другу 50/100/150 |

**Правило авторитетности:**
- Искры и прогрессия — клиент-авторитетны (синк через RLS в свою строку).
- Покупки за ⭐ и всё, что меняет чужие данные, — **только через сервер**.

### 5.2 Прогрессия ёлки (11 уровней)
| Ур. | Название | Высота, см | Очков до след. |
|---|---|---|---|
| 1 | Росток | 45 | 6 |
| 2 | Саженец | 58 | 10 |
| 3 | Молодое дерево | 74 | 16 |
| 4 | Дерево | 95 | 22 |
| 5 | Развилка | 120 | 30 |
| 6 | Пышная | 148 | 38 |
| 7 | Высокая | 176 | 46 |
| 8 | Лесная красавица | 202 | 54 |
| 9 | Исполин | 226 | 62 |
| 10 | Гордость леса | 242 | 70 |
| 11 | Ёлка-2027 | 250 | МАКС |

### 5.3 Источники очков тепла и огней
| Действие | Тепло | Огни | Искры | Лимит |
|---|---|---|---|---|
| Полив | +1 | +1 | +10 | кулдаун 60 с, 12/день |
| Визит друга | +3 | +3 | +10 гостю | без дневного потолка у хозяина; уникальность по TG id |
| Живая вода | +4 | +2 | +20 | 5/день, 20 ⭐ |
| Дед Мороз | — | +3 | +10 | 1/день |

**Потолок огней:** 170.

### 5.4 Подарки под ёлку (8 видов)
| Подарок | Цена ⭐ | Масштаб |
|---|---|---|
| Носок угля | 10 | 1.0 |
| Мандарин («хит») | 15 | 1.2 |
| Конфеты | 15 | 1.4 |
| Туфелька | 25 | 1.6 |
| Шампанское | 35 | 2.0 |
| Мишка | 50 | 3.0 |
| Символ года | 75 | 3.6 |
| Машинка | 100 | 4.0 |

- Ставит гость на чужую ёлку, стоит весь сезон.
- Имя дарителя видит только хозяин. Бесплатная подпись до 40 символов.
- **Подарок дня:** −25% на один подарок, определяется детерминированно по локальной
  дате `hash(YYYY-MM-DD) % 8`. Не стакается со скидкой Деда — применяется лучшая.
  Итоговую цену считает сервер в `create-invoice`.

### 5.5 Звезда на макушке (5 уровней)
- Уровни 1–2 — за искры (100/250), уровни 3–5 — за ⭐ (50/100/150).
- 7 цветов-скинов: рубин (0), золото (250🔥), шампань (250🔥), лёд (350🔥),
  изумруд (350🔥), аметист (400🔥), **«Морозный иней» — эксклюзив за 5 пойманных
  Дедов Морозов** (не покупается).

### 5.6 Звезда в подарок другу
- Дарится следующий уровень звезды друга, начиная с 3-го. Если у друга уровень < 3 —
  подарок поднимает сразу до 3-го. Если уже 5 — дарить нельзя.
- **Атрибуция (вариант А):** подпись «подарок от X» относится только к текущему уровню.
  Если друг потом сам повысит уровень — `star_source` перезаписывается на «свой».

### 5.7 Дед Мороз
- Спавн 1 раз в сутки. Награда: +10 🔥, +3 огня, −30% на ⭐ на 1 час.
- Счётчик `santa_total`; при 5 — разблокируется цвет «Морозный иней».

### 5.8 Визиты
- Нет дневного потолка у хозяина (искусственный лимит убран — он резал виральность).
- Защита от накрутки: `UNIQUE (owner_id, visitor_id, visit_date)`. Повторный заход к тому
  же другу в тот же день — огонёк не зажигается, гостю +2 🔥 «за тёплый визит».
- Визиты анонимны (хозяин видит только счётчик огоньков за день).

---

## 6. КОНТРАКТЫ EDGE FUNCTIONS

### 6.1 `tg-auth` (POST) — ✅ РАБОТАЕТ
**Вход:** `{ initData: string }`
**Логика:** валидация HMAC-подписи initData токеном бота → извлечение
`{id, first_name, username}` → апсерт в `users` → создание сессии/выдача JWT.
**Выход:**
```json
{
  "access_token": "eyJhbGciOi...",
  "refresh_token": "...",
  "user": { "tg_id": "123456", "first_name": "Ваня", "username": "..." },
  "isNew": true
}
```
**Статус:** проверена тестом 🧪 — возвращает 200 и валидный `access_token`.
Обработаны ошибки: `No hash in initData`, `Invalid hash`, `InitData expired`,
`No user in initData`, ошибки БД и создания сессии.

### 6.2 `do-water` (POST)
**Вход:** `{}` (пользователь из токена)
**Логика:** проверить кулдаун 60 с и `water_count < 12`; начислить +1 тепло, +1 огонь,
+10 🔥; обновить счётчики.
**Выход:** `{ user: { sparks, warmth, lights_count, water_count, ... } }`
**Ошибки:** `cooldown` (кулдаун), `limit` (лимит исчерпан).

### 6.3 `do-visit` (POST)
**Вход:** `{ owner_id: string }`
**Логика:** `INSERT ... ON CONFLICT (owner_id, visitor_id, visit_date) DO NOTHING`.
Если вставилось (новый огонёк): хозяину +3 тепла/+3 огня, гостю +10 🔥.
Если конфликт: гостю +2 🔥, огонёк не зажигается.
**Выход:** `{ lit: bool, owner: {...}, visitor: {...} }`

### 6.4 `create-invoice` (POST)
**Вход:**
```json
{
  "item_type": "gift|star_level|star_gift|live_water",
  "kind": "orange",
  "owner_id": "123456",
  "level": 3,
  "message": "С Новым годом!"
}
```
**Логика:** вычислить итоговую цену (база → подарок дня −25% → скидка Деда −30%,
лучшая из активных) → `createInvoiceLink` (Telegram Stars) → запись в `payments`
со статусом `pending`. `message` обрезается до 40 символов и сохраняется в
`payments.item_ref.message`.
**Выход:** `{ invoice_link, token, amount }`

### 6.5 `tg-webhook` (POST, от Telegram)
**Вход:** `successful_payment` (payment_token, total_amount, from)
**Логика:** найти `payments` по токену; идемпотентно (если уже `paid` — не применять
повторно); подтвердить сумму; применить покупку:
- `gift` → `INSERT gifts` (перенести `message` из `item_ref` в `gifts.message`)
- `star_level` → поднять `star_level` себе, `star_source=null`
- `star_gift` → поднять `star_level` другу до `max(3, cur+1)`, `star_source=donor`
- `live_water` → +4 тепла/+2 огня/+20 🔥 (с проверкой лимита 5/день)
**Выход:** `200 OK`

### 6.6 `get_trees_preview` (Postgres RPC)
**Вход:** `ids text[]`
**Выход (таблица):** `(tg_id, first_name, tree_level, lights_count, star_level, palette, gift_count)`
Один запрос на всю карусель. Публичные поля только эти; искры/скидки — приватные.

---

## 7. ТЕКУЩЕЕ СОСТОЯНИЕ И БЛИЖАЙШИЕ ЗАДАЧИ

### 7.1 Что уже работает ✅
- Клиентская игра (рендер, полив локальный, UI, Дед Мороз, салют, подарки).
- Разделение на файлы (`index.html`, `styles.css`, `app.js`, `debug.js`).
- **`tg-auth` на бэкенде** — валидирует реальный `initData`, возвращает 200 и
  `access_token` (проверено тестом 🧪 с реальными данными).
- Диагностика в `debug.js`: показывает `initData` (длину, начало, конец, наличие `hash`),
  статус загрузки, тест 🧪 с реальными данными, копирование 📋, перехват логов консоли.
- На бэкенде есть **все** Edge Functions и поле `users.invite_code`.

### 7.2 Что НЕ работает / ближайшие задачи 🚨

> **Статус деплоя и проверки v15.1:** Edge Functions `tg-auth` и `do-water` обновлены и готовы к деплою в Supabase. При входе через Telegram Mini App в диагностике 🔍 фиксируется `initialized: true`. Однократное событие `app_open` регистрируется на сервере в `tg-auth`, а клик по кнопке «Полить» выполняет Edge Function `do-water` и записывает событие `water` в таблицу `events`.

> **Контекст:** ранее обнаруживались и исправлялись проблемы: файл был назван
> `style.css` вместо `styles.css` (переименован), пути импортов сделаны относительными,
> добавлена строка подключения `supabase-js`. После этого диагностика показала, что
> `tg-auth` отвечает 200, но тест 🧪 писал «SUPABASE не настроен», а `ElkaBackend`
> не инициализировался, потому что глобальные константы `SUPABASE_URL` /
> `SUPABASE_ANON_KEY` не были объявлены на странице.

**Задача 1 — объявить конфиг и загрузить адаптер.**
В `index.html` в `<head>` должны быть константы:
```html
<script>
const SUPABASE_URL = 'https://mrhomyamfrqbxeazrtzm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_OvCWw_CiJz9n0pj83aIyTA_bAh5Hj73';
const USE_BACKEND = true;
</script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```
и подключён `backend.js` (создаёт `window.ElkaBackend`).

**Задача 2 — подключить `do-water` к кнопке полива.**
Сейчас `btnWater` выполняет локальную логику и не вызывает `window.ElkaBackend.water()`.
Нужен вызов с фолбэком на локальную логику при ошибке/офлайне.

**Задача 3 — подключить покупки за Stars.**
Кнопки звёзд (ур. 3–5), подарков другу, звезды другу, живой воды должны вызывать
`buyStarLevel()`, `buyGift()`, `buyStarGift()`, `buyLiveWater()` вместо локального демо.

**Задача 4 — карусель друзей с реальными данными.**
Использовать `getFriendsCarousel(localVisitedIds)` (объединяет локально посещённых и
доноров подарков через `get_trees_preview`), а не только демо-список.

**Задача 5 — инвайт-ссылка через `invite_code`.**
`getMyShareLink()` должен возвращать `currentUserRow.invite_code` (короткий код),
а `parseOwnerIdFromStartParam()` — резолвить короткий код в `tg_id` через запрос к БД
(см. раздел 3.5).

**Задача 6 — хуки `ElkaClientHooks` в `app.js`.**
Убедиться, что `app.js` заполняет `getSnapshot` / `applySnapshot` / `patchSnapshot`
через `Object.assign(window.ElkaClientHooks, {...})` (см. раздел 3.3), иначе снапшот с
сервера не применится.

**Задача 7 — проверка под ключ (✅ решено в v15.1).**
Ключ `sb_publishable_...` передаётся только в заголовок `apikey` (без `Authorization: Bearer sb_publishable_...`).
После получения `access_token` от `tg-auth` клиент пересоздаётся через `createSupabaseClient(accessToken)` с явным
`global.headers.Authorization = 'Bearer ' + accessToken`, чтобы все PostgREST-запросы и Edge Functions гарантированно шли с JWT.
Событие `app_open` логируется только сервером в `tg-auth` (без дубля на клиенте), а `APP_VERSION` выводится в правом верхнем углу панелей `debug.js`.

---

## 8. ПРОИЗВОДИТЕЛЬНОСТЬ И ЛИМИТЫ

### 8.1 Лимиты Supabase Free Tier
- 500 МБ БД (главный ограничитель)
- 50k MAU Auth
- Квоты Edge Functions
- Пауза неактивных проектов (не грозит при живом трафике)

### 8.2 Целевая нагрузка
~8–10 запросов/день на игрока → комфортно до 10–15k DAU без оптимизаций.

### 8.3 Обязательные оптимизации
1. Пакетные события: один `INSERT` массивом при `flush`.
2. Один RPC для карусели друзей (`get_trees_preview`).
3. Отложенный flush сохранения: 30 с + форс на `beforeunload`/`visibilitychange(hidden)`.
4. Индексы на горячих путях.
5. Очистка `events` после 10 января.

---

## 9. МЕТРИКИ УСПЕХА

| Тип | Метрика | Цель |
|---|---|---|
| Продуктовые | DAU/MAU | > 40% |
| | Средний рост ёлки за сезон | 200+ см |
| | Конверсия в платящего | 3–5% |
| | ARPPU | 50–100 ⭐ |
| Технические | FPS на бюджетных Android | 55+ |
| | Запросов/день на игрока | ≤ 10 |
| | Размер БД | < 500 МБ |
| Вирусные | Визитов на игрока | 5+ |
| | Длина цепочки распространения | 3+ |

---

## 10. ТЕСТОВЫЕ СЦЕНАРИИ

1. **Авторизация:** `initData` → создан профиль; повторный вход не дублирует строку.
2. **Полив:** 13-й полив за день отклонён; после полуночи счётчик сбросился.
3. **Визит:** первый визит зажёг огонёк; повторный сегодня — только +2 🔥.
4. **Подарок:** `create-invoice` вернул цену с учётом «подарка дня» и скидки Деда;
   после вебхука подарок появился у хозяина (идемпотентно).
5. **Звезда другу:** друг с ур. 1 получает подарок → ур. 3, `star_source=donor`;
   сам повышает до 4 → `star_source=null`; другу с ур. 5 подарить нельзя.
6. **Живая вода:** 6-я за день отклонена.
7. **Карусель:** `get_trees_preview` одним запросом вернул только публичные поля.
8. **Нагрузка:** 10k игроков × ~10 запросов/день — БД < 500 МБ, троттлинга нет.

---

## 11. ЯВНО НЕ ДЕЛАТЬ В v1

- Не переносить игровую логику/рендер на сервер.
- Не строить дашборды (достаточно ручных SQL-вьюх, проект живёт ~6 недель).
- Не делать Realtime (синхронизация по запросу/флашу достаточна).
- Не реализовывать мультиязычность.

---

## 12. ПЛАН ПОДКЛЮЧЕНИЯ

| Этап | Содержание | Статус |
|---|---|---|
| 1 | Фундамент: таблицы, индексы, RLS, `tg-auth` | ✅ Сделано |
| 2 | Синк профиля: адаптер, загрузка/сохранение строки пользователя | ✅ Завершено (v15.1) |
| 3 | Реальные визиты и друзья: `do-visit`, карусель | ✅ Подключено на клиенте |
| 4 | Платежи: `create-invoice` + `tg-webhook` + `openInvoice` | ✅ Подключено на клиенте |
| 5 | Удержание: пуши о подарках/визитах, ежедневный дайджест | ❌ Не начато |
| 6 | Аналитика: пакетная запись `events`, SQL-вьюхи | ❌ Не начато |

---

## 13. ИТОГ

**Клиент готов** (игра, разделение на файлы, диагностика). **Бэкенд поднят**
(все Edge Functions, поле `invite_code`, `tg-auth` проверен и работает).

**Главное сейчас — склеить их**, сохранив контракт:
- Искры клиент-авторитетны.
- Звёзды и всё, что меняет чужие данные, — только через сервер.
- Визиты уникальны по `(owner, visitor, date)` без дневного потолка.
- Цены считает сервер.
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `USE_BACKEND` объявлены в `index.html`,
  `backend.js` подключён до `app.js`, хуки `ElkaClientHooks` заполнены в `app.js`.

**Приоритетные шаги:** Задеплоить Edge Functions (`supabase functions deploy tg-auth`, `supabase functions deploy do-water`), открыть Mini App в Telegram, убедиться через диагностическую панель 🔍 (`v15.1`), что `initialized: true`, совершить полив и проверить в Supabase Dashboard запись 1x `app_open` и 1x `water` в `events`.
