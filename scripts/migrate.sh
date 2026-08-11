#!/usr/bin/env bash
# Применяет миграцию из db/migrations, сам находит DATABASE_URL.
#
#   bash scripts/migrate.sh images      # достаточно куска имени файла
#   bash scripts/migrate.sh             # покажет список миграций
#
# Строку подключения ищет по порядку: переменная окружения → .env* → окружение
# работающего процесса PM2 (там она есть всегда, раз сайт работает).

set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

name="${1:-}"
if [ -z "$name" ]; then
  echo "Укажите миграцию (можно часть имени). Доступные:"
  ls db/migrations
  exit 1
fi

matches="$(ls db/migrations | grep -i -- "$name")"
count="$(printf '%s\n' "$matches" | grep -c . )"
if [ "$count" -ne 1 ]; then
  if [ "$count" -eq 0 ]; then
    echo "Ничего не найдено по «$name». Доступные:"
    ls db/migrations
  else
    echo "Под «$name» подходит несколько файлов, уточните:"
    printf '%s\n' "$matches"
  fi
  exit 1
fi
file="db/migrations/$matches"

url="${DATABASE_URL:-}"
if [ -z "$url" ]; then
  for f in .env.local .env.production .env; do
    [ -f "$f" ] || continue
    set -a; . "./$f"; set +a
    url="${DATABASE_URL:-}"
    if [ -n "$url" ]; then echo "DATABASE_URL взят из $f"; break; fi
  done
fi
if [ -z "$url" ] && command -v pm2 >/dev/null 2>&1; then
  url="$(pm2 jlist 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{for(const p of JSON.parse(s)){const u=p.pm2_env&&p.pm2_env.DATABASE_URL;if(u){console.log(u);break}}}catch(e){}})')"
  if [ -n "$url" ]; then echo "DATABASE_URL взят из окружения PM2"; fi
fi
if [ -z "$url" ]; then
  echo "DATABASE_URL не найден — ни в окружении, ни в .env*, ни в PM2."
  exit 1
fi

echo "Применяю $file"
psql "$url" -f "$file"
