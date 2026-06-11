# 截图与接口核验指南

本指南用于指导人工核验并替换 LaTeX 报告中的截图占位符。请按照以下步骤启动系统、执行操作，并使用系统自带的截图工具或第三方截图软件完成高质量截图。

## 第一部分：服务端与微服务运行状态 (对应第 3 章)

### 1. PM2 服务运行状态 (`S01-pm2-status-real`)
- **所在章节**：3.4 服务模块设计
- **前置操作**：
  在终端中进入项目根目录或后台目录，执行 PM2 启动脚本后，输入：
  ```bash
  pm2 list
  ```
- **截图目标**：
  截取终端中 PM2 的彩色输出表格。
- **核验标准**：
  - 必须包含 `lgg-admin`, `lgg-business`, `lgg-pay`, `lgg-notice` 等进程。
  - status 必须全部显示为绿色的 `online`。

### 2. Nacos 服务注册中心 (`S02-nacos-services-real`)
- **所在章节**：3.4 服务模块设计
- **前置操作**：
  打开浏览器访问 Nacos 控制台 (通常为 `http://localhost:8848/nacos`)，进入“服务管理” -> “服务列表”。
- **截图目标**：
  截取服务列表的页面区域。
- **核验标准**：
  - 列表中必须展示网关 (`lgg-gateway`) 和各个微服务。
  - 实例数必须大于 0（健康状态）。

### 3. Gateway 接口动态路由转发 (`S03-gateway-route-real`)
- **所在章节**：3.4 服务模块设计
- **前置操作**：
  打开 IDE (如 IntelliJ IDEA)，定位到 `lgg-gateway` (或 `ruoyi-gateway`) 模块下的 `src/main/resources/application.yml` 文件。
- **截图目标**：
  截取包含 `routes:` 配置块（从 `spring.cloud.gateway.routes` 开始）的代码区域。
- **核验标准**：
  - 必须清晰展示 `- id: lgg-business`、`uri: lb://lgg-business` 及相关的 `predicates` 断言规则。

---

## 第二部分：管理后台 UI 与核心业务流 (对应第 4 章)

### 4. 核心业务 Feign 远程调用 (`S04-feign-call-real`)
- **所在章节**：4.3 订单与模拟支付闭环
- **前置操作**：
  打开 IDE (如 IntelliJ IDEA)，定位到 `lgg-pay` 模块调用 `lgg-business` 的 `RemoteOrderService` 或类似的 OpenFeign 接口类代码。
- **截图目标**：
  截取含有 `@FeignClient` 注解和更新订单状态的方法声明的代码片段。
- **核验标准**：
  - 必须清晰展示 `@FeignClient(contextId = "remoteOrderService", value = "lgg-business")`。

### 5. RabbitMQ 路由与队列绑定 (`S05-rabbitmq-bindings-real`)
- **所在章节**：4.4 WebSocket 消息广播与 RabbitMQ 解耦
- **前置操作**：
  打开浏览器访问 RabbitMQ Management 控制台 (通常为 `http://localhost:15672`)，进入 `Exchanges` 或 `Queues` 页面，找到支付成功相关的队列（如 `pay.success.queue`）。
- **截图目标**：
  截取队列的详情或绑定关系（Bindings）页面。
- **核验标准**：
  - 必须展示 Exchange 与 Queue 的 Routing Key 绑定关系。

### 6. WebSocket 实时帧通讯 (`S06-websocket-frames-real`)
- **所在章节**：4.4 WebSocket 消息广播与 RabbitMQ 解耦
- **前置操作**：
  登录管理后台网页，按 F12 打开浏览器开发者工具，进入 `Network` (网络) 面板，过滤 `WS` (WebSocket) 连接。触发一次支付成功事件（可使用小程序模拟下单或 Postman 调接口）。
- **截图目标**：
  截取开发者工具中的 WebSocket `Messages` (消息) 面板。
- **核验标准**：
  - 必须展示后端推送给前端的 JSON 格式订单提醒消息帧（含订单号等）。

### 7. 管理后台新订单语音播报/通知弹窗 (`S09-admin-notification-real`)
- **所在章节**：4.4 WebSocket 消息广播与 RabbitMQ 解耦
- **前置操作**：
  在管理后台网页保持登录状态，触发一次模拟支付成功。
- **截图目标**：
  截取后台页面右下角或顶部弹出的新订单消息提示框 (Message / Notification)。
- **核验标准**：
  - 弹窗内容需体现“您有新的包装提醒”或新订单信息。

### 8. 运营数据大屏 (`S10-dashboard-real`)
- **所在章节**：4.1 管理后台与运营数据大屏实现
- **前置操作**：
  使用账号 `admin` / `123456` 登录管理后台，进入首页 (Dashboard)。
- **截图目标**：
  截取完整的首页统计大屏（包含图表、待处理订单列表等）。
- **核验标准**：
  - 数据面板需有实际渲染的数据，不能全是 0。

---

## 第三部分：微信小程序端闭环 (对应第 4 章)

*(注：建议使用微信开发者工具模拟器进行截图，保证比例和清晰度)*

### 9. 小程序商品结算 UI (`S07-mp-checkout`)
- **所在章节**：4.3 订单与模拟支付闭环
- **前置操作**：
  在小程序中将商品加入购物车，点击“去结算”进入订单确认页。
- **截图目标**：
  截取完整的结算确认页面（含地址、商品清单、总金额及“微信支付”按钮）。

### 10. 模拟支付成功 UI (`S08-mock-pay-success-real`)
- **所在章节**：4.3 订单与模拟支付闭环
- **前置操作**：
  在结算页点击支付按钮，完成模拟支付（或调用模拟接口后跳转的成功页面）。
- **截图目标**：
  截取支付成功的提示页面。

### 11. 小程序订单列表 UI (`S15-mp-order-list`)
- **所在章节**：4.3 订单与模拟支付闭环
- **前置操作**：
  在小程序“我的”页面进入订单列表，切换到“全部”或“已支付”Tab。
- **截图目标**：
  截取订单列表，需看到刚才支付的订单状态更新。

### 12. 小程序订单详情 UI (`S14-mp-order-detail`)
- **所在章节**：4.3 订单与模拟支付闭环
- **前置操作**：
  在订单列表中点击具体的订单进入详情。
- **截图目标**：
  截取订单详情页，展示订单编号、状态、下单时间等明细。

---

## 第四部分：自动化测试与接口 (对应第 5 章)

### 13. Newman / Postman 接口测试报告 (`S11-newman-cli-real`)
- **所在章节**：5.1 接口自动化测试与 Newman 验证
- **前置操作**：
  在终端中执行 Newman 运行脚本，例如：
  ```bash
  newman run lgg_postman_collection.json -r cli,htmlextra
  ```
  *(或直接截取 Postman 中 Runner 执行全部通过的界面)*
- **截图目标**：
  终端中绿色全 Pass 的测试断言汇总表格。
- **核验标准**：
  - 必须展示 HTTP 200 和断言通过的绿色标识。

### 14. Playwright E2E 测试 CLI 报告 (`S12-playwright-cli-real`)
- **所在章节**：5.2 Playwright 核心闭环端到端（E2E）测试
- **前置操作**：
  在包含 Playwright 测试的目录下运行：
  ```bash
  npx playwright test
  ```
- **截图目标**：
  截取终端中显示 `X passed` 的绿色结果输出，或者 `npx playwright show-report` 打开的 HTML 报告首页。
- **核验标准**：
  - 清晰展示端到端测试用例执行通过的标识。
