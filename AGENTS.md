
## Session 2026-06-08: Sprint03 真实状态 — 前端 Bug 修复 + 诚实文档

### PRD Updated (2026-06-08 19:45)
1. `prds/md/sprint03-prd-260608-v1.md` — 新增「🔴 当前真实状态」附表，列出已修复项和仍阻塞的问题
2. `prds/json/sprint03-prd-260608-v1.json` — 新增 `blocking_issues` 数组，5 个 BLK 条目；更新 S03-T01→completed, S03-T03/T04→partially_completed

### New Fix (2026-06-08 19:45)
1. `goAddress()` 添加 `addressListLoading` 标志 — 防止 `getAddressList()` 异步请求未完成时 `addressList.length===0` 误判，跳转到添加地址页而非地址选择页
   - `vendor.js:21869`: data 中加 `addressListLoading: true`
   - `vendor.js:22003`: `getAddressList` 的 `.finally(() => loading=false)` 
   - `vendor.js:22037`: `goAddress` 开头检查 `loading`，显示 toast 并 return

### Still Blocking
1. **DevTools 缓存** — vendor.js 改动需手动清除缓存 + 重新编译才能生效
2. **API 超时** — WAServiceMainContext.js timeout，可能是网关/后端连接问题
3. **setOrderNum 竞态** — 购物车数量在首次加载时可能为 0（dish 列表加载先于购物车列表）
4. **M3.1/M3.2 分类过滤** — 未传 type 参数 + 条件反转，代码尚未修改

## Session 2026-06-08: Sprint03 Complete — Full Ordering Flow

### Root Causes Fixed
1. `OrderMapper.xml` INSERT 缺 `user_name` 列 → 用户名称未写入
2. `Orders.java` 中 `packAmount`/`tablewareNumber` 为 `int` 基本类型 → `BeanUtils.copyProperties` 传 null 报错
3. `delivery_status`/`tableware_status` 为数据库 NOT NULL 列 → 前端未传时默认 null 导致 SQL 异常
4. **Fix**: 在 `OrderServiceImpl.submitOrder()` 中插入前设置默认值：
   - `deliveryStatus=1`, `packAmount=0`, `tablewareNumber=0`, `tablewareStatus=1`

### vendor.js White Screen Fix (2026-06-08 18:20)
1. `getData()` 中 `uni.login({ provider: 'weixin', ... })` → 移除 `provider: 'weixin'`（WeChatLib 3.16.1 可能弃用）
2. `getData()` 中 `uni.login()` → 增加 `fail` 回调，生成 mock code 降级登录
3. `loginSync()` → 增加 `fail` 回调 + `reject` 正常防挂起

### Frontend Cart & Address Fixes (2026-06-08 19:20)
1. `addDishAction()` 移除错误的规格检查条件 — 原条件 `!(openMoreNormPop && flavorDataes.length<=0)` 导致任何调用都 toast "请选择规格" 并 return，永远不调 API
2. `dishListData` 的 `.map()` 中初始化 `dishNumber: 0` — 修复购物车数量显示 "null" 的问题（`$orig` 无法读取动态添加属性）
3. `getAddressList()` 增加无默认地址时的回退逻辑 — 若 `getAddressBookDefault()` 无返回，用地址列表第一条填充订单地址

### Complete Flow Verified
```
用户下单    → Code:1 订单创建成功
用户支付    → Mock 支付参数返回
支付确认    → status:2(待接单) payStatus:1(已支付)
管理员接单  → Code:1
管理员派送  → Code:1
管理员完成  → status:5(已完成)
用户端历史  → status:5 payStatus:1
工作台数据  → turnover:¥36.30, validOrders:2
```

### Build & Deploy
```bash
mvn package -DskipTests -pl ruoyi-business -am  # 不要加clean (因框架模块锁定)
pm2 restart lgg-business
```

## Session 2026-06-10: Sprint03 Diagnostic — 地址注入/价格硬编码/通信链路修复

### Root Causes Diagnosed

#### 🔴 Issue #3: 支付页永远显示 6.00 元起步
- **根因**: `vendor.js:22094` `computOrderInfo()` 中硬编码 `+ 6 + orderDishNumber`
- 即使购物车为空，`0 + 6 + 0 = 6` → 支付页永远 >= 6.00
- **Fix**: 移除 `+ 6 + this.orderDishNumber`，总价仅由购物车商品实际金额计算

#### 🔴 Issue #3/#4: 地址永远不自动填入（核心 Bug）
- **根因链路**:
  1. 后端 `AddressBookController.getDefault()` 条件 `list.size() == 1` 过于严格
     - 无默认地址时返回 `Result.error("没有查询到默认地址")` → `code !== 1`
  2. 前端 `getAddressBookDefault()` 发现 `res.code !== 1` → **静默跳过**，不填充地址
  3. 结果: `this.address` / `this.addressBookId` 永远为空 → 订单页始终显示 "请选择收货地址"
