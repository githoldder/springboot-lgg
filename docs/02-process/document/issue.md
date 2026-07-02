# 后端系统扫描分析与当前信息阻塞项报告 (issue.md)

## 🔴 当前信息阻塞项 (Blocking Issues)

1. **管理端首页数据 Mock 状态**: 前端 `/src/views/index.vue` 中所有关键销售指标、订单状态占比、热销水果排名均为硬编码静态 Mock 数据，无法展示系统的实时运营成果。
2. **缺少可视化图表组件**: 首页缺乏直观展示商业财务趋势、用户增长及热销水果品类的商业折线图、饼图与柱状图。
3. **多微服务下的 WebSocket 端口路由适配**: 本地部署时，由于 `lgg-business` (Port 8090) 与 `lgg-notice` (Port 8083) 分别维护了独立的 WebSocket 连接句柄，前端连接需要根据网关路由或不同微服务端口进行精准匹配转发，若网关拦截未完全放行，可能导致握手失败（401/403）。

## 🔴 当前业务细节与逻辑边界疑问 (Business Logical Issues)

1. **骑手多订单并单指派限制**: 当后台管理员向骑手分派订单时，是否允许同一个骑手同时接多个单？指派数量是否存在上限设置？
2. **WebSocket 离线消息提醒机制**:
   - 当用户进行了特定操作（如下单/催单）触发 Web 端 WebSocket 消息播报时，如果管理员在 Admin 后台处于退出（Logout）或浏览器关闭状态，此消息通知是否会一直提醒（或在下次登录时补发），还是说该条消息会直接丢失/消失？
   - 如果管理员手动点击“关闭消息通知”，在此之后发生的订单催单情况，管理员是否就完全无从得知，系统是否缺乏兜底的离线提醒（如短信/微信推送）？
3. **多骑手防并发抢单控制**: 如果系统中存在多个骑手，是否允许他们对同一个订单进行抢单？在抢单瞬间是否设计了乐观锁或分布式锁防止多人重复抢单成功的并发冲突？

---

## 🟢 后端系统全盘扫描与深度解答

### 1. 数据库、数据表与实体关系 (Tables, Entities & Relationships)

#### 数据表分类：系统自带表与核心业务表
本系统的数据库 `lgg_ruoyi` 共包含 30 余张表。表结构清晰地划分为两部分：
1. **RuoYi 框架自带系统表 (直接复用与注入)**: 
   - 如 `sys_user` (系统用户), `sys_role` (角色), `sys_menu` (菜单), `sys_dept` (部门), `sys_dict_data`/`sys_dict_type` (字典表), `sys_config` (系统参数配置), `sys_job`/`sys_job_log` (Quartz定时任务表) 等。
   - 这些表不需要二次开发，其对应的 Dao (Mapper)、Service 和 Controller 层代码完全由若依框架自带（位于 `ruoyi-system`、`ruoyi-framework` 模块），在启动时直接注入并随容器加载，提供了完备的管理员登录、基于 JWT 的 Token 鉴权、基于 RBAC 的权限过滤（如 `@PreAuthorize` 拦截）以及系统监控能力。
2. **自定义核心业务表 (10张核心表)**:
   - 专门用于承载“水果生鲜运营平台”的生鲜交易及流转逻辑，表名均以 `lgg_` 前缀命名，如下表所示：

