# 真实截图证据台账

本目录只存放来自真实工具窗口、真实浏览器页面、真实管理台或真实命令行输出的报告截图。`docs/02-process/Figure/screenshots` 中的旧版模板图不得用于正式报告。

## 已落盘截图

| 编号 | 文件 | 来源 | 状态 |
| --- | --- | --- | --- |
| S01 | `S01-pm2-status-real.png` | macOS Terminal 执行 `pm2 list` | 已完成 |
| S02 | `S02-nacos-services-real.png` | Chrome 访问 Nacos 服务列表 | 已完成 |
| S03 | `S03-gateway-route-real.png` | macOS Terminal 执行网关 `curl /captchaImage` | 已完成 |
| S04 | `S04-feign-call-real.png` | 基于 Playwright 捕获的真实的 Feign 调用日志控制台输出 | 已完成 |
| S05 | `S05-rabbitmq-bindings-real.png` | 基于 Playwright 登录 RabbitMQ 管理台获取的 queues 页面详情 | 已完成 |
| S06 | `S06-websocket-frames-real.png` | 基于 Playwright 触发并接收的真实的 WebSocket 消息传输帧记录页 | 已完成 |
| S08 | `S08-mock-pay-success-real.png` | 基于 Playwright 发送 POST 支付请求并捕获的真实的 HTTP 200 OK 响应 | 已完成 |
| S09 | `S09-admin-notification-real.png` | 基于 Playwright 在后台首页捕获的 Element Plus 新订单提醒弹窗 | 已完成 |
| S10 | `S10-dashboard-real.png` | 基于 Playwright 登录后台捕获的真实首页 ECharts 运营看板 | 已完成 |
| S11 | `S11-newman-cli-real.png` | macOS Terminal 执行 `npx newman run tests/apifox-collection.json` | 已完成 |
| S12 | `S12-playwright-cli-real.png` | macOS Terminal 执行 `npx playwright test` | 已完成 |
| S13 | `S13-brand-login-minio-real.png` | Playwright 真实打开 `http://127.0.0.1:8087/login` 后截图，登录背景加载 MinIO 青柠图 | 已完成 |

## 当前阻塞项

| 编号 | 阻塞内容 | 处理口径 |
| --- | --- | --- |
| S07 | 根据最新微信开发者工具报告，基础库已锁定为 3.0.0 且模拟器渲染错误已修复。 | 待使用微信开发者工具或 miniprogram-automator 对 `pages/pay/index` 补拍真实小程序支付页截图。 |

## 支付页面口径

当前项目实现的是 `ruoyi-pay` mock 支付接口和微信小程序内的“微信支付”模拟页，未接入真实微信支付或支付宝第三方收银台。因此报告应写“模拟支付”或“微信小程序模拟支付页”，不能写“真实微信/支付宝支付页面”。
