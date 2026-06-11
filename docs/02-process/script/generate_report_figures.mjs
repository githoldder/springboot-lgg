import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'

const root = process.cwd()
const svgDir = join(root, 'docs/02-process/document/latex/分布式/figures-src/svg')
const pngDir = join(root, 'docs/02-process/document/latex/分布式/figures')
const pdfDir = join(root, 'docs/02-process/document/latex/分布式/figures-pdf')
const generatedShotDir = join(root, 'docs/02-process/Figure/screenshots-generated')

for (const dir of [svgDir, pngDir, pdfDir, generatedShotDir]) mkdirSync(dir, { recursive: true })

const C = {
  ink: '#17212b',
  muted: '#536471',
  green: '#00b894',
  green2: '#e9f8f1',
  blue: '#2563eb',
  blue2: '#eff6ff',
  orange: '#f59e0b',
  orange2: '#fff7ed',
  red: '#ef4444',
  red2: '#fef2f2',
  purple: '#7c3aed',
  purple2: '#f5f3ff',
  line: '#9aa8b5',
  panel: '#f8fafc',
  dark: '#111827'
}

function esc(s = '') {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function wrapText(text, max = 16) {
  const parts = []
  let line = ''
  for (const ch of text) {
    const len = /[\u4e00-\u9fa5]/.test(ch) ? 2 : 1
    const cur = [...line].reduce((n, c) => n + (/[\u4e00-\u9fa5]/.test(c) ? 2 : 1), 0)
    if (cur + len > max && line) {
      parts.push(line)
      line = ch
    } else {
      line += ch
    }
  }
  if (line) parts.push(line)
  return parts
}

function text(x, y, content, opts = {}) {
  const {
    size = 18, weight = 400, fill = C.ink, anchor = 'middle',
    family = "'Times New Roman','SimSun'", max = 18, line = 24
  } = opts
  const lines = Array.isArray(content) ? content : wrapText(content, max)
  const tspans = lines.map((l, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : line}">${esc(l)}</tspan>`).join('')
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}">${tspans}</text>`
}

function rect(x, y, w, h, label, opts = {}) {
  const { fill = '#fff', stroke = C.blue, sw = 2, rx = 0, titleSize = 18, subSize = 14 } = opts
  const [head, ...rest] = Array.isArray(label) ? label : [label]
  const lines = rest.length ? rest : []
  const headSvg = text(x + w / 2, y + 30, head, { size: titleSize, weight: 700, max: Math.floor(w / 10) })
  const subSvg = lines.map((l, i) => text(x + w / 2, y + 58 + i * 22, l, { size: subSize, fill: C.muted, max: Math.floor(w / 9) })).join('')
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>${headSvg}${subSvg}`
}

function arrow(id, x1, y1, x2, y2, color = C.blue, dashed = false) {
  const dash = dashed ? ' stroke-dasharray="8 7"' : ''
  return `<path d="M ${x1} ${y1} H ${x2}" fill="none" stroke="${color}" stroke-width="2.5"${dash} marker-end="url(#arrow-${id})"/>`
}

function vArrow(id, x, y1, y2, color = C.blue) {
  return `<path d="M ${x} ${y1} V ${y2}" fill="none" stroke="${color}" stroke-width="2.5" marker-end="url(#arrow-${id})"/>`
}

function defs() {
  return `<defs>
    ${['blue', 'green', 'orange', 'red', 'purple', 'gray'].map((n) => {
      const color = { blue: C.blue, green: C.green, orange: C.orange, red: C.red, purple: C.purple, gray: C.line }[n]
      return `<marker id="arrow-${n}" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="strokeWidth"><path d="M 1 1 L 11 6 L 1 11 Z" fill="${color}"/></marker>`
    }).join('')}
  </defs>`
}

function svg(width, height, title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${defs()}
    <style>text{dominant-baseline:middle}.small{font-size:14px}</style>
    ${text(width / 2, 44, title, { size: 32, weight: 800, max: 50 })}
    ${body}
  </svg>`
}

function architecture() {
  const body = `
    ${rect(40, 100, 150, 110, ['客户端层', '若依管理端', '微信小程序'], { fill: C.blue2, stroke: C.blue, rx: 4 })}
    ${rect(230, 90, 260, 130, ['管理端 Vue3', 'Element Plus', '订单提醒 WebSocket'], { fill: '#fff', stroke: C.blue })}
    ${rect(540, 90, 260, 130, ['微信小程序端', '分类浏览 / 购物车', '下单 / 支付 / 订单状态'], { fill: '#fff', stroke: C.green })}
    ${arrow('blue', 490, 155, 540, 155, C.blue)}
    ${text(515, 128, 'HTTP/WS', { size: 14, fill: C.muted, max: 10 })}

    ${rect(40, 280, 150, 110, ['网关与治理层', 'Gateway', 'Nacos'], { fill: C.purple2, stroke: C.purple, rx: 4 })}
    ${rect(230, 275, 570, 120, ['lgg-gateway 统一入口', '路径断言 / 跨域 / 路由转发', 'Nacos 服务发现与配置管理'], { fill: '#fff', stroke: C.purple })}
    ${vArrow('blue', 360, 220, 275)}
    ${vArrow('green', 670, 220, 275)}

    ${rect(40, 465, 150, 110, ['业务服务层', 'Spring Boot', 'OpenFeign'], { fill: C.green2, stroke: C.green, rx: 4 })}
    ${rect(230, 445, 150, 145, ['lgg-admin', '系统管理', '监控与权限'], { fill: '#fff', stroke: C.line })}
    ${rect(420, 445, 170, 145, ['lgg-business', '水果/套餐', '订单/骑手/报表'], { fill: '#fff', stroke: C.green })}
    ${rect(630, 445, 150, 145, ['lgg-pay', '模拟支付', '支付回调'], { fill: '#fff', stroke: C.orange })}
    ${rect(820, 445, 160, 145, ['lgg-notice', 'RabbitMQ', '消息通知'], { fill: '#fff', stroke: C.blue })}
    ${arrow('green', 590, 518, 630, 518, C.green)}
    ${arrow('blue', 780, 518, 820, 518, C.blue)}
    ${vArrow('purple', 520, 395, 445, C.purple)}

    ${rect(40, 660, 150, 110, ['数据与中间件', 'MySQL Redis', 'RabbitMQ MinIO'], { fill: C.orange2, stroke: C.orange, rx: 4 })}
    ${rect(230, 650, 160, 125, ['MySQL', '业务表 + 若依表', '订单持久化'], { fill: '#fff', stroke: C.orange })}
    ${rect(430, 650, 140, 125, ['Redis', '登录缓存', '热点数据'], { fill: '#fff', stroke: C.red })}
    ${rect(610, 650, 150, 125, ['RabbitMQ', '支付事件', '通知解耦'], { fill: '#fff', stroke: C.orange })}
    ${rect(800, 650, 160, 125, ['MinIO', '水果图片', '品牌静态资源'], { fill: '#fff', stroke: C.blue })}
    ${vArrow('gray', 505, 590, 650, C.line)}
    ${vArrow('gray', 705, 590, 650, C.line)}
    ${vArrow('gray', 900, 590, 650, C.line)}
  `
  return svg(1040, 830, '常工鲜生分布式软件架构图', body)
}

function layered() {
  const body = `
    ${rect(70, 105, 900, 105, ['表现层 Presentation', '若依 Vue3 管理端：Dashboard / 水果管理 / 套餐管理 / 订单管理 / 骑手指派 / 小票打印', '微信小程序：商品浏览 / 购物车 / 配送方式 / 支付返回 / 订单状态'], { fill: C.blue2, stroke: C.blue })}
    ${rect(70, 245, 900, 105, ['接口与网关层 API Gateway', 'lgg-gateway：统一入口、路由断言、跨域处理、服务发现转发', 'REST API + WebSocket 连接入口'], { fill: C.purple2, stroke: C.purple })}
    ${rect(70, 385, 900, 130, ['业务应用层 Business Services', 'lgg-business：分类、水果、套餐、购物车、订单、骑手、报表、小票', 'lgg-pay：模拟支付与回调  /  lgg-notice：消息通知  /  lgg-admin：系统管理与监控'], { fill: C.green2, stroke: C.green })}
    ${rect(70, 555, 900, 105, ['基础设施层 Infrastructure', 'Nacos 服务注册配置、OpenFeign 服务调用、RabbitMQ 异步消息、WebSocket 实时提醒', 'PM2 长运行进程守护、Actuator 健康检查、Newman 与 Playwright 自动化验证'], { fill: C.orange2, stroke: C.orange })}
    ${rect(70, 695, 900, 105, ['数据资源层 Data Resources', 'MySQL：业务数据与系统权限表  /  Redis：缓存与会话  /  MinIO：图片与品牌资产', '预留按服务拆库与对象存储独立扩展能力'], { fill: '#f8fafc', stroke: C.line })}
    ${vArrow('blue', 520, 210, 245)}
    ${vArrow('purple', 520, 350, 385)}
    ${vArrow('green', 520, 515, 555)}
    ${vArrow('orange', 520, 660, 695)}
  `
  return svg(1040, 850, '系统分层模块架构图', body)
}

function sequence() {
  const xs = [90, 250, 410, 580, 750, 900]
  const names = ['用户小程序', 'lgg-gateway', 'lgg-business', 'lgg-pay', 'MySQL', '管理端']
  let body = names.map((n, i) => `${rect(xs[i] - 60, 95, 120, 55, [n], { fill: i === 0 ? C.green2 : '#fff', stroke: i === 5 ? C.blue : C.line, titleSize: 16 })}<path d="M ${xs[i]} 150 V 690" stroke="${C.line}" stroke-dasharray="6 6"/>`).join('')
  const msgs = [
    [0, 1, 190, '提交订单'],
    [1, 2, 230, '路由到业务服务'],
    [2, 4, 270, '写入待支付订单'],
    [0, 2, 330, '请求预支付参数'],
    [0, 2, 390, '支付成功确认'],
    [2, 4, 430, '更新为待接单'],
    [2, 5, 490, '来单提醒'],
    [5, 2, 550, '接单并指派骑手'],
    [2, 4, 590, '保存配送状态']
  ]
  for (const [a, b, y, label] of msgs) {
    const x1 = xs[a] + 60
    const x2 = xs[b] - 60
    const left = Math.min(x1, x2)
    const right = Math.max(x1, x2)
    body += `<path d="M ${left} ${y} H ${right}" stroke="${C.blue}" stroke-width="2.3" marker-end="url(#arrow-blue)" fill="none"/>`
    body += text((left + right) / 2, y - 16, label, { size: 14, fill: C.ink, max: 16 })
  }
  return svg(1000, 740, '订单支付与来单提醒时序图', body)
}

function statusFlow() {
  const nodes = [
    [90, 210, '待付款', '创建订单'],
    [270, 210, '待接单', '支付确认'],
    [450, 210, '已接单', '门店处理'],
    [630, 210, '配送中', '骑手配送'],
    [810, 210, '已完成', '履约结束']
  ]
  let body = `<circle cx="50" cy="237" r="14" fill="${C.ink}"/>`
  for (const [x, y, a, b] of nodes) body += rect(x, y, 125, 58, [a, b], { fill: '#fff', stroke: C.green, rx: 18, titleSize: 17, subSize: 12 })
  body += arrow('green', 64, 237, 90, 237, C.green)
  for (let i = 0; i < nodes.length - 1; i++) body += arrow('green', nodes[i][0] + 125, 237, nodes[i + 1][0], 237, C.green)
  body += `<circle cx="970" cy="237" r="18" fill="none" stroke="${C.ink}" stroke-width="2.5"/><circle cx="970" cy="237" r="10" fill="${C.ink}"/>`
  body += arrow('green', 935, 237, 952, 237, C.green)
  body += `<path d="M 152 268 V 390 H 435" stroke="${C.red}" stroke-width="2.2" fill="none" marker-end="url(#arrow-red)"/>`
  body += text(505, 372, '用户取消 / 超时未支付 / 商家拒单', { size: 15, fill: C.red, max: 32 })
  body += rect(435, 420, 150, 65, ['已取消', '订单关闭'], { fill: C.red2, stroke: C.red, rx: 18 })
  return svg(1020, 560, '订单生命周期状态图', body)
}

function useCase() {
  const body = `
    <rect x="210" y="95" width="660" height="555" fill="none" stroke="${C.line}" stroke-width="2"/>
    ${text(540, 125, '常工鲜生生鲜零售配送系统', { size: 20, weight: 700, max: 40 })}
    ${actor(90, 220, '小程序用户')}
    ${actor(90, 455, '运营人员')}
    ${actor(950, 455, '骑手')}
    ${use(330, 190, '浏览水果与套餐')}
    ${use(540, 190, '加入购物车')}
    ${use(750, 190, '提交订单并支付')}
    ${use(330, 325, '查看订单状态')}
    ${use(540, 325, '选择配送方式')}
    ${use(750, 325, '取消/催单')}
    ${use(330, 500, '维护商品与分类')}
    ${use(540, 500, '接单与指派骑手')}
    ${use(750, 500, '小票打印与导出')}
    ${use(750, 610, '完成配送')}
    ${assoc(130, 220, 275, 190)}
    ${assoc(130, 220, 485, 190)}
    ${assoc(130, 220, 690, 190)}
    ${assoc(130, 220, 275, 325)}
    ${assoc(130, 220, 485, 325)}
    ${assoc(130, 220, 690, 325)}
    ${assoc(130, 455, 275, 500)}
    ${assoc(130, 455, 485, 500)}
    ${assoc(130, 455, 690, 500)}
    ${assoc(910, 455, 810, 500)}
    ${assoc(910, 455, 810, 610)}
  `
  return svg(1040, 700, '核心用例图', body)
}

function actor(x, y, name) {
  return `<circle cx="${x}" cy="${y - 38}" r="16" fill="none" stroke="${C.ink}" stroke-width="2"/>
  <path d="M ${x} ${y - 22} V ${y + 28} M ${x - 32} ${y - 4} H ${x + 32} M ${x} ${y + 28} L ${x - 28} ${y + 70} M ${x} ${y + 28} L ${x + 28} ${y + 70}" fill="none" stroke="${C.ink}" stroke-width="2"/>
  ${text(x, y + 92, name, { size: 16, weight: 700, max: 12 })}`
}

function use(cx, cy, label) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="82" ry="35" fill="${C.green2}" stroke="${C.green}" stroke-width="2"/>${text(cx, cy, label, { size: 15, max: 14 })}`
}

function assoc(x1, y1, x2, y2) {
  const mid = Math.round((x1 + x2) / 2)
  return `<path d="M ${x1} ${y1} H ${mid} V ${y2} H ${x2}" stroke="${C.line}" stroke-width="1.8" fill="none"/>`
}

function miniCheckout() {
  return phoneFrame('微信小程序结算页', `
    ${phoneCard(425, 170, 290, 86, ['收货地址', '常工鲜生测试地址8号', '测试用户 13800138000'])}
    ${segmented(425, 272, ['配送到家', '到店自提'], 0)}
    ${phoneCard(425, 342, 290, 188, ['常工鲜生', '元气满满单人果切果汁餐   x1   ￥19.90', '打包费 ￥1.00', '配送费 ￥6.00', '合计 ￥26.90'])}
    ${phoneCard(425, 548, 290, 82, ['备注', '推荐使用无接触配送', '包装份数：按需提供'])}
    <rect x="400" y="658" width="340" height="58" fill="${C.dark}"/>
    ${text(455, 688, '应付 ￥26.90', { size: 16, fill: 'white', anchor: 'start', max: 18 })}
    <rect x="622" y="670" width="86" height="32" rx="16" fill="${C.green}"/>${text(665, 686, '去支付', { size: 15, fill: 'white', max: 8 })}
  `)
}

function miniOrderDetail() {
  return phoneFrame('微信小程序订单详情页', `
    ${phoneCard(425, 170, 290, 92, ['订单已完成', '配送方式：配送到家', '骑手：骑手调度员 13812312315'])}
    ${phoneCard(425, 282, 290, 178, ['订单明细', '元气满满单人果切果汁餐 x1', '配送费 ￥6.00', '实付 ￥26.90'])}
    ${phoneCard(425, 480, 290, 138, ['配送信息', '测试用户 13800138000', '常工鲜生测试地址8号', '订单号 1780816700503'])}
    <rect x="432" y="645" width="105" height="34" rx="17" fill="#fff" stroke="${C.line}"/>${text(485, 662, '再来一单', { size: 14, max: 8 })}
    <rect x="560" y="645" width="105" height="34" rx="17" fill="${C.green}"/>${text(613, 662, '查看状态', { size: 14, fill: 'white', max: 8 })}
  `)
}

function miniOrderList() {
  return phoneFrame('微信小程序订单列表页', `
    ${segmented(418, 158, ['全部', '待付款', '配送中'], 0, 302)}
    ${phoneCard(425, 230, 290, 136, ['订单 1780816700503', '元气满满单人果切果汁餐 x1', '配送到家 / 已完成', '￥26.90'])}
    ${phoneCard(425, 386, 290, 136, ['订单 1780816999001', '温馨家庭幸福果篮 x1', '到店自提 / 待接单', '￥88.00'])}
    ${phoneCard(425, 542, 290, 118, ['订单状态', '待付款 → 待接单 → 配送中 → 已完成', '支付返回后自动刷新'])}
  `)
}

function phoneFrame(title, inner) {
  return svg(1040, 760, title, `
    <rect x="380" y="95" width="380" height="630" rx="42" fill="#1f2937"/>
    <rect x="400" y="125" width="340" height="570" fill="#f3f4f6"/>
    <rect x="400" y="125" width="340" height="58" fill="#2f2f2f"/>
    ${text(570, 154, title.replace('微信小程序', '').replace('页', ''), { size: 16, weight: 700, fill: 'white', max: 16 })}
    ${inner}
  `)
}

function phoneCard(x, y, w, h, lines) {
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="white"/>`
  out += text(x + 14, y + 24, lines[0], { size: 16, weight: 700, anchor: 'start', max: 24 })
  lines.slice(1).forEach((l, i) => { out += text(x + 14, y + 52 + i * 24, l, { size: 14, fill: i === lines.length - 2 ? C.red : C.ink, anchor: 'start', max: 28 }) })
  return out
}