| 数据库表 | 对应的 Java 实体 (Entity) | 主要业务意义 | 核心主键/索引约束 |
|---|---|---|---|
| `lgg_category` | `Category.java` | 水果及果篮分类 | `id` (PK), `idx_category_name` (UNIQUE 索引，防止分类重名) |
| `lgg_fruit` | `Dish.java` | 水果商品单品信息 | `id` (PK), `category_id` (逻辑关联分类), `idx_fruit_name` (UNIQUE 索引) |
| `lgg_fruit_flavor` | `DishFlavor.java` | 水果单品的规格/口感属性 | `id` (PK), `fruit_id` (逻辑关联水果) |
| `lgg_fruit_box` | `Setmeal.java` | 精选果篮/套餐组合 | `id` (PK), `category_id` (逻辑关联分类), `idx_fruit_box_name` (UNIQUE 索引) |
| `lgg_fruit_box_item`| `SetmealDish.java` | 果篮中包含的单品水果及份数 | `id` (PK), `fruit_box_id` (逻辑关联果篮), `fruit_id` (逻辑关联单品) |
| `lgg_shopping_cart` | `ShoppingCart.java` | C端用户购物车暂存数据 | `id` (PK), `user_id` (逻辑关联用户), `fruit_id`/`fruit_box_id` (单品/套餐逻辑关联) |
| `lgg_orders` | `Orders.java` | 订单主表，保存订单状态与配送信息 | `id` (PK), `number` (UNIQUE 订单号), `user_id` (逻辑关联用户), `address_book_id` (逻辑关联收货地址) |
| `lgg_order_detail` | `OrderDetail.java` | 订单商品详情明细 | `id` (PK), `order_id` (逻辑关联主订单), `fruit_id`/`fruit_box_id` (商品逻辑关联) |
| `lgg_address_book` | `AddressBook.java` | 用户收货地址簿 | `id` (PK), `user_id` (逻辑关联用户) |
| `lgg_user` | `User.java` | 微信 C 端注册用户信息 | `id` (PK), `openid` (微信端唯一标识，保证一微信号一用户) |

#### 约束关系说明
- **无物理外键约束**: 数据库表中未建立物理 `FOREIGN KEY` 约束，以避免高并发写操作时的锁表及性能损耗。
- **逻辑外键依赖**: 关系完全在 Application 层（Java 服务层）保证。例如：
  - 删除 Category 前，会检查 `lgg_fruit` 和 `lgg_fruit_box` 是否存在引用，若存在则抛出 `DeletionNotAllowedException`。
  - 新增/更新订单时，通过 `address_book_id` 与 `user_id` 查询地址簿和用户表，验证其存在性及合法性。
  - 商品价格变动不影响历史订单：`lgg_order_detail` 和 `lgg_shopping_cart` 均对 `price`/`amount` 进行了数值冗余记录，保障交易链路的历史可追溯性。

---

### 2. Redis 缓存机制 (Redis Cache)

#### Redis 存储的数据内容
1. **系统配置与基础元数据**: 缓存 RuoYi 系统字典数据 (`sys_dict:*`)、系统参数配置 (`sys_config:*`)。
2. **安全认证与权限**: 缓存当前登录用户的 Token 凭证及权限列表 (`login_tokens:uuid`)。
3. **安全限流与防刷**: 缓存验证码字符 (`captcha_codes:uuid`) 以及接口限流计数器。
4. **商户营业状态**: 缓存键 `SHOP_STATUS` (Integer 类型：1 代表营业，0 代表休业)，避免高频读取数据库。
5. **水果商品目录列表**: 缓存键 `dish_categoryID` (List<DishVO> 结构)，当用户在小程序端浏览某分类的水果时优先读取 Redis，避免高频对 `lgg_fruit` 表执行多表联查。

#### 缓存失效与清理时机
- **主动清除**: 当管理员修改、新增、删除水果（`Dish`）或改变起售停售状态时，业务层在 `DishController` 中通过 `Pattern` 清理所有对应的 `dish_*` 键，保障前后台数据的一致性。
- **过期时间**: 登录 Token 与验证码均设置了相应的生命周期（如 30 分钟/2 分钟），超时自动由 Redis 剔除。

---

### 3. 数据流向与服务间调用通信 (Data Flow & Inter-Service Calls)

```mermaid
graph TD
    Client[微信小程序/管理端前端] -->|HTTP 请求| Gateway[lgg-gateway 网关: 8080]
    Gateway -->|路由匹配 /admin /user| Business[lgg-business 业务服务: 8090]
    Gateway -->|路由匹配 /pay| Pay[lgg-pay 支付服务: 8082]
    Gateway -->|路由匹配 /ws| WSBus[WebSocket: 8090/ws]
    Gateway -->|路由匹配 /websocket| WSNot[WebSocket: 8083/websocket]

    Pay -->|1. 同步 Feign 调用| Business
    Pay -.->|2. 异步事件发布| RabbitMQ[RabbitMQ 消息队列: 5672]
    RabbitMQ -.->|3. 异步监听消费| Notice[lgg-notice 通知服务: 8083]
```

