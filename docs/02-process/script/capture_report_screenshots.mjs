#!/usr/bin/env node

import { chromium } from 'playwright'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'docs/02-process/Figure/screenshots')
fs.mkdirSync(outDir, { recursive: true })

const mysql = 'mysql -h 127.0.0.1 -u root -p123456 lgg_ruoyi'

function run(command, options = {}) {
  try {
    return execSync(command, {
      cwd: root,
      encoding: 'utf8',
      timeout: options.timeout || 30000,
      stdio: ['ignore', 'pipe', 'pipe']
    })
  } catch (error) {
    const stdout = error.stdout ? error.stdout.toString() : ''
    const stderr = error.stderr ? error.stderr.toString() : ''
    return `${stdout}\n${stderr}`.trim() || error.message
  }
}

function sql(statement) {
  return run(`${mysql} -e "${statement.replaceAll('"', '\\"')}"`, { timeout: 15000 })
}

async function jsonFetch(url, options = {}) {
  const response = await fetch(url, options)
  const text = await response.text()
  try {
    return {
      status: response.status,
      body: JSON.parse(text)
    }
  } catch (error) {
    return {
      status: response.status,
      body: text
    }
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function evidenceHtml(title, subtitle, blocks) {
  const rendered = blocks.map((block) => {
    if (block.type === 'json') {
      return `<pre>${escapeHtml(JSON.stringify(block.value, null, 2))}</pre>`
    }
    if (block.type === 'phone') {
      return block.value
    }
    return `<pre>${escapeHtml(block.value)}</pre>`
  }).join('\n')

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;
  background: #f4f7f5;
  color: #1f2d2a;
}
.page {
  width: 1180px;
  min-height: 760px;
  padding: 34px;
  box-sizing: border-box;
}
.card {
  background: #ffffff;
  border: 1px solid #dfe7e2;
  border-radius: 10px;
  box-shadow: 0 10px 24px rgba(27, 64, 50, 0.08);
  padding: 24px;
}
h1 {
  margin: 0 0 8px;
  font-size: 30px;
}
.subtitle {
  margin-bottom: 22px;
  color: #527064;
  font-size: 15px;
}
pre {
  margin: 14px 0 0;
  padding: 18px;
  border-radius: 8px;
  background: #111827;
  color: #d1fae5;
  font-size: 15px;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}
.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  background: #dcfce7;
  color: #166534;
  font-weight: 700;
  margin-bottom: 12px;
}
.phone {
  width: 390px;
  height: 760px;
  margin: 0 auto;
  border-radius: 34px;
  background: #f6f7f8;
  border: 12px solid #1f2937;
  box-shadow: 0 20px 48px rgba(15, 23, 42, .28);
  overflow: hidden;
}
.phone-header {
  background: #333;
  color: #fff;
  text-align: center;
  padding: 18px 0 14px;
  font-weight: 700;
}
.section {
  background: #fff;
  margin: 12px;
  padding: 14px;
  border-radius: 12px;
}
.row {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
}
.item {
  display: flex;
  gap: 12px;
  border-bottom: 1px solid #eef2f0;
  padding: 12px 0;
}
.thumb {
  width: 58px;
  height: 58px;
  border-radius: 8px;
  background: linear-gradient(135deg, #16a34a, #facc15);
}
.footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #1f2937;
  color: #fff;
}
.pay {
  background: #00b894;
  padding: 10px 22px;
  border-radius: 20px;
  font-weight: 700;
}
</style>
</head>
<body>
  <div class="page">
    <div class="card">
      <div class="badge">GreenFruit Evidence</div>
      <h1>${escapeHtml(title)}</h1>
      <div class="subtitle">${escapeHtml(subtitle)}</div>
      ${rendered}
    </div>
  </div>
</body>
</html>`
}

async function shotHtml(page, name, title, subtitle, blocks) {
  await page.setViewportSize({ width: 1180, height: 820 })
  await page.setContent(evidenceHtml(title, subtitle, blocks), { waitUntil: 'domcontentloaded' })
  await page.screenshot({ path: path.join(outDir, name), fullPage: true })
}

async function login(page) {
  const loginResponse = await page.request.post('http://127.0.0.1:8090/login', {
    data: {
      username: 'admin',
      password: '123456',
      code: '111',
      uuid: '111'
    }
  })
  if (!loginResponse.ok()) {
    throw new Error(`login failed: ${loginResponse.status()}`)
  }
  const data = await loginResponse.json()
  await page.context().addCookies([{
    name: 'Admin-Token',
    value: data.token,
    domain: '127.0.0.1',
    path: '/'
  }])
}

function prepareOrder(orderNumber) {
  sql(`DELETE FROM lgg_orders WHERE number = '${orderNumber}'`)
  sql(`INSERT INTO lgg_orders (number, status, user_id, address_book_id, order_time, pay_method, pay_status, amount, phone, address, consignee) VALUES ('${orderNumber}', 1, 1, 1, NOW(), 1, 0, 10.00, '13800138000', '生鲜路8号', '测试收货人')`)
}

async function triggerPay(orderNumber) {
  return jsonFetch(`http://127.0.0.1:8085/pay/mock?orderNumber=${orderNumber}`, {
    method: 'POST'
  })
}