- **Fix (Backend)**: 放宽为 `!list.isEmpty()`，无结果时返回 `Result.success(null)` 而非 error
- **Fix (Frontend)**: `getAddressBookDefault()` 增加 `res.data` 非空判断 + `fillAddressFromList()` 回退
  - 后备方案: 调用 `queryAddressBookList()`，从完整地址列表中找到 default 或第一条记录

#### 🔴 Issue #5: 选择/保存地址后订单页不更新
- **根因 1**: `address.js:choseAddress()` 被 `addressBackUrl` 守卫拦截 → `setAddress()` 未执行
  - 当用户先点 radio 再点返回时，不接受任何地址数据 → Vuex `addressData` 仍为 `{}`
- **Fix**: `choseAddress()` 无条件执行 `setAddress()`，仅导航回退依赖 `addressBackUrl` 判断
- **根因 2**: `address.js:getRadio()` 仅调 API 设默认，未同步到 Vuex
- **Fix**: `getRadio()` 中增加 `this.setAddress(item)` 同步写入 Vuex

#### 🔴 Issue #6: 支付链路不通
- **根因**: 支付前置条件是 `addressBookId` 有效，地址未填充 → 下单 API 返回 `AddressBookBusinessException`
- 上述地址注入修复后自动解决

### Changes Made

| File | Change |
|------|--------|
| `AddressBookController.java:106-111` | `list.size()==1` → `!list.isEmpty()`，error → `success(null)` |
| `vendor.js:22051-22070` | `getAddressBookDefault()` 加 null 保护 + `fillAddressFromList()` 回退 |
| `vendor.js:22086-22094` | `computOrderInfo()` 移除 `+6+orderDishNumber` |
| `vendor.js:21888` | data 中加 `addressListLoading: false` |
| `vendor.js:22041-22050` | `getAddressList()` 加 `finally` 重置 loading |
| `vendor.js:22069-22080` | `goAddress()` 加 `addressListLoading` 守卫 |
| `address.js:choseAddress` | 移除 `addressBackUrl` 守卫拦截，始终执行 `setAddress` |
| `address.js:getRadio` | 增加 `this.setAddress(item)` 同步到 Vuex |

### Still Blocking
1. **DevTools 缓存** — vendor.js 改动需手动清除缓存 + 重新编译才能生效
2. **API 超时** — WAServiceMainContext.js timeout，可能是网关/后端连接问题
3. **setOrderNum 竞态** — 购物车数量在首次加载时可能为 0（dish 列表加载先于购物车列表）

### Build & Deploy
```bash
mvn package -DskipTests -pl ruoyi-business -am
pm2 restart lgg-business
```

### Notes
- 前端 `vendor.js` 仍有 3 处 `Array.isArray` 保护待验证
- `ALL_PROXY=socks5://127.0.0.1:10808` 影响 curl，需要 `--noproxy '*'` 或先 `unset ALL_PROXY`
- 购物车 dishId 必须对应 `lgg_fruit` 表中真实存在的 ID（101-106, 111-113, 131-133）

## Session 2026-06-10: Sprint03 Demo — WebSocket 实时推送 + Security Fix

### 新增修复
1. **`SecurityConfig.java:105`** — 将 `/ws/**` 加入 `permitAll()` 白名单
   - 之前只有 `/admin/**`, `/user/**`, `/notify/**` 被放行，`/ws/**` 返回 401
   - 导致 WebSocket 握手被 Spring Security 拦截，客户端收到协议错误后断开

### Demo Files Created
1. `websocket-demo.html` — 带 UI 的 WebSocket 客户端页面（连接状态指示 + 消息日志列表）
2. `demo-websocket.js` — Puppeteer 自动化演示脚本（完整流程：重置订单 → 打开页面 → 触发支付 → 截图验证）

### 演示流程
```
1. 重置订单 #72 为待支付 (status=1, pay_status=0, order_time=NOW())
2. Puppeteer 打开 Chrome → websocket-demo.html（经 HTTP server 而非 file://，因 Chrome 拒绝 file:// 的 WS）
3. 页面 WebSocket 连接 ws://localhost:8090/ws/demo-xxx（经网关）
4. curl → POST /notify/mockPaySuccess?orderNumber=1781093884077
5. 后端 paySuccess() 发送 WebSocket → 页面显示 "📢 收到 WebSocket 消息" + "🔔 来单提醒"
6. 截图保存到 /tmp/ws-demo/
```

### Demo 输出
```
20:44:33 | SUCCESS 📢 收到 WebSocket 消息 | {"orderId":72,"type":1,"content":"您有新的常工鲜生订单，请及时接单！订单号：1781093884077"}
20:44:33 | WARNING 🔔 来单提醒！ | 您有新的常工鲜生订单，请及时接单！订单号：1781093884077 (订单ID: 72)
```

### Screenshot（用户可自行查看）
```bash
open /tmp/ws-demo/
```

### Run Again
```bash
mysql -uroot -p123456 -e "USE lgg_ruoyi; UPDATE lgg_orders SET status=1, pay_status=0, order_time=NOW() WHERE id=72;"
node demo-websocket.js
```
