const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const path = require('path');

const http = require('http');
const fs = require('fs');

const ORDER_NUMBER = '1781093884077';
const DB_CRED = '-uroot -p123456';
const GATEWAY = 'http://localhost:8090';
const HTML_DIR = '/Users/caolei/Desktop/springboot-lgg';
const SCREENSHOT_DIR = '/tmp/ws-demo';

function run(cmd) {
  return execSync(cmd, { shell: true, timeout: 15000, encoding: 'utf-8' }).trim();
}

function serveHtml(port) {
  const server = http.createServer((req, res) => {
    const content = fs.readFileSync(HTML_DIR + '/websocket-demo.html', 'utf-8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(content);
  });
  server.listen(port);
  return server;
}

(async () => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const HTTP_PORT = 18765;
  const server = serveHtml(HTTP_PORT);
  const HTML_URL = `http://localhost:${HTTP_PORT}/`;
  console.log(`HTTP server on port ${HTTP_PORT}`);
  console.log('=== WebSocket Real-Time Push Demo ===\n');

  // 1. Reset order to PENDING_PAYMENT with fresh order_time to avoid auto-cancel
  console.log('[1/5] Resetting order #72 to PENDING_PAYMENT...');
  run(`mysql ${DB_CRED} -e "USE lgg_ruoyi; UPDATE lgg_orders SET status=1, pay_status=0, order_time=NOW() WHERE id=72;"`);
  const before = run(`mysql ${DB_CRED} -e "USE lgg_ruoyi; SELECT id, number, status, pay_status, order_time FROM lgg_orders WHERE id=72;" -t`);
  console.log(before + '\n');

  // 2. Launch system Chrome via puppeteer
  console.log('[2/5] Launching system Chrome...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Listen to console messages from the page
  page.on('console', msg => console.log(`  [PAGE ${msg.type()}] ${msg.text()}`));

  // 3. Open WebSocket demo page
  console.log(`[3/5] Opening ${HTML_URL}`);
  await page.goto(HTML_URL, { waitUntil: 'load', timeout: 15000 });
  await new Promise(r => setTimeout(r, 3000));

  // Screenshot: after connection
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-connected.png'), fullPage: true });
  const text1 = await page.evaluate(() => document.body.innerText);
  console.log(`  Screenshot 1 saved`);
  console.log(`  Page: ${text1.substring(0, 200).replace(/\n/g, ' | ')}...\n`);

  // 4. Trigger payment
  console.log('[4/5] Triggering paySuccess...');
  const httpCode = run(`curl -s '${GATEWAY}/notify/mockPaySuccess?orderNumber=${ORDER_NUMBER}' --noproxy '*' -o /dev/null -w "%{http_code}"`);
  console.log(`  HTTP Status: ${httpCode}`);

  // Wait for WebSocket notification to arrive
  await new Promise(r => setTimeout(r, 3000));

  // Screenshot: after notification
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-notification.png'), fullPage: true });
  const text2 = await page.evaluate(() => document.body.innerText);
  console.log(`  Screenshot 2 saved`);
  console.log(`  Page: ${text2.replace(/\n/g, ' | ')}\n`);

  // 5. Verify DB
  console.log('[5/5] Verifying order status...');
  const after = run(`mysql ${DB_CRED} -e "USE lgg_ruoyi; SELECT id, number, status, pay_status FROM lgg_orders WHERE id=72;" -t`);
  console.log(after + '\n');

  await browser.close();
  server.close();
  console.log('=== Demo Complete ===');
  console.log(`Screenshots: ${SCREENSHOT_DIR}/`);
  console.log(`Open with: open ${SCREENSHOT_DIR}/`);
})();
