#!/bin/bash
set -e

echo "=== Bes Saiman Deploy ==="
cd /var/www/bes-saiman

echo "[1/4] Git pull..."
git pull origin main

echo "[2/4] Install deps..."
npm install --legacy-peer-deps

echo "[3/4] Build..."
npm run build

echo "[4/4] Restart PM2..."
pm2 restart bes-saiman || pm2 start npm --name bes-saiman -- start

echo "=== Done ==="
pm2 status
