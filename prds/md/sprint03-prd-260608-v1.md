# Sprint 03 PRD: 微信小程序核心业务闭环（点餐 → 购物车 → 支付 → 订单状态）

Last Updated: 2026-06-08 19:45

## 大目标

打通小程序从 **用户浏览商品 → 分类筛选 → 添加购物车 → 管理地址 → 下单支付 → 查看订单状态** 的完整业务闭环，实现与 admin 后端的数据联动可验证。

## 🔴 当前真实状态（2026-06-08 19:45）

### 已修复（代码已落地但需重新编译）

| 修复项 | 文件 | 行 | 说明 |
|--------|------|-----|------|
| 后端 camelCase | `application.yml` | 74 | `map-underscore-to-camel-case: true` → `fruit_id` 映射到 `dishId` |
| 加购不响应 | `vendor.js` | 4485-4490 | 移除反转的条件判断 `!(openMoreNormPop && !flavorDataes.length)`，该条件永远为 true |
| 数量显示 null | `vendor.js` | 4427, 4440 | `dishListData.map()` 中初始化 `dishNumber: 0` |
| 地址无默认回退 | `vendor.js` | 22008-22015 | `getAddressList` 中当无默认地址时，用地址列表第一条填充 |
| 地址加载竞态 | `vendor.js` | 21869, 22003, 22037 | 新增 `addressListLoading` 标志，防止 `goAddress()` 在异步请求未完成时误判为空 |
| 导航修复 | `vendor.js` | 多处 | `redirectTo` → `navigateBack`，`goAddress` → `navigateTo` |

### 仍未解决的阻塞问题

| 问题 | 根因 | 影响 | 用户端表现 |
|------|------|------|------------|
| **DevTools 缓存** | WeChat DevTools 缓存了旧版 vendor.js | 所有前端改动 | 用户报告"还是没有看到改动" — 需手动清除缓存后重新编译 |
| **API 超时** | `WAServiceMainContext.js` 超时 | 加购物车 API 不响应 | 点击加号后无网络请求，或请求挂起 |
| **供应商接口不通** | `addShoppingCart` 调用不返回/网关路由不连通 | 购物车流程断裂 | 商品无法真正加入购物车 |
| **setOrderNum 竞态** | `getDishListDataes` 完成后调用 `setOrderNum`，但 `getTableOrderDishListes` 可能更晚返回 | 购物车数量初始化为 0 | 首次加载时购物车数量不更新 |
| **M3.1 分类过滤** | `getCategoryList()` 调用未传 type 参数 | 分类侧边栏不按类型过滤 | 套餐/热门可能显示相同内容 |
| **M3.2 条件判断** | `getDishListDataes` 中 `if (!(params.type === 1))` 反转 | 分类混肴 | 套餐显示 dish 列表，反之亦然 |

### 验证步骤（用户端）

1. **WeChat DevTools** → 工具 → 清除缓存 → 全部清除
2. **重新编译**: Cmd+B (macOS) / Ctrl+B (Windows)
3. **打开调试** → Network → 筛选 `shoppingCart/add` → 点击加号 → 看是否有网络请求发出
4. 如无请求 → 检查 `console` 面板是否有 JS 报错
5. 如有请求但 4xx/5xx → 检查后端 `pm2 logs lgg-business` 和网关日志

---

## 关键阶段与里程碑

### Phase 1: 导航与地址修复（S03-T01 + S03-T05）
**目标：修复所有页面导航异常，确保用户不会「卡死」在某个页面**

- [x] **M1.1** 地址新增/编辑/删除后能正确返回上一页（navigateBack）
- [x] **M1.2** 地址列表页后退能回到触发入口页（订单页/我的页）
- [x] **M1.3** 订单页后退能回到首页
- [x] **M1.4** 订单详情后退能回到历史订单列表
- [x] **M1.5** `uni.navigateTo` / `uni.redirectTo` / `uni.navigateBack` / `uni.switchTab` 使用规范全局统一

**验收标准：** 用户通过底部 tabBar 进入「订单」→ 点击地址管理 → 新增地址 → 保存后回到地址列表 → 后退回到订单页。全程无导航错误，不重建页面栈。

---

### Phase 2: 登录用户信息完善（S03-T02）
**目标：前端获取微信用户真实信息并提交后端持久化**

- [ ] **M2.1** `wx.getUserProfile` 返回的 nickName、avatarUrl、gender 取消注释，发送到后端
- [ ] **M2.2** MySQL `lgg_user` 表中验证 nick_name 和 avatar 字段已填充

**验收标准：** 新用户首次登录后，`SELECT nick_name, avatar FROM lgg_user WHERE openid = ?` 返回非空值。

---

### Phase 3: 分类侧边栏正确过滤（S03-T03）
**目标：套餐/热门/饮品分类正确显示各自商品**

- [ ] **M3.1** `getCategoryList()` 调用时传递 type 参数实现按类型过滤
- [ ] **M3.2** 修复 `getDishListDataes` 条件判断反转（type===1 → dish 列表，否则 setmeal 列表）
- [ ] **M3.3** 侧边栏切换分类后，右侧商品列表更新为对应类型数据

**验收标准：** 点击「套餐」侧边栏显示 setmeal 列表，点击「热门」显示 dish 列表，点击「饮品」显示 dish 列表。各分类不混肴。

---

### Phase 4: 购物车金额叠加（S03-T04）
**目标：多次添加同一商品时数量递增，总价计算正确**

- [ ] **M4.1** `addDishAction` 中 `number`/`amount`/`name`/`image` 字段取消注释
- [ ] **M4.2** 多次添加同一商品后，购物车显示数量递增而非新增行
- [ ] **M4.3** 总价 = Σ(单价 × 数量)，计算公式验证正确

**验收标准：** 添加 3 件同一商品，购物车显示 `数量: 3`，总价 = 单价 × 3。

---

### Phase 5: 后端联调与完整闭环（S03-T06）
**目标：端到端验证小程序 ↔ admin 后端数据一致性**

- [ ] **M5.1** admin 后台用户管理中出现小程序登录用户的 nick_name
- [ ] **M5.2** admin 后台订单管理中可见小程序端创建的订单，金额/明细一致
- [ ] **M5.3** mock 支付后，订单状态从「待支付」变为「已完成」
- [ ] **M5.4** 完整演示链路：浏览 → 加购 → 地址 → 下单 → 支付 → admin 可见

**验收标准（S03 终极目标）：**
1. 小程序完整操作流程无报错、无白屏、无导航异常
2. 所有业务数据在后端数据库和 admin 管理端可查询验证
3. 30 分钟内可完成一次完整演示

---

## 修订历史

| 日期 | 版本 | 变更描述 |
|------|------|----------|
| 2026-06-08 | v1 | 初始版本，基于 IDE Console 中观察到的 5 个业务 Bug 制定修复计划 |
| 2026-06-08 19:45 | v2 | 更新为诚实状态：列出已修复项和仍阻塞的问题。新增地址加载竞态修复 |