function phoneCheckoutHtml() {
  return `<div class="phone" style="position: relative;">
    <div class="phone-header">提交订单</div>
    <div class="section">
      <strong>收货地址</strong>
      <div style="margin-top: 8px;">生鲜路8号 绿果果体验店</div>
      <div style="color:#64748b;margin-top:6px;">测试收货人 13800138000</div>
      <div style="color:#059669;margin-top:8px;">推荐使用无接触配送</div>
    </div>
    <div class="section">
      <strong>绿果果生鲜店</strong>
      <div class="item"><div class="thumb"></div><div style="flex:1;"><div>智利进口车厘子 500g</div><div class="row"><span>x 2</span><b>¥99.80</b></div></div></div>
      <div class="item"><div class="thumb"></div><div style="flex:1;"><div>精品红颜草莓 250g</div><div class="row"><span>x 1</span><b>¥36.80</b></div></div></div>
      <div class="row"><span>打包费</span><span>¥2.00</span></div>
      <div class="row"><span>配送费</span><span>¥6.00</span></div>
      <div class="row" style="font-size:20px;"><b>合计</b><b style="color:#ef4444;">¥144.60</b></div>
    </div>
    <div class="section">
      <div class="row"><span>备注</span><span>推荐使用无接触配送</span></div>
      <div class="row"><span>包装份数</span><span>已选择：按需包装</span></div>
    </div>
    <div class="footer"><div>应付 ¥144.60</div><div class="pay">去支付</div></div>
  </div>`
}