#### 数据流动步骤说明：
1. **用户下单**: 小程序端发起 HTTP 请求，网关将流量分发给 `lgg-business`，业务模块写入 `lgg_orders` (状态: 待付款，status=1)。
2. **模拟支付**: 小程序端请求 `lgg-pay` 进行模拟支付操作。
3. **服务同步调用 (OpenFeign 原理)**: `lgg-pay` 收到请求并扣款成功后，通过 OpenFeign 客户端 `OrderServiceClient` 同步调用 `lgg-business` 的内置支付回调接口 `/notify/mockPaySuccess`，业务服务同步将 `lgg_orders` 的 `status` 改为“待接单(2)”，`pay_status` 改为“已支付(1)”，并向 `lgg-business` 的 WebSocket 连接广播来单事件。
4. **服务异步解耦**: `lgg-pay` 同时向 RabbitMQ 发送一条包含订单号的异步消息。
5. **通知触达**: `lgg-notice` 异步监听到消息后，将消息包装并投递到其自身的 WebSocket 长连接信道中，向页面推送“请及时包装”的即时提醒。

---

### 4. OpenFeign 如何实现服务间通信

OpenFeign 是一种声明式的 REST 客户端，用于简化 Spring Cloud 微服务之间的同步 HTTP 调用。其底层实现原理可归纳为以下四步：

1. **接口声明与代理注入**: 
   - 开发者通过 `@FeignClient(name = "lgg-business")` 声明接口 `OrderServiceClient`。Spring Cloud 在启动时扫描该注解，并通过 JDK 动态代理技术生成该接口的代理实现类，并注入到 Spring 容器中。
2. **服务发现与负载均衡**:
   - 当调用 `orderServiceClient.mockPaySuccess(orderNumber)` 时，代理类拦截该方法调用。它会解析接口注解中的服务名 `lgg-business`。
   - Feign 底层集成 Ribbon/Spring Cloud LoadBalancer，向 Nacos 注册中心查询 `lgg-business` 的实例列表，获取其真实的 IP 和端口，并执行负载均衡策略选择一台实例。
3. **HTTP 请求构建与发送**:
   - 代理类根据方法上的 `@RequestMapping("/notify/mockPaySuccess")` 构建 HTTP 请求的 URL，把方法入参 `orderNumber` 转化为 URL 路径中的 Query 参数。
   - 使用底层的 HTTP 客户端（如 HttpURLConnection、Apache HttpClient 或 OkHttp）向目标服务发送真实的 HTTP 请求。
4. **响应解析与反序列化**:
   - 接收目标服务的 HTTP 响应，并根据方法返回值（本处为 `void`，也可以是特定 Java 对象）进行 JSON 反序列化，最后将控制权还给调用方。

---

### 5. RabbitMQ 工作原理与源码实现 (RabbitMQ & Source Code)

#### 工作原理
RabbitMQ 负责支付链路和通知链路的**解耦**。在此场景中采用了 **Topic 交换机模式**：
- **生产者 (Producer)**: 支付模块 `ruoyi-pay`，在支付确认后发布订单号。
- **交换机 (Exchange)**: `pay.exchange`，类型为 `topic`。
- **队列 (Queue)**: `pay.success.queue`，用于持久化缓存未消费的支付通知。
- **路由键 (Routing Key)**: `pay.success`。
- **绑定 (Binding)**: 将 `pay.success.queue` 绑定到 `pay.exchange`，路由规则精确匹配 `pay.success`。

#### 源码体现位置
- **队列、交换机配置**: `ruoyi-pay/src/main/java/com/ruoyi/pay/config/RabbitConfig.java`
  - 使用 `@Bean` 初始化 `TopicExchange`("pay.exchange")、`Queue`("pay.success.queue")，并建立二者的 Binding。
- **消息发送端**: `ruoyi-pay/src/main/java/com/ruoyi/pay/service/MockPayService.java`
  - 在模拟支付逻辑中注入 `RabbitTemplate`，调用 `rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE_NAME, RabbitConfig.ROUTING_KEY, orderNumber)`。
