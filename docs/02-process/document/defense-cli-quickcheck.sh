#!/usr/bin/env bash
set -u

ROOT="/Users/caolei/Desktop/springboot-lgg"
BASE_GATEWAY="http://127.0.0.1:8090"
BASE_FRONTEND="http://127.0.0.1:8087"
BASE_BUSINESS="http://127.0.0.1:8088"
BASE_PAY="http://127.0.0.1:8085"
BASE_NOTICE="http://127.0.0.1:8086"
RABBIT_USER="guest"
RABBIT_PASS="guest"
MYSQL_DB="lgg_ruoyi"
MYSQL_USER="root"
MYSQL_PASS="123456"
REDIS_PORT="6380"

cd "$ROOT" || exit 1

section() {
  printf '\n\n========== %s ==========\n' "$1"
}

run() {
  printf '\n$ %s\n' "$*"
  "$@"
}

curl_code() {
  label="$1"
  url="$2"
  printf '\n$ curl %s\n' "$url"
  curl --noproxy '*' -sS -o /dev/null -w "$label %{http_code} %{content_type}\n" "$url"
}

section "0. PM2 process status"
run pm2 list

section "1. Local ports"
run lsof -nP -iTCP:8087 -sTCP:LISTEN
run lsof -nP -iTCP:8090 -sTCP:LISTEN
run lsof -nP -iTCP:8088 -sTCP:LISTEN
run lsof -nP -iTCP:8085 -sTCP:LISTEN
run lsof -nP -iTCP:8086 -sTCP:LISTEN
run lsof -nP -iTCP:8848 -sTCP:LISTEN
run lsof -nP -iTCP:5672 -sTCP:LISTEN
run lsof -nP -iTCP:15672 -sTCP:LISTEN
run lsof -nP -iTCP:9020 -sTCP:LISTEN

section "2. HTTP health checks"
curl_code "frontend" "$BASE_FRONTEND/"
curl_code "gateway" "$BASE_GATEWAY/actuator/health"
curl_code "business" "$BASE_BUSINESS/actuator/health"
curl_code "pay" "$BASE_PAY/actuator/health"
curl_code "notice" "$BASE_NOTICE/actuator/health"
curl_code "minio" "http://127.0.0.1:9020/minio/health/live"
curl_code "nacos" "http://127.0.0.1:8848/nacos/"
curl_code "rabbitmq-mgmt" "http://127.0.0.1:15672/"

section "3. Gateway and frontend proxy APIs"
run curl --noproxy '*' -sS "$BASE_GATEWAY/captchaImage"
run curl --noproxy '*' -sS "$BASE_FRONTEND/prod-api/captchaImage"
run curl --noproxy '*' -sS "$BASE_GATEWAY/user/shop/status"
run curl --noproxy '*' -sS "$BASE_BUSINESS/user/shop/status"

section "4. RuoYi admin login API"
run curl --noproxy '*' -sS -X POST "$BASE_GATEWAY/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","code":"","uuid":""}'

section "5. Business APIs"
run curl --noproxy '*' -sS "$BASE_BUSINESS/admin/category/list?page=1&pageSize=5" \
  -H "Authorization: Bearer demo"
run curl --noproxy '*' -sS "$BASE_BUSINESS/admin/order/conditionSearch?page=1&pageSize=5" \
  -H "Authorization: Bearer demo"
run curl --noproxy '*' -sS "$BASE_GATEWAY/user/category/list"
run curl --noproxy '*' -sS "$BASE_GATEWAY/user/dish/list"

section "6. MySQL quick checks"
run mysql -h 127.0.0.1 -u "$MYSQL_USER" "-p$MYSQL_PASS" "$MYSQL_DB" \
  -e "SHOW TABLES LIKE 'lgg_%';"
run mysql -h 127.0.0.1 -u "$MYSQL_USER" "-p$MYSQL_PASS" "$MYSQL_DB" \
  -e "SELECT COUNT(*) AS category_count FROM lgg_category; SELECT id,name,status FROM lgg_category ORDER BY sort,id LIMIT 10;"
run mysql -h 127.0.0.1 -u "$MYSQL_USER" "-p$MYSQL_PASS" "$MYSQL_DB" \
  -e "SELECT COUNT(*) AS fruit_count FROM lgg_fruit; SELECT id,name,category_id,price,status FROM lgg_fruit ORDER BY id LIMIT 10;"
run mysql -h 127.0.0.1 -u "$MYSQL_USER" "-p$MYSQL_PASS" "$MYSQL_DB" \
  -e "SELECT id,number,status,pay_status,amount,order_time FROM lgg_orders ORDER BY id DESC LIMIT 10;"
run mysql -h 127.0.0.1 -u "$MYSQL_USER" "-p$MYSQL_PASS" "$MYSQL_DB" \
  -e "SELECT status,pay_status,COUNT(*) AS cnt FROM lgg_orders GROUP BY status,pay_status ORDER BY status,pay_status;"

section "7. Redis quick checks"
run redis-cli -p "$REDIS_PORT" ping
run redis-cli -p "$REDIS_PORT" dbsize
run redis-cli -p "$REDIS_PORT" info keyspace
run redis-cli -p "$REDIS_PORT" --scan --pattern '*' | head -30

section "8. RabbitMQ management API"
run curl --noproxy '*' -sS -u "$RABBIT_USER:$RABBIT_PASS" \
  "http://127.0.0.1:15672/api/overview"
run curl --noproxy '*' -sS -u "$RABBIT_USER:$RABBIT_PASS" \
  "http://127.0.0.1:15672/api/queues/%2F/pay.success.queue"
run curl --noproxy '*' -sS -u "$RABBIT_USER:$RABBIT_PASS" \
  "http://127.0.0.1:15672/api/bindings/%2F/e/pay.exchange/q/pay.success.queue"

section "9. Trigger one mock pay event for RabbitMQ and WebSocket demo"
DEMO_ORDER="DEMO$(date +%s)"
echo "Demo order number: $DEMO_ORDER"
run curl --noproxy '*' -sS -X POST "$BASE_PAY/pay/mock?orderNumber=$DEMO_ORDER"
sleep 1
run curl --noproxy '*' -sS -u "$RABBIT_USER:$RABBIT_PASS" \
  "http://127.0.0.1:15672/api/queues/%2F/pay.success.queue"

section "10. Newman API collection"
if command -v npx >/dev/null 2>&1; then
  run npx newman run tests/apifox-collection.json --reporters cli
else
  echo "npx not found; skip Newman."
fi

section "11. Useful PM2 logs"
run pm2 logs lgg-pay --lines 40 --nostream
run pm2 logs lgg-notice --lines 40 --nostream
run pm2 logs lgg-business --lines 40 --nostream

section "12. Manual URLs for defense"
cat <<'URLS'
Frontend:  http://127.0.0.1:8087/
Gateway:   http://127.0.0.1:8090/actuator/health
Nacos:     http://127.0.0.1:8848/nacos/
RabbitMQ:  http://127.0.0.1:15672/  guest / guest
MinIO API: http://127.0.0.1:9020/minio/health/live
URLS

printf '\nDone.\n'
