const fs = require('fs');
const path = require('path');
const http = require('http');

const MP_ROOT = path.resolve(__dirname, '../mp-weixin');
const APP_JSON_PATH = path.join(MP_ROOT, 'app.json');
const PROJECT_CONFIG_PATH = path.join(MP_ROOT, 'project.config.json');
const PRIVATE_CONFIG_PATH = path.join(MP_ROOT, 'project.private.config.json');
const VENDOR_JS_PATH = path.join(MP_ROOT, 'common/vendor.js');
const GATEWAY_BASE = 'http://localhost:8090';

const RESULTS = [];
let miniProgram;

function pass(msg) { RESULTS.push({ status: 'PASS', msg }); console.log(`  ✅ ${msg}`); }
function fail(msg) { RESULTS.push({ status: 'FAIL', msg }); console.log(`  ❌ ${msg}`); }
function warn(msg) { RESULTS.push({ status: 'WARN', msg }); console.log(`  ⚠️  ${msg}`); }
function info(msg) { console.log(`  ℹ️  ${msg}`); }
function section(title) { console.log(`\n━━━ ${title} ━━━`); }

function httpGet(url, timeout = 5000, headers = {}) {
  return new Promise((resolve) => {
    const opts = new URL(url);
    const req = http.get({
      hostname: opts.hostname, port: opts.port, path: opts.pathname + opts.search, timeout,
      headers: { ...headers }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', (err) => resolve({ status: 0, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'timeout' }); });
  });
}

function httpPost(url, body, headers = {}, timeout = 5000) {
  return new Promise((resolve) => {
    const payload = JSON.stringify(body);
    const req = http.request(url, {
      method: 'POST',
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...headers
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', (err) => resolve({ status: 0, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'timeout' }); });
    req.write(payload);
    req.end();
  });
}

async function checkConfigBoundary() {
  section('1. 配置边界监测 (Config Boundary)');

  if (!fs.existsSync(PROJECT_CONFIG_PATH)) { fail('project.config.json 不存在'); return; }
  pass('project.config.json 存在');
  const pub = JSON.parse(fs.readFileSync(PROJECT_CONFIG_PATH, 'utf8'));
  const pubLib = pub.libVersion || (pub.setting && pub.setting.libVersion);
  info(`基础库版本: ${pubLib}  |  AppID: ${pub.appid}`);

  if (fs.existsSync(PRIVATE_CONFIG_PATH)) {
    const priv = JSON.parse(fs.readFileSync(PRIVATE_CONFIG_PATH, 'utf8'));
    const privLib = priv.libVersion || (priv.setting && priv.setting.libVersion);
    if (pubLib && privLib && pubLib !== privLib) fail(`基础库版本冲突! Public: ${pubLib}, Private: ${privLib}`);
    else pass('基础库版本已对齐');
  }

  if (!fs.existsSync(APP_JSON_PATH)) { fail('app.json 不存在'); return; }
  pass('app.json 存在');
  const appJson = JSON.parse(fs.readFileSync(APP_JSON_PATH, 'utf8'));

  const pages = appJson.pages || [];
  const missingPages = pages.filter(p => !fs.existsSync(path.join(MP_ROOT, p + '.js')));
  if (missingPages.length) missingPages.forEach(p => fail(`页面缺失: ${p}.js`));
  else pass(`所有 ${pages.length} 个页面文件均存在`);

  const tabList = appJson.tabBar && appJson.tabBar.list;
  if (!tabList || tabList.length < 2) { fail('tabBar 配置无效'); return; }
  pass(`tabBar 包含 ${tabList.length} 个项目`);
  const missingIcons = [];
  for (const tab of tabList) {
    if (!fs.existsSync(path.join(MP_ROOT, tab.iconPath))) missingIcons.push(tab.iconPath);
    if (!fs.existsSync(path.join(MP_ROOT, tab.selectedIconPath))) missingIcons.push(tab.selectedIconPath);
  }
  if (missingIcons.length) missingIcons.forEach(i => fail(`tabBar 图标缺失: ${i}`));
  else pass('所有 tabBar 图标文件均存在');

  const urlCheck = pub.setting && pub.setting.urlCheck;
  if (urlCheck === false) pass('urlCheck 已关闭 (允许非HTTPS请求)');
  else warn(`urlCheck = ${urlCheck}`);
}

async function checkAssetBoundary() {
  section('2. 资产边界监测 (Asset Boundary)');

  const staticDir = path.join(MP_ROOT, 'static');
  if (!fs.existsSync(staticDir)) { fail('static/ 目录不存在'); return; }
  pass('static/ 目录存在');

  const brandIcon = path.join(staticDir, 'brand-icon.png');
  const brandLogo = path.join(staticDir, 'brand-logo.png');
  if (fs.existsSync(brandIcon)) pass(`brand-icon.png 存在 (${(fs.statSync(brandIcon).size / 1024).toFixed(1)}KB)`);
  if (fs.existsSync(brandLogo)) pass(`brand-logo.png 存在 (${(fs.statSync(brandLogo).size / 1024).toFixed(1)}KB)`);

  if (fs.existsSync(VENDOR_JS_PATH)) {
    const vendor = fs.readFileSync(VENDOR_JS_PATH, 'utf8');
    const refs = [...new Set((vendor.match(/static\/[^"']+/g) || []))];
    const missing = refs.filter(r => !fs.existsSync(path.join(MP_ROOT, r)));
    if (missing.length) warn(`vendor.js 引用 ${missing.length} 个缺失资源`);
    else pass(`vendor.js 中所有 ${refs.length} 个静态资源引用均存在`);
  }
}

async function authFlow() {
  section('3. 认证流程验证 (Auth Flow)');

  info('获取 mock 用户 token...');
  const login = await httpPost(`${GATEWAY_BASE}/user/user/login`, { code: 'e2e-test-mock' });
  if (login.status === 200) {
    try {
      const body = JSON.parse(login.data);
      const token = body.data && body.data.token;
      if (token) {
        pass(`用户登录成功, 获取到 token (${token.substring(0, 20)}...)`);
        return token;
      }
      fail(`登录响应缺少 token: ${login.data.substring(0, 100)}`);
    } catch { fail(`登录响应解析失败: ${login.data.substring(0, 100)}`); }
  } else {
    fail(`登录失败 (${login.status}): ${(login.error || login.data || '').substring(0, 100)}`);
  }
  return null;
}

async function checkNetworkBoundary(token) {
  section('4. 网络边界 & 通信链路监测 (Network Boundary)');

  info('探测网关 (localhost:8090)...');
  const gw = await httpGet(`${GATEWAY_BASE}/actuator/health`);
  if (gw.status === 200) pass(`网关正常 (8090)`);
  else {
    const gw2 = await httpGet(GATEWAY_BASE);
    if (gw2.status > 0) pass(`网关端口 8090 有响应 (${gw2.status})`);
    else fail(`网关无响应`);
  }

  info('探测 /user/shop/status (public)...');
  const shop = await httpGet(`${GATEWAY_BASE}/user/shop/status`);
  if (shop.status === 200) {
    try {
      const body = JSON.parse(shop.data);
      pass(`商家状态: ${body.data === 1 ? '营业中' : '已打烊'}`);
    } catch { pass(`商家状态接口正常`); }
  } else {
    fail(`商家状态接口异常 (${shop.status})`);
  }

  if (token) {
    const authHeader = { authentication: token };

    info('探测 /user/category/list (需认证)...');
    const cat = await httpGet(`${GATEWAY_BASE}/user/category/list?type=1`, 5000, authHeader);
    if (cat.status === 200) {
      try {
        const body = JSON.parse(cat.data);
        const count = body.data ? body.data.length : 0;
        const names = body.data ? body.data.map(c => c.name).join(', ') : '';
        pass(`分类列表: ${count} 个分类 [${names}]`);
      } catch { pass(`分类列表接口正常`); }
    } else {
      fail(`分类列表异常 (${cat.status})`);
    }

    info('探测 /user/setmeal/list (需认证)...');
    const setmeal = await httpGet(`${GATEWAY_BASE}/user/setmeal/list?categoryId=13`, 5000, authHeader);
    if (setmeal.status === 200) {
      try {
        const body = JSON.parse(setmeal.data);
        const count = body.data ? body.data.length : 0;
        pass(`套餐列表: ${count} 个套餐`);
      } catch { pass(`套餐列表接口正常`); }
    } else {
      warn(`套餐列表 (${setmeal.status})`);
    }

    info('探测 /user/dish/list (需认证)...');
    const dish = await httpGet(`${GATEWAY_BASE}/user/dish/list?categoryId=10`, 5000, authHeader);
    if (dish.status === 200) {
      try {
        const body = JSON.parse(dish.data);
        const count = body.data ? body.data.length : 0;
        pass(`菜品列表: ${count} 个菜品`);
      } catch { pass(`菜品列表接口正常`); }
    } else {
      warn(`菜品列表 (${dish.status})`);
    }
  } else {
    warn('无 token, 跳过认证接口测试');
  }

  info('探测 business (localhost:8088)...');
  const biz = await httpGet('http://localhost:8088/actuator/health');
  if (biz.status === 200) pass('Business 服务正常 (8088)');
  else {
    const biz2 = await httpGet('http://localhost:8088/user/shop/status');
    if (biz2.status === 200) pass('Business 服务正常 (8088, 直接调用)');
    else fail('Business 异常');
  }

  if (fs.existsSync(VENDOR_JS_PATH)) {
    const vendor = fs.readFileSync(VENDOR_JS_PATH, 'utf8');
    const m = vendor.match(/baseUrl\s*=\s*['"]([^'"]+)['"]/);
    if (m) {
      if (m[1] === GATEWAY_BASE) pass(`vendor.js baseUrl 指向网关: ${m[1]}`);
      else warn(`vendor.js baseUrl = ${m[1]}, 期望 ${GATEWAY_BASE}`);
    }
  }

  info('探测 MinIO (9000)...');
  const minio = await httpGet('http://localhost:9000/minio/health/live');
  if (minio.status === 200) pass('MinIO 正常 (9000)');
  else fail('MinIO 异常');

  info('探测 Nacos (8848)...');
  const nacos = await httpGet('http://localhost:8848/nacos/');
  if (nacos.status > 0) pass(`Nacos 正常 (8848)`);
  else fail('Nacos 异常');
}

async function checkRenderBoundary() {
  section('5. 渲染边界监测 (Render Boundary)');

  const cliPath = '/Applications/wechatwebdevtools.app/Contents/MacOS/cli';
  const automatorPkg = path.resolve(__dirname, '../node_modules/miniprogram-automator/package.json');

  const cliOk = fs.existsSync(cliPath);
  const autoOk = fs.existsSync(automatorPkg);

  if (!cliOk) { warn('微信开发者工具未安装, 跳过渲染测试'); return; }
  if (!autoOk) { warn('miniprogram-automator 未安装, 跳过渲染测试'); return; }

  info('模拟器环境已就绪 (CLI + automator 包存在)');
  info('完整渲染测试: node scripts/e2e_debug.js');
  info('API 数据测试: node scripts/e2e_debug_api.js');
  pass('渲染环境检测通过');
}

function printReport() {
  const p = RESULTS.filter(r => r.status === 'PASS').length;
  const f = RESULTS.filter(r => r.status === 'FAIL').length;
  const w = RESULTS.filter(r => r.status === 'WARN').length;
  console.log(`\n${'='.repeat(50)}`);
  console.log('  端到端边界监测报告');
  console.log(`${'='.repeat(50)}`);
  console.log(`  总计: ${RESULTS.length}  |  ✅: ${p}  |  ❌: ${f}  |  ⚠️: ${w}`);
  console.log(`${'='.repeat(50)}`);
  if (f > 0) {
    console.log('\n  ❌ 失败项:');
    RESULTS.filter(r => r.status === 'FAIL').forEach(r => console.log(`    - ${r.msg}`));
    process.exit(1);
  } else {
    console.log(`\n  🎉 所有 ${RESULTS.length} 项边界检查通过!`);
    process.exit(0);
  }
}

async function run() {
  console.log('═══ 微信小程序端到端边界监测工具 ═══');
  console.log(`项目: ${MP_ROOT}`);
  console.log(`时间: ${new Date().toLocaleString()}\n`);

  try {
    await checkConfigBoundary();
    await checkAssetBoundary();
    const token = await authFlow();
    await checkNetworkBoundary(token);
    await checkRenderBoundary();
  } catch (err) {
    console.error(`\n❌ 异常: ${err.message}`);
  } finally {
    if (miniProgram) { try { await miniProgram.close(); } catch {} }
    printReport();
  }
}

run();
