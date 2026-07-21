#!/bin/bash
# scripts/init_mysql.sh

set -e

echo "=========================================="
echo "Initializing MySQL Database in VM"
echo "=========================================="

orb sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '123456';"
orb sudo mysql -e "FLUSH PRIVILEGES;"
orb mysql -uroot -p123456 -e "CREATE DATABASE IF NOT EXISTS lgg_ruoyi DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "Importing SQL files..."
orb mysql -uroot -p123456 lgg_ruoyi < ruoyi-vue-lgg-backend/sql/ry_20260417.sql
orb mysql -uroot -p123456 lgg_ruoyi < ruoyi-vue-lgg-backend/sql/lgg_business_schema.sql
orb mysql -uroot -p123456 lgg_ruoyi < ruoyi-vue-lgg-backend/sql/lgg_business_menu.sql
orb mysql -uroot -p123456 lgg_ruoyi < ruoyi-vue-lgg-backend/sql/lgg_seed_fruit_staff.sql
orb mysql -uroot -p123456 lgg_ruoyi < ruoyi-vue-lgg-backend/sql/quartz.sql
orb mysql -uroot -p123456 lgg_ruoyi < ruoyi-vue-lgg-backend/sql/lgg_fix_mojibake.sql
orb mysql -uroot -p123456 lgg_ruoyi < ruoyi-vue-lgg-backend/sql/lgg_sprint05_stock_migration.sql
orb mysql -uroot -p123456 lgg_ruoyi < ruoyi-vue-lgg-backend/sql/lgg_sprint06_user_openid_unique.sql
orb mysql -uroot -p123456 lgg_ruoyi < ruoyi-vue-lgg-backend/sql/lgg_demo_security_hardening.sql
orb mysql -uroot -p123456 lgg_ruoyi < ruoyi-vue-lgg-backend/sql/lgg_order_delivery_print.sql

echo "=========================================="
echo "Database Initialization Complete!"
echo "=========================================="
