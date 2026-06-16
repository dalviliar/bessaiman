#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."

cat > .env.local << 'ENVEOF'
DATABASE_URL=postgres://bes_saiman:1Dalvi12909891*@localhost:5432/bes_saiman
JWT_SECRET=d2ed42fa03e5c5c2ebbca258ba5f960b6cfbb78b83b6d2837753e95edc9c5865
WAREHOUSE_PASSWORD=1Sklad12909891*
ENVEOF

echo "Готово. Содержимое .env.local:"
cat .env.local
