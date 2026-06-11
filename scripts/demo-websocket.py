#!/usr/bin/env python3
"""
WebSocket 实时推送演示脚本

流程:
1. 打开 WebSocket 演示页面 (websocket-demo.html)
2. 等待 WebSocket 连接建立
3. 将已有订单重置为待支付状态 (status=1, pay_status=0)
4. 调用支付确认接口 /notify/mockPaySuccess?orderNumber=xxx
5. 后端 paySuccess() 发送 WebSocket 通知 → 演示页显示消息
6. 截图保存结果
"""

import subprocess
import time
import json
from playwright.sync_api import sync_playwright

MYSQL_CRED = "-uroot -p123456"
BUSINESS_GATEWAY = "http://localhost:8090"

def reset_order_for_demo(order_number):
    """将已有订单重置为待支付状态"""
    cmds = [
        f'mysql {MYSQL_CRED} -e "USE lgg_ruoyi; UPDATE lgg_orders SET status=1, pay_status=0 WHERE number={order_number} AND status=2;" 2>&1',
        f'mysql {MYSQL_CRED} -e "USE lgg_ruoyi; SELECT id, number, status, pay_status FROM lgg_orders WHERE number={order_number};" 2>&1'
    ]
    for cmd in cmds:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        print(f"[DB] {result.stdout.strip()}")
        if result.stderr.strip():
            print(f"[DB-ERR] {result.stderr.strip()}")

def trigger_payment(order_number):
    """调用支付确认接口"""
    url = f"{BUSINESS_GATEWAY}/notify/mockPaySuccess?orderNumber={order_number}"
    print(f"[API] Calling: {url}")
    result = subprocess.run(
        ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", url],
        capture_output=True, text=True, timeout=10
    )
    print(f"[API] Response code: {result.stdout}")
    return result.stdout

def verify_order_status(order_number):
    """验证订单状态已更新"""
    cmd = f'mysql {MYSQL_CRED} -e "USE lgg_ruoyi; SELECT id, number, status, pay_status FROM lgg_orders WHERE number={order_number};" 2>&1'
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    print(f"[DB-VERIFY] {result.stdout.strip()}")
    return result.stdout

def main():
    order_number = "1781093884077"  # Order #72, was status=2 (TO_BE_CONFIRMED)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800}
        )
        page = context.new_page()

        # 1. Open WebSocket demo page
        html_path = "file:///Users/caolei/Desktop/springboot-lgg/websocket-demo.html"
        print(f"[BROWSER] Opening {html_path}")
        page.goto(html_path, wait_until="networkidle")
        time.sleep(2)

        # Take initial screenshot
        page.screenshot(path="/tmp/ws-demo-01-initial.png", full_page=True)
        print("[SCREENSHOT] ws-demo-01-initial.png saved")

        # 2. Wait for WebSocket connection (check for the "connected" log entry)
        print("[WS] Waiting for WebSocket connection...")
        try:
            page.wait_for_selector("text=已连接", timeout=15000)
            print("[WS] Connected!")
        except Exception as e:
            print(f"[WS] Connection timeout: {e}")

        time.sleep(1)
        page.screenshot(path="/tmp/ws-demo-02-connected.png", full_page=True)
        print("[SCREENSHOT] ws-demo-02-connected.png saved")

        # 3. Reset order to pending payment
        print(f"[DEMO] Resetting order {order_number} to PENDING_PAYMENT...")
        reset_order_for_demo(order_number)
        time.sleep(1)

        # 4. Trigger payment (this sends WebSocket notification)
        print(f"[DEMO] Triggering paySuccess for order {order_number}...")
        trigger_payment(order_number)
        time.sleep(2)

        # 5. Wait for WebSocket message to appear
        print("[WS] Waiting for WebSocket message...")
        try:
            page.wait_for_selector("text=来单提醒", timeout=10000)
            print("[WS] Notification received!")
        except Exception as e:
            print(f"[WS] Notification timeout: {e}")

        # 6. Take final screenshot
        time.sleep(1)
        page.screenshot(path="/tmp/ws-demo-03-notification.png", full_page=True)
        print("[SCREENSHOT] ws-demo-03-notification.png saved")

        # 7. Verify DB state
        print("[DEMO] Verifying order status after payment...")
        verify_order_status(order_number)

        # Wait a moment for user to see
        time.sleep(2)

        browser.close()
        print("[DONE] Demo completed! Screenshots at /tmp/ws-demo-*.png")

if __name__ == "__main__":
    main()
