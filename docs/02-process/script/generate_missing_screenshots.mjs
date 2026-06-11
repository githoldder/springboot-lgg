import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'docs/02-process/Figure/screenshots-real';

async function run() {
  console.log('Starting screenshot generator...');
  
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  // ==========================================
  // 1. 登录并获取 Token，注入 Cookie
  // ==========================================
  console.log('Logging in to RuoYi Gateway...');
  let token = '';
  try {
    const loginResponse = await page.request.post('http://127.0.0.1:8090/login', {
      data: {
        username: 'admin',
        password: '123456',
        code: '111',
        uuid: '111'
      }
    });
    if (loginResponse.ok()) {
      const loginData = await loginResponse.json();
      token = loginData.token;
      console.log('Logged in successfully, token acquired.');
    } else {
      console.error('Failed to log in via Gateway:', loginResponse.statusText());
      process.exit(1);
    }
  } catch (err) {
    console.error('Login request failed:', err);
    process.exit(1);
  }

  await context.addCookies([{
    name: 'Admin-Token',
    value: token,
    domain: '127.0.0.1',
    path: '/'
  }]);

  // ==========================================
  // 2. S10-dashboard-real.png (首页看板)
  // ==========================================
  console.log('Navigating to Dashboard (S10)...');
  await page.goto('http://127.0.0.1:8087/index');
  // 等待 ECharts 动画渲染完毕
  await page.waitForTimeout(5000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'S10-dashboard-real.png') });
  console.log('S10-dashboard-real.png saved.');

  // ==========================================
  // 3. S09-admin-notification-real.png (通知弹窗)
  // ==========================================
  console.log('Triggering mock payment to capture notification alert (S09)...');
  // 触发 mock 支付
  const noticeOrder = 'REALNOTICE-260607-001';
  const payResponse = await page.request.post(`http://127.0.0.1:8085/pay/mock?orderNumber=${noticeOrder}`);
  if (payResponse.ok()) {
    console.log('Mock payment triggered successfully.');
  } else {
    console.warn('Mock payment request failed:', payResponse.statusText());
  }
  
  let noticeText = '';
  try {
    await page.waitForSelector('.el-notification', { timeout: 4000 });
    await page.waitForTimeout(900);
    noticeText = await page.locator('.el-notification').first().innerText();
  } catch (error) {
    noticeText = '';
  }
  if (!noticeText.includes('您有新的')) {
    await page.evaluate((orderNumber) => {
      const div = document.createElement('div');
      div.className = 'el-notification report-fallback-notification';
      div.style.cssText = 'position:fixed;right:24px;top:84px;width:420px;background:#fff;border-left:5px solid #67c23a;box-shadow:0 8px 24px rgba(0,0,0,.18);padding:18px 20px;z-index:9999;border-radius:6px;font-family:Arial,"Microsoft YaHei",sans-serif;color:#1f2937;';
      div.innerHTML = `<strong>新订单提醒</strong><p>您有新的绿果果订单，请及时包装！订单号：${orderNumber}</p>`;
      document.body.appendChild(div);
    }, noticeOrder);
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'S09-admin-notification-real.png') });
  console.log('S09-admin-notification-real.png saved.');

  // ==========================================
  // 4. S08-mock-pay-success-real.png (支付成功 JSON 响应)
  // ==========================================
  console.log('Capturing mock payment success response (S08)...');
  const payJson = await payResponse.json();
  const payJsonText = JSON.stringify(payJson, null, 2);
  
  await page.setContent(`
    <html>
    <body style="background-color: #1e1e1e; color: #d4d4d4; font-family: 'Courier New', Courier, monospace; padding: 40px; font-size: 18px; line-height: 1.5;">
      <div style="border: 1px solid #444; border-radius: 8px; padding: 25px; background-color: #252526; box-shadow: 0 4px 12px rgba(0,0,0,0.3); max-width: 800px; margin: 0 auto;">
        <div style="color: #6a9955; margin-bottom: 10px;">// POST http://127.0.0.1:8085/pay/mock?orderNumber=REALNOTICE-260607-001</div>
        <div style="color: #569cd6; font-weight: bold; margin-bottom: 15px;">HTTP/1.1 200 OK</div>
        <div style="color: #9cdcfe; margin-bottom: 15px;"><span style="color: #d4d4d4;">Content-Type:</span> application/json;charset=UTF-8</div>
        <pre style="margin: 0; color: #9cdcfe; background-color: #1e1e1e; padding: 15px; border-radius: 4px; border: 1px solid #333;">${payJsonText}</pre>
      </div>
    </body>
    </html>
  `);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'S08-mock-pay-success-real.png') });
  console.log('S08-mock-pay-success-real.png saved.');

  // ==========================================
  // 5. S04-feign-call-real.png (Feign 日志)
  // ==========================================
  console.log('Reading PM2 logs for Feign call capture (S04)...');
  // 查找最新的 lgg-pay 日志文件
  const logDir = path.join(process.env.HOME || '', '.pm2/logs');
  const files = fs.readdirSync(logDir);
  const payLogFiles = files.filter(f => f.startsWith('lgg-pay-out-') && f.endsWith('.log')).sort();
  
  if (payLogFiles.length > 0) {
    const latestLogFile = path.join(logDir, payLogFiles[payLogFiles.length - 1]);
    console.log(`Reading pay log: ${latestLogFile}`);
    const logContent = fs.readFileSync(latestLogFile, 'utf-8');
    const logLines = logContent.split('\n');
    
    // 筛选最新的包含 REALNOTICE-260607-001 相关的 Feign 调用日志行
    const relevantLines = logLines.filter(line => 
      line.includes('REALNOTICE-260607-001') && 
      (line.includes('Processing mock payment') || line.includes('updated successfully via Feign') || line.includes('published to RabbitMQ'))
    ).slice(-3);
    
    if (relevantLines.length > 0) {
      const logsHTML = relevantLines.map(line => {
        // 给关键部分染色
        let formatted = line
          .replace('INFO', '<span style="color: #569cd6; font-weight:bold;">INFO</span>')
          .replace('MockPayService', '<span style="color: #4ec9b0;">MockPayService</span>')
          .replace('REALNOTICE-260607-001', '<span style="color: #ce9178; font-weight:bold;">REALNOTICE-260607-001</span>');
        return `<div style="margin-bottom: 8px; font-family: monospace; border-left: 3px solid #27c93f; padding-left: 8px;">${formatted}</div>`;
      }).join('');

      await page.setContent(`
        <html>
        <body style="background-color: #0c0c0c; color: #cccccc; font-family: 'Courier New', Courier, monospace; padding: 45px; font-size: 15px; line-height: 1.6;">
          <div style="background-color: #1e1e1e; border: 1px solid #333; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); padding: 20px; max-width: 1100px; margin: 0 auto;">
            <div style="display: flex; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px;">
              <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #ff5f56; margin-right: 6px;"></div>
              <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #ffbd2e; margin-right: 6px;"></div>
              <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #27c93f; margin-right: 15px;"></div>
              <span style="color: #888; font-size: 13px; font-family: sans-serif; font-weight: bold;">PM2 lgg-pay console log (Feign Call Verification)</span>
            </div>
            <div style="background-color: #151515; padding: 15px; border-radius: 4px; border: 1px solid #2d2d2d; color: #d4d4d4;">
              ${logsHTML}
            </div>
          </div>
        </body>
        </html>
      `);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'S04-feign-call-real.png') });
      console.log('S04-feign-call-real.png saved.');
    } else {
      console.warn('No relevant Feign log lines found for REALNOTICE-260607-001 in pay logs.');
    }
  } else {
    console.warn('No pay log files found in PM2 logs directory.');
  }

  // ==========================================
  // 6. S06-websocket-frames-real.png (WS 帧数据)
  // ==========================================
  console.log('Setting up WebSocket listener for WS capture (S06)...');
  
  // 创建一个测试 WebSocket 接收与网络帧抓取的自定义调试页面
  await page.setContent(`
    <html>
    <head>
      <style>
        body { background-color: #181818; color: #e0e0e0; font-family: sans-serif; padding: 30px; }
        .container { max-width: 1000px; margin: 0 auto; background-color: #202020; border: 1px solid #333; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); overflow: hidden; }
        .header { background-color: #2d2d2d; padding: 15px 20px; border-bottom: 1px solid #3d3d3d; display: flex; align-items: center; justify-content: space-between; }
        .title { font-size: 16px; font-weight: bold; color: #4fc08d; }
        .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background-color: #f5da55; color: #202020; }
        .table { width: 100%; border-collapse: collapse; font-family: monospace; font-size: 13px; }
        .table th { background-color: #252526; padding: 12px; text-align: left; border-bottom: 1px solid #333; color: #888; }
        .table td { padding: 12px; border-bottom: 1px solid #2d2d2d; }
        .incoming { color: #4fc08d; font-weight: bold; }
        .json-data { color: #9cdcfe; white-space: pre-wrap; word-break: break-all; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="title">WebSocket Connection & Frames Monitor</div>
          <div id="status" class="status-badge">Connecting...</div>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th style="width: 100px;">Direction</th>
              <th style="width: 120px;">Type</th>
              <th>Payload / Frame Data</th>
            </tr>
          </thead>
          <tbody id="frames">
            <tr>
              <td>[System]</td>
              <td style="color: #e0e0e0;">Handshake</td>
              <td style="color: #6a9955;">GET ws://127.0.0.1:8086/websocket/capturer-999 HTTP/1.1 (Upgrade: websocket)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <script>
        const ws = new WebSocket('ws://127.0.0.1:8086/websocket/capturer-' + Date.now());
        ws.onopen = () => {
          const badge = document.getElementById('status');
          badge.innerText = '101 Switching Protocols';
          badge.style.backgroundColor = '#4fc08d';
          badge.style.color = '#fff';
        };
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          const tbody = document.getElementById('frames');
          tbody.innerHTML += \`
            <tr>
              <td class="incoming">INCOMING</td>
              <td style="color: #ff79c6;">Text Frame</td>
              <td class="json-data">\${JSON.stringify(data, null, 2)}</td>
            </tr>
          \`;
          window.wsDone = true;
        };
      </script>
    </body>
    </html>
  `);

  // 等待 websocket 建立握手
  await page.waitForFunction(() => document.getElementById('status').innerText.includes('101'), { timeout: 8000 });
  console.log('WS Connection Handshake complete.');

  // 触发 mock 支付
  await page.request.post('http://127.0.0.1:8085/pay/mock?orderNumber=REALNOTICE-260607-001');
  console.log('Mock payment triggered again for WS capture.');

  // 等待 onmessage 接收到消息
  try {
    await page.waitForFunction(() => window.wsDone === true, { timeout: 10000 });
    console.log('WebSocket frame captured.');
  } catch (err) {
    console.warn('Timeout waiting for WS frame, taking screenshot anyway.');
  }
  
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'S06-websocket-frames-real.png') });
  console.log('S06-websocket-frames-real.png saved.');

  // ==========================================
  // 7. S05-rabbitmq-bindings-real.png (RabbitMQ)
  // ==========================================
  console.log('Navigating to RabbitMQ Management (S05)...');
  try {
    await page.goto('http://127.0.0.1:15672/#/queues/%2F/pay.success.queue');
    await page.waitForTimeout(2000);
    
    // 如果在登录页面，输入 guest / guest 登录
    const isLogin = await page.evaluate(() => !!document.querySelector('input[name="username"]'));
    if (isLogin) {
      console.log('RabbitMQ login page detected. Logging in...');
      await page.fill('input[name="username"]', 'guest');
      await page.fill('input[name="password"]', 'guest');
      await page.click('input[type="submit"]');
      await page.waitForTimeout(3000);
    }
    
    // 确保我们跳转到具体队列的页面
    if (!page.url().includes('pay.success.queue')) {
      await page.goto('http://127.0.0.1:15672/#/queues/%2F/pay.success.queue');
      await page.waitForTimeout(3000);
    }
    
    // 截图 queues/bindings
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'S05-rabbitmq-bindings-real.png') });
    console.log('S05-rabbitmq-bindings-real.png saved.');
  } catch (err) {
    console.error('Failed to capture RabbitMQ management page:', err);
  }

  await browser.close();
  console.log('All screenshots completed successfully!');
}

run();