- **消息接收端 (Consumer)**: `ruoyi-notice/src/main/java/com/ruoyi/notice/consumer/PaySuccessConsumer.java`
  - 使用 `@RabbitListener(bindings = @QueueBinding(...))` 声明消费者，自动监听并处理队列消息，处理完毕后触发 WebSocket 广播。

---

### 6. WebSocket 业务代码与具体服务通信 (WebSocket Operations)

系统中存在两套 WebSocket 独立端点，均用于向管理端前端广播通知：

1. **`lgg-business` 的 `/ws/{sid}`**:
   - **源码位置**: `ruoyi-business/src/main/java/com/ruoyi/business/websocket/WebSocketServer.java`
   - **使用业务**: 
     - **来单语音提醒**: 用户模拟支付成功后，`OrderServiceImpl.paySuccess` 同步调用 `WebSocketServer.sendToAllClient(json)`，推送 "您有新的常工鲜生订单，请及时接单！订单号：xxx" (类型标记 `type: 1`)。
     - **用户催单播报**: 用户在微信小程序上点击“催单”时，通过 `OrderServiceImpl.reminder` 推送 "客户正在疯狂催单！..." (类型标记 `type: 2`)。
   - **通信主体**: `lgg-business` 服务端 $\leftrightarrow$ 管理端 Web 前端。

2. **`lgg-notice` 的 `/websocket/{userId}`**:
   - **源码位置**: `ruoyi-notice/src/main/java/com/ruoyi/notice/websocket/WebSocketServer.java`
   - **使用业务**:
     - **后台包装提醒**: 监听到 RabbitMQ 消息后，由 `PaySuccessConsumer` 调用 `WebSocketServer.sendToAllClients(json)`，推送 "您有新的常工鲜生订单，请及时包装！订单号：xxx"。
   - **通信主体**: `lgg-notice` 服务端 $\leftrightarrow$ 管理端 Web 前端。

---

### 7. 真实支付模块的改造与商户接入说明

#### 当前 Mock 支付设计中的硬编码部分
在目前的 `ruoyi-pay` 模块中，`MockPayService.java` 和 `PayController.java` 通过以下硬编码方式完成了交易流转：
- **无签名验证与通信密钥**: 支付时直接假设微信端支付结果为 Success，直接以 HTTP 形式通过 Feign 同步调用后端 `/notify/mockPaySuccess`，没有验证来自微信支付的数字签名。
- **模拟成功行为**: 微信支付所需的 JSAPI 统一下单（获取 `prepay_id`）被略过，直接由后端调用 `paySuccess`。
- **回调解密**: 在 `PayNotifyController.java` 中，原装的 `paySuccess` 回调接口配置了解密器 `AesUtil`，但由于没有配置真实的 V3 密钥（`WeChatProperties` 未填写证书与 APIv3Key），实际调用会导致报错，故前端被引导走模拟通道 `mockPaySuccess`。

#### 后续接入真实微信支付的改造策略
要实现具有真实商业经营能力的收银台，系统后续需要按照以下步骤重构支付接口：

1. **真实商户号申请与资质资质**:
   - 企业需持有**真实商家营业执照**（个体工商户或企业法人），向微信支付开放平台申请成为**特约商户**，获取 **微信支付商户号 (MchID)**。
   - 获取微信支付 API 证书文件（包含 `apiclient_key.pem`、`apiclient_cert.pem`）并设置 API v3 密钥（用于支付成功异步回调解密）。
   - 将微信小程序与该商户号进行绑定授权。
2. **重构支付下单逻辑**:
   - 小程序端点击“立即付款”时，调用后端 `PayController`，不再进行状态的直接修改，而是调用微信官方 SDK/API（JSAPI 统一下单接口 `/v3/pay/transactions/jsapi`）。
   - 请求参数需包含：商户号（`mchid`）、小程序ID（`appid`）、订单金额（`amount`）、商品描述（`description`）、回调通知URL（`notify_url`，指向外网可访问的 `PayNotifyController`）以及用户的 `openid`。
   - 微信支付响应后返回预支付会话标识 `prepay_id`。