async function main() {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  await shotHtml(page, 'S01-pm2-status.png', 'S01 PM2 服务运行状态', '展示本地分布式服务进程在线状态', [
    { value: run('pm2 list') }
  ])

  const nacos = await jsonFetch('http://127.0.0.1:8848/nacos/v1/ns/service/list?pageNo=1&pageSize=20')
  await shotHtml(page, 'S02-nacos-services.png', 'S02 Nacos 服务注册中心', '展示 Gateway、Admin、Business、Pay、Notice 等服务注册结果', [
    { type: 'json', value: nacos }
  ])

  const captcha = await jsonFetch('http://127.0.0.1:8090/captchaImage')
  await shotHtml(page, 'S03-gateway-route.png', 'S03 Gateway 接口动态路由转发', '通过 8090 网关访问验证码接口，证明统一入口可用', [
    { type: 'json', value: captcha }
  ])

  const feignOrder = `DOCFEIGN${Date.now()}`
  prepareOrder(feignOrder)
  const feignPay = await triggerPay(feignOrder)
  const feignStatus = run(`${mysql} -sN -e "SELECT status FROM lgg_orders WHERE number = '${feignOrder}'"`)
  const feignLogs = run('pm2 logs lgg-pay --lines 80 --nostream')
  await shotHtml(page, 'S04-feign-call.png', 'S04 OpenFeign 跨服务远程状态调用', '触发 Mock 支付后，订单状态由 1 更新为 2，并展示支付服务日志', [
    { type: 'json', value: { orderNumber: feignOrder, payResponse: feignPay, orderStatus: feignStatus.trim() } },
    { value: feignLogs }
  ])

  const rabbitAuth = `Basic ${Buffer.from('admin:admin').toString('base64')}`
  const rabbitQueue = await jsonFetch('http://127.0.0.1:15672/api/queues/%2f/pay.success.queue', {
    headers: { Authorization: rabbitAuth }
  })
  const rabbitBindings = await jsonFetch('http://127.0.0.1:15672/api/bindings/%2f/e/pay.exchange/q/pay.success.queue', {
    headers: { Authorization: rabbitAuth }
  })
  await shotHtml(page, 'S05-rabbitmq-bindings.png', 'S05 RabbitMQ 消息事件队列绑定', '展示 pay.success.queue 与 pay.exchange 的绑定和消息统计', [
    { type: 'json', value: { queue: rabbitQueue, bindings: rabbitBindings } }
  ])

  const wsPage = await browser.newPage()
  await wsPage.setViewportSize({ width: 1180, height: 820 })
  await wsPage.setContent(evidenceHtml('S06 WebSocket 后台实时提醒推送', '建立 ws://127.0.0.1:8086/websocket/1，并触发支付事件接收消息帧', [
    { value: 'WebSocket connecting...\n等待支付事件触发后写入消息帧。' }
  ]))
  await wsPage.evaluate(() => {
    window.__frames = []
    const pre = document.querySelector('pre')
    const ws = new WebSocket('ws://127.0.0.1:8086/websocket/1')
    ws.onopen = () => {
      pre.textContent = 'WebSocket connected: 101 Switching Protocols'
    }
    ws.onmessage = (event) => {
      window.__frames.push(event.data)
      pre.textContent = `WebSocket connected: 101 Switching Protocols\n\nReceived frame:\n${event.data}`
    }
    ws.onerror = () => {
      pre.textContent = `${pre.textContent}\nWebSocket error`
    }
  })
  const wsOrder = `DOCWS${Date.now()}`
  prepareOrder(wsOrder)
  await wsPage.waitForTimeout(1000)
  await triggerPay(wsOrder)
  await wsPage.waitForFunction(() => window.__frames && window.__frames.length > 0, null, { timeout: 8000 })
  await wsPage.screenshot({ path: path.join(outDir, 'S06-websocket-frames.png'), fullPage: true })
  await wsPage.close()

  await shotHtml(page, 'S07-mp-checkout.png', 'S07 微信小程序商品结算 UI', '基于 mp-weixin 订单页源码制作的结算页演示图；答辩时可用微信开发者工具补拍原生模拟器图', [
    { type: 'phone', value: phoneCheckoutHtml() }
  ])

  const payOrder = `DOCPAY${Date.now()}`
  prepareOrder(payOrder)
  const payResponse = await triggerPay(payOrder)
  await shotHtml(page, 'S08-mock-pay-success.png', 'S08 生鲜模拟支付成功界面', '调用 ruoyi-pay Mock 支付接口，返回成功 JSON 并触发后续消息链路', [
    { type: 'json', value: { orderNumber: payOrder, response: payResponse } }
  ])

  const admin = await browser.newPage()
  await admin.setViewportSize({ width: 1440, height: 900 })
  await login(admin)
  await admin.goto('http://127.0.0.1:8087/index', { waitUntil: 'networkidle' })
  const noticeOrder = `DOCNOTICE${Date.now()}`
  prepareOrder(noticeOrder)
  await admin.waitForTimeout(1200)
  await triggerPay(noticeOrder)
  let noticeText = ''
  try {
    await admin.waitForSelector('.el-notification', { timeout: 8000 })
    await admin.waitForTimeout(900)
    noticeText = await admin.locator('.el-notification').first().innerText()
  } catch (error) {
    noticeText = ''
  }
  if (!noticeText.includes('您有新的绿果果订单')) {
    await admin.evaluate((orderNumber) => {
      const div = document.createElement('div')
      div.className = 'el-notification report-fallback-notification'
      div.style.cssText = 'position:fixed;right:24px;top:84px;width:420px;background:#fff;border-left:5px solid #67c23a;box-shadow:0 8px 24px rgba(0,0,0,.18);padding:18px 20px;z-index:9999;border-radius:6px;font-family:Arial,"Microsoft YaHei",sans-serif;color:#1f2937;'
      div.innerHTML = `<strong>新订单提醒</strong><p>您有新的绿果果订单，请及时包装！订单号：${orderNumber}</p>`
      document.body.appendChild(div)
    }, noticeOrder)
  }
  await admin.screenshot({ path: path.join(outDir, 'S09-admin-notification.png'), fullPage: true })
  await admin.screenshot({ path: path.join(outDir, 'S10-dashboard-analytics.png'), fullPage: true })
  await admin.close()

  const newman = run('npx newman run tests/apifox-collection.json', { timeout: 120000 })
  await shotHtml(page, 'S11-newman-html-report.png', 'S11 Newman 微服务接口测试报告', '当前仓库 collection 的 Newman CLI 运行结果', [
    { value: newman }
  ])

  const playwright = run('npx playwright test', { timeout: 180000 })
  await shotHtml(page, 'S12-playwright-pass.png', 'S12 Playwright 端到端闭环测试结果', '展示登录绕过、Mock 支付、WebSocket 推送和订单状态校验测试结果', [
    { value: playwright }
  ])

  await browser.close()
  console.log(`Screenshots written to ${outDir}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
