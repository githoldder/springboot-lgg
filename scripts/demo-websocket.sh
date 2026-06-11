#!/bin/bash
set -e

# ============================================================
# WebSocket 实时推送演示脚本
# 使用系统 Chrome + macOS screencapture
# ============================================================

ORDER_NUMBER="1781093884077"
HTML_PATH="file:///Users/caolei/Desktop/springboot-lgg/websocket-demo.html"
DB_CRED="-uroot -p123456"
GATEWAY="http://localhost:8090"
SCREENSHOT_DIR="/tmp/ws-demo"

mkdir -p "$SCREENSHOT_DIR"

echo "=== WebSocket 实时推送演示 ==="
echo ""

# Step 1: Reset order to pending payment
echo "[1/4] Resetting order #72 to PENDING_PAYMENT..."
mysql $DB_CRED -e "USE lgg_ruoyi; UPDATE lgg_orders SET status=1, pay_status=0 WHERE id=72;"
mysql $DB_CRED -e "USE lgg_ruoyi; SELECT id, number, status, pay_status FROM lgg_orders WHERE id=72;" -t
echo ""

# Step 2: Open demo page in Chrome (headless via screencapture fallback)
echo "[2/4] Opening WebSocket demo page in Chrome..."
open -a "Google Chrome" "$HTML_PATH"
sleep 4

# Take initial screenshot
screencapture -x "$SCREENSHOT_DIR/01-connected.png" 2>/dev/null || \
  echo "  [WARN] screencapture failed, trying alternative..."
echo "  Screenshot: $SCREENSHOT_DIR/01-connected.png"
echo ""

# Step 3: Trigger payment
echo "[3/4] Triggering paySuccess for order $ORDER_NUMBER..."
curl -s "$GATEWAY/notify/mockPaySuccess?orderNumber=$ORDER_NUMBER" --noproxy '*' -o /dev/null -w "  HTTP Status: %{http_code}\n"
sleep 3

# Take notification screenshot
screencapture -x "$SCREENSHOT_DIR/02-notification.png" 2>/dev/null || \
  echo "  [WARN] screencapture failed"
echo "  Screenshot: $SCREENSHOT_DIR/02-notification.png"
echo ""

# Step 4: Verify order status
echo "[4/4] Verifying order status..."
mysql $DB_CRED -e "USE lgg_ruoyi; SELECT id, number, status, pay_status FROM lgg_orders WHERE id=72;" -t
echo ""

echo "=== Demo Complete ==="
echo "Screenshots: $SCREENSHOT_DIR/"
ls -la "$SCREENSHOT_DIR/"