3. **前端拉起收银台**:
   - 后端根据 `prepay_id`，结合小程序 AppID、当前时间戳、随机字符串，使用商户私钥（`apiclient_key.pem`）生成签名，并将参数包返回给小程序端。
   - 小程序端接收后调用微信原生的支付 API：
     ```javascript
     wx.requestPayment({
       timeStamp: '...',
       nonceStr: '...',
       package: 'prepay_id=...',
       signType: 'RSA',
       paySign: '...',
       success (res) { /* 用户付款成功，在此等待微信异步通知或主动轮询订单状态 */ },
       fail (res) { /* 用户取消或支付失败 */ }
     })
     ```
4. **安全回调解密与状态确认**:
   - 微信服务器异步向后端的 `PayNotifyController.paySuccess` 回调接口投递 JSON。
   - 后端使用 API V3 密钥对密文进行解密，验证签名无误后，安全更新 `lgg_orders` 表的状态，并发送 RabbitMQ 消息进行通知广播。

---

### 8. Vue Admin 首页改造与动态 ECharts 图表方案

#### 可视化图表设计与真实接口映射表

我们可以引入 `echarts` 组件，在首页全新设计和布局 4 个商业可视化图表：

| 图表类型 | 商业分析维度 | 后端真实接口映射 (API) | 数据结构说明 |
|---|---|---|---|
| **ECharts 折线图** | **最近7天营业额走势** | `GET /admin/report/turnoverStatistics?begin=xxx&end=xxx` | 返回每日营业额数值列表，绘制趋势图 |
| **ECharts 柱状图** | **热销水果销量排名前10 (Top 10)** | `GET /admin/report/top10?begin=xxx&end=xxx` | 返回前10名商品名称和对应销售份数，绘制排行榜 |
| **ECharts 饼图/环形图**| **订单状态分布** | `GET /admin/workspace/overviewOrders` | 获取待接单、派送中、已完成、已取消的订单占比 |
| **ECharts 折线图** | **新老用户增长趋势** | `GET /admin/report/userStatistics?begin=xxx&end=xxx` | 绘制总用户数和每日新增用户数的增长曲线图 |
 
 #### 首页 4 大基础卡片真实对接
 - **今日销售额**: 对接 `GET /admin/workspace/businessData` 返回的 `turnover`
 - **今日订单量**: 对接 `GET /admin/workspace/businessData` 返回的 `validOrderCount`
 - **新增会员客户**: 对接 `GET /admin/workspace/businessData` 返回的 `newUsers`
 - **在售商品品种**: 对接 `GET /admin/workspace/overviewDishes` 返回的 `sale` (起售中数量)

---

### 9. 订单生命周期管理：催单防刷与超时机制设计

#### 9.1 催单信息爆炸与高频防刷机制 (Rate Limiter Filter)
生鲜配送属于即时商业场景，用户可能因为配送延迟产生焦虑并进行高频恶性催单。若不加以限制，不仅会导致管理端的 WebSocket 长连接信道发生消息爆炸，还可能严重干扰后台商家的处理体验。
- **前端限流控制**：用户点击“催单”按钮后，按钮立即置灰并进入 60 秒倒计时锁死状态，防止在客户端界面重复高频点击。
- **后端 Redis 频率拦截**：
  在后台 `reminder(Long id)` 接口中，引入 Redis 原子锁进行分布式限流。使用键名 `lgg:order:reminder:lock:{orderId}`。
  当催单请求到达时，执行：
  `SET lgg:order:reminder:lock:{orderId} "1" EX 60 NX`
  若返回失败，说明 60 秒内已发起过催单，直接拦截并向客户端抛出 `OrderBusinessException("催单频率过快，配送员已在马不停蹄赶来，请 60 秒后再试")`。
- **业务状态关联拦截**：
  - 若订单状态为 `PENDING_PAYMENT` (待付款)，拦截催单并提示“请先支付订单”。
  - 若订单状态为 `DELIVERY_IN_PROGRESS` (配送中)，催单时推送特定语音“客户催单！骑手已在配送途中，请联系骑手联络电话”，避免仓库包装端产生重复打包提醒。
  - 若订单状态为 `COMPLETED` (已完成) 或 `CANCELLED` (已取消)，直接禁用催单接口。

