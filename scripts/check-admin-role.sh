#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
source <(grep DATABASE_URL .env.local)

psql "$DATABASE_URL" -c "
SELECT u.email, u.role_id, r.name, r.permissions
FROM admin_users u
LEFT JOIN admin_roles r ON r.id = u.role_id
WHERE u.email = 'dalviliar09@gmail.com';
"
