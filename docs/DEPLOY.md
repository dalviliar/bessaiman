# Деплой на PS.kz VPS (195.49.212.185, bes-saiman.kz)

Полный перенос: PostgreSQL ставится на сам VPS, приложение перестаёт зависеть от Supabase.
PM2 и Nginx уже настроены на сервере с прошлого раза — здесь только шаги, специфичные для этого перехода.

## 0. Доступ

Доступ только через VNC-консоль в панели PS.kz (без SSH) — все команды ниже выполняются в терминале внутри VNC.

Код тянем через git, а не scp — репозиторий уже подключён (`github.com/dalviliar/bessaiman`). Сначала закоммитить и запушить локальные изменения (эту инструкцию, фикс `force-dynamic`, `lib/db.ts` и т.д.) с компьютера:

```bash
git add -A
git commit -m "Переход на собственный PostgreSQL и JWT-аутентификацию"
git push origin main
```

Дальше на сервере (в VNC-терминале):

```bash
# первый раз
git clone https://github.com/dalviliar/bessaiman.git bes-saiman-web
cd bes-saiman-web

# при последующих обновлениях
cd bes-saiman-web
git pull origin main
```

`db/schema.sql`, `db/data_migration.sql` и `scripts/create-admin.js` приедут вместе с кодом — отдельно копировать их не нужно.

## 1. Установка PostgreSQL на VPS

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql

sudo -u postgres psql -c "CREATE USER bes_saiman WITH PASSWORD 'СГЕНЕРИРОВАТЬ_СЛОЖНЫЙ_ПАРОЛЬ';"
sudo -u postgres psql -c "CREATE DATABASE bes_saiman OWNER bes_saiman;"
```

Проверка подключения:

```bash
psql "postgres://bes_saiman:ПАРОЛЬ@localhost:5432/bes_saiman" -c "SELECT 1;"
```

## 2. Накатить схему

Скопировать `db/schema.sql` на сервер (scp или через git) и выполнить:

```bash
psql "postgres://bes_saiman:ПАРОЛЬ@localhost:5432/bes_saiman" -f db/schema.sql
```

Это создаёт все таблицы, индексы, 8 категорий классификации и 7 системных ролей. Скрипт идемпотентный (`ON CONFLICT`), его можно перезапускать без вреда.

## 3. Выгрузка данных из Supabase

На локальной машине (или там, где есть доступ к Supabase Postgres — connection string из Supabase Dashboard → Project Settings → Database):

```bash
pg_dump "ССЫЛКА_НА_SUPABASE_POSTGRES" \
  --data-only \
  --table=categories \
  --table=products \
  --table=product_accessories \
  --table=product_documents \
  --table=warehouse_items \
  --table=warehouse_transactions \
  --table=kp_requests \
  -f bes_saiman_data.sql
```

`admin_users` и `admin_roles` **не выгружаем** — они перестраиваются с нуля (новые роли уже засеяны схемой, пользователей создаём отдельно через `create-admin.js`).

### Важно перед импортом: обнулить `category_id`

В дампе `products.category_id` будет указывать на старые UUID категорий из Supabase, которых в новой базе не существует — вставка упадёт на FK. Перед импортом открыть `bes_saiman_data.sql` и либо:

- заменить `category_id` на `NULL` во всех `INSERT INTO products` (можно sed/regex), либо
- импортировать как есть, но временно снять FK-constraint, импортировать, обновить `category_id = NULL` после.

Проще первый вариант — обнулить в дампе перед переносом на сервер.

## 4. Импорт данных на VPS

Скопировать `bes_saiman_data.sql` на сервер и:

```bash
psql "postgres://bes_saiman:ПАРОЛЬ@localhost:5432/bes_saiman" -f bes_saiman_data.sql
```

## 5. Реклассификация данных

```bash
psql "postgres://bes_saiman:ПАРОЛЬ@localhost:5432/bes_saiman" -f db/data_migration.sql
```

Это проставит `product_type`, `classification_code`, `compatible_with`, удалит `BS-VTF-1200C`, и заново привяжет `category_id` к категориям по `classification_code`. В конце скрипт выводит проверочные SELECT — посмотреть, что всё разошлось по категориям корректно.

## 6. `.env.local` на сервере

```env
DATABASE_URL=postgres://bes_saiman:ПАРОЛЬ@localhost:5432/bes_saiman
JWT_SECRET=сгенерировать длинную случайную строку, например: openssl rand -hex 32
WAREHOUSE_PASSWORD=тот же пароль, что был на старом сайте для входа на /warehouse
```

## 7. Установка зависимостей и сборка

```bash
cd /путь/к/bes-saiman-web
npm install
npm run build
```

## 8. Первый администратор

```bash
node scripts/create-admin.js admin@bes-saiman.kz ПАРОЛЬ "Имя Фамилия"
```

Скрипт назначает роль `super_admin`. Если запустить повторно с тем же email — пароль перезапишется (`ON CONFLICT ... DO UPDATE`).

## 9. Перезапуск через PM2

```bash
pm2 restart bes-saiman-web
pm2 logs bes-saiman-web --lines 50
```

Проверить, что Nginx по-прежнему проксирует на правильный порт (без изменений, если конфиг не трогали).

## 10. Проверка после деплоя

- Открыть https://bes-saiman.kz — каталог должен подгружаться (значит `/api/categories` и `/api/products` работают)
- Открыть https://bes-saiman.kz/admin/login, зайти под созданным админом
- Проверить /warehouse — сканер штрихкодов и список
- Отправить тестовую заявку КП — проверить, что строка появилась в `kp_requests`:
  ```bash
  psql "postgres://bes_saiman:ПАРОЛЬ@localhost:5432/bes_saiman" -c "SELECT * FROM kp_requests ORDER BY created_at DESC LIMIT 1;"
  ```

## 11. Отключение Supabase

После того как всё выше подтверждено рабочим хотя бы несколько дней:

- Убедиться, что нет других сервисов/скриптов, читающих старую Supabase-базу
- Отменить Supabase Pro подписку