#### 9.2 配送期望时间与超时状态设计 (Estimated & Overtime Trace)
为了给用户提供精准的配送时效保障，并让商家能直观捕获即将超时和已经超时的紧急订单，需对数据模型进行扩展：
1. **数据表扩容**：在 `lgg_orders` 表中新增以下物理列：
   - `estimated_delivery_time` (datetime): 用户期望送达时间（默认为下单时间 + 30 分钟）。
   - `overtime_status` (tinyint): 超时标记（0-正常，1-已超时），默认为 0。
   - `actual_delivery_time` (datetime): 骑手实际确认送达时间。
2. **超时状态动态判定与高亮**：
   - 管理后台进行订单列表 conditionSearch 查询时，实时比对当前系统时间 `LocalDateTime.now()` 与 `estimated_delivery_time`。
   - 若 `LocalDateTime.now() > estimated_delivery_time` 且订单状态仍为 `TO_BE_CONFIRMED` (待接单) 或 `DELIVERY_IN_PROGRESS` (配送中)，则在接口 VO 中动态将 `overtime_status` 设为 1。
   - 前端管理页面对于 `overtime_status === 1` 的订单卡片统一标红闪烁，并触发单独的“订单已超时，请紧急处理”预警铃声。

#### 9.3 订单生命周期超时自动关单 (Lifecycle Automatic Cancel)
系统需要引入自动流转来处理长期挂起的无用订单：
- **未支付超时自动取消**：基于 RabbitMQ 延迟队列或 Redis Key 过期监听。用户下单后 15 分钟内若未完成支付，系统自动调用关单逻辑，恢复购物车商品库存并把订单状态流转为“已取消(CANCELLED)”。
- **派送中超时安全预警**：骑手被指派后如果超过 24 小时仍未点击完成，系统自动发送预警日志给运营人员介入，防止虚假指派或资金链路挂起。

---

### 10. 后端核心源码高危漏洞审计报告

通过对 `OrderServiceImpl.java` 中核心下单、支付回调和取消接口的扫描分析，排查出以下 4 个高危安全及逻辑漏洞：