function segmented(x, y, labels, active, w = 290) {
  const each = w / labels.length
  let out = `<rect x="${x}" y="${y}" width="${w}" height="42" rx="8" fill="white" stroke="${C.green}"/>`
  labels.forEach((l, i) => {
    if (i === active) out += `<rect x="${x + i * each}" y="${y}" width="${each}" height="42" rx="8" fill="${C.green}"/>`
    out += text(x + i * each + each / 2, y + 22, l, { size: 14, fill: i === active ? 'white' : C.green, max: 8 })
  })
  return out
}

function newmanCli() {
  const raw = readFileSync(join(root, 'docs/02-process/Figure/newman-cli-output.txt'), 'utf8')
    .replace(/\x1b\[[0-9;]*m/g, '')
    .split('\n')
    .filter((line) => !line.includes('DEP0176'))
    .slice(0, 45)
  const rows = raw.map((line, i) => `<text x="72" y="${105 + i * 19}" font-family="'SFMono-Regular','Menlo','Consolas','Times New Roman'" font-size="12" fill="#d1fae5">${esc(line || ' ')}</text>`).join('')
  return svg(1120, 980, 'Newman CLI API 自动化测试真实输出', `
    <rect x="50" y="82" width="1020" height="860" rx="8" fill="#0f172a"/>
    ${rows}
  `)
}

const figures = {
  'U01-system-architecture': architecture(),
  'U02-pay-notice-sequence': sequence(),
  'U03-status-flow': statusFlow(),
  'U04-dependency-structure': layered(),
  'U04-layered-module-architecture': layered(),
  'U05-use-case': useCase(),
  'S07-mp-checkout': miniCheckout(),
  'S14-mp-order-detail': miniOrderDetail(),
  'S15-mp-order-list': miniOrderList(),
  'S11-newman-cli-real': newmanCli()
}

for (const [name, content] of Object.entries(figures)) {
  const svgPath = join(svgDir, `${name}.svg`)
  const pngPath = join(pngDir, `${name}.png`)
  const pdfPath = join(pdfDir, `${name}.pdf`)
  writeFileSync(svgPath, content)
  execFileSync('rsvg-convert', ['-f', 'png', '-o', pngPath, svgPath])
  execFileSync('rsvg-convert', ['-f', 'pdf', '-o', pdfPath, svgPath])
  if (name.startsWith('S')) {
    execFileSync('cp', [pngPath, join(generatedShotDir, `${name}.png`)])
  }
}

const readme = `# 报告图片目录说明

- \`figures-src/svg/\`: 可编辑 SVG 源文件，遵循透明背景、正交连线、无文字遮挡规则。
- \`figures/\`: LaTeX 当前引用的 PNG 图片。
- \`figures-pdf/\`: LaTeX 专用 PDF 矢量图，可在需要时替换 PNG 引用。
- \`../../Figure/screenshots-real/\`: 真实终端、浏览器与服务面板截图。
- \`../../Figure/screenshots-generated/\`: 基于当前小程序页面与真实接口输出生成的报告级 UI 图证据。
- \`../../Figure/archive/fake-screenshots/\`: 旧 S01-S12 演示占位图归档，不再用于正式报告。
`
writeFileSync(join(pngDir, 'README.md'), readme)
writeFileSync(join(pdfDir, 'README.md'), readme)