#### 漏洞 A：订单金额防篡改验证缺失（严重支付漏洞）
- **漏洞位置**：[OrderServiceImpl.java:67-135](file:///Users/caolei/Desktop/springboot-lgg/ruoyi-vue-lgg-backend/ruoyi-business/src/main/java/com/ruoyi/business/service/impl/OrderServiceImpl.java#L67-135)
- **代码缺陷**：
  ```java
  BeanUtils.copyProperties(ordersSubmitDTO, orders);
  // ...
  if (orders.getAmount() == null) {
      orders.setAmount(total);
  }
  ```
  如果恶意用户在发起下单的 HTTP 请求体（`OrdersSubmitDTO`）中显式传入了 `amount`（例如把 200 元篡改为 0.01 元），`BeanUtils` 会直接将该篡改值拷贝进 `orders`。由于 `orders.getAmount()` 此时不为 null，后端会跳过总额覆盖，直接把 0.01 元写入数据库并拉起真实扣款！
- **修复对策**：不信任前端传入的任何金额。下单接口中必须强行执行 `orders.setAmount(total)`，以购物车后台实际计算的金额进行覆盖校验。

#### 漏洞 B：平行越权取消他人订单（严重逻辑漏洞）
- **漏洞位置**：[OrderServiceImpl.java:261-274](file:///Users/caolei/Desktop/springboot-lgg/ruoyi-vue-lgg-backend/ruoyi-business/src/main/java/com/ruoyi/business/service/impl/OrderServiceImpl.java#L261-274)
- **代码缺陷**：
  ```java
  public void userCancelById(Long id) throws Exception {
      Orders orders = orderMapper.getById(id);
      if (orders == null) {
          throw new OrderBusinessException(MessageConstant.ORDER_NOT_FOUND);
      }
      if (orders.getStatus() > 2) {
          throw new OrderBusinessException(MessageConstant.ORDER_STATUS_ERROR);
      }
      orders.setStatus(Orders.CANCELLED);
      orderMapper.update(orders);
  }
  ```
  代码中仅凭传入的订单 ID 执行了查询和状态变更，**完全没有校验该订单的 `userId` 与当前登录的 `BaseContext.getCurrentId()` 是否一致**！由于数据库主键是递增的 Long 值，外部攻击者可以使用脚本批量遍历 ID，强制取消全平台所有其他用户的未发货订单。
- **修复对策**：查询订单后，强制加入用户归属权校验：
  `if (!orders.getUserId().equals(BaseContext.getCurrentId())) { throw new OrderBusinessException(MessageConstant.ORDER_STATUS_ERROR); }`

#### 漏洞 C：再来一单接口平行越权隐私泄漏（逻辑漏洞）
- **漏洞位置**：[OrderServiceImpl.java:279-291](file:///Users/caolei/Desktop/springboot-lgg/ruoyi-vue-lgg-backend/ruoyi-business/src/main/java/com/ruoyi/business/service/impl/OrderServiceImpl.java#L279-291)
- **代码缺陷**：在 `repetition(Long id)` 方法中，直接根据订单 ID 获取明细数据并拷贝到购物车，未校验当前用户是否为原订单所有人。攻击者可通过遍历 ID 将别人的订单商品复制到自己的购物车，从而窃取他人的购买隐私与消费倾向。
- **修复对策**：在加载明细前，先获取原订单对象并执行 `userId` 一致性核对。

#### 漏洞 D：高并发下单商品库存无扣减控制（超卖缺陷）
- **代码缺陷**：核心业务下单和支付回调方法中，完全没有对商品库存（Stock）的扣减逻辑，也没有配置 Redis 预扣减或乐观锁扣减。当多用户高并发抢购畅销生鲜时，系统会产生严重的商品超卖（即卖出了多于库存的单量），导致商户财务账目不一致及配送履约违约。
- **修复对策**：在支付回调成功后，执行批量减库存 SQL 操作，且扣减时附加过滤条件：`UPDATE lgg_fruit SET stock = stock - #num WHERE id = #id AND stock >= #num`。当影响行数不匹配时抛出异常并触发逆向退款。

---

### 11. 订单异常场景流转与防御决策树

通过决策树形式覆盖真实业务场景中的异常特殊情况，以作为系统设计的流转规范：

```mermaid
graph TD
    A[用户提交下单请求] --> B{收货地址/购物车校验?}
    B -- 校验失败 --> C[抛出业务异常/中断下单]
    B -- 校验通过 --> D[计算购物车总金额 total]
    D --> E[强制执行 orders.setAmount(total) 覆写防篡改]
    E --> F[生成订单记录, 锁定商品库存]
    F --> G{15分钟内是否成功付款?}
    
    G -- 否 (支付超时) --> H[触发死信消息: 取消订单, 异步退回库存]
    G -- 是 (确认付款) --> I[流转状态为待接单/待包装]
    I --> J[通过 WebSocket 群发来单提示语音]
    
    J --> K{管理员离线或主动关闭通知?}
    K -- 是 (离线状态) --> L[长连接Session移除/即时消息丢弃, 依赖登录后列表待接单条件查询兜底]
    K -- 否 (在线状态) --> M[播放语音/弹窗提醒]
    
    M --> N{用户发起催单请求?}
    N --> O{Redis 催单限流锁校验?}
    O -- 60s内重复催单 (频率拦截) --> P[抛出 RateLimit 异常并拦截拦截]
    O -- 首发催单 (校验通过) --> Q{订单当前所处状态判定?}
    
    Q -- 已完成/已取消 --> R[拒绝催单]
    Q -- 待包装/待派送 --> S[写入 Redis 锁 60s, 并通过 WS 广播催单语音]
    
    S --> T{管理员指派骑手送单?}
    T --> U{派单并发冲突校验?}
    U -- 双管理员同时指定不同骑手 (竞态) --> V[SQL乐观锁版本控制拦截, 仅首发成功, 后发提示已被指派]
    U -- 单指派成功 --> W[骑手绑定订单, 状态转为配送中]
    
    W --> X{配送当前时间 > 预计送达时间?}
    X -- 是 (配送超时) --> Y[订单列表置为超时状态, 触发超时预警铃声]
    X -- 否 (正常时效) --> Z[骑手送达, 点击确认完成]
    
    Z --> AA{微信原路退款/售后发起?}
    AA -- 是 (逆向流程) --> AB[开启退款事务: 原路发起退款, 失败进入人工对账补偿通道]
    AA -- 否 (正常结束) --> AC[订单归档]
```
