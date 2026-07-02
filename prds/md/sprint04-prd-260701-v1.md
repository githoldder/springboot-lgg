# Sprint 04 PRD: 管理端首页真实数据对接与商业可视化图表设计

Last Updated: 2026-07-01 23:18

## 大目标

将管理端前端首页的硬编码 Mock 数据完全替换为后端的真实运营统计接口数据，引入商业级 ECharts 动态图表（折线图、柱状图、饼图），并完成自动化部署与全链路测试验证。

---

## 关键阶段与里程碑

### Phase 1: PRD 与分析设计同步
- **M1.1** 在 `prds/md/` 和 `prds/json/` 分别输出 Sprint 04 的 Markdown 与 JSON PRD。
- **M1.2** 在 `issue.md` 中补充解答关于 OpenFeign、若依自带表、微信真实支付改造的相关疑惑。

### Phase 2: 管理端首页 ECharts 可视化与真实数据对接
- **M2.1** 首页卡片数据对接今日营业额、有效订单、新增会员和起售单品总数（对接 `WorkspaceController`）。
- **M2.2** 订单状态监测由静态占比改为真实数量与占比显示（对接 `overviewOrders`）。
- **M2.3** 引入 ECharts 绘制“最近7天营业额走势”折线图（对接 `turnoverStatistics`）。
- **M2.4** 引入 ECharts 绘制“热销商品 TOP 10”柱状图（对接 `top10`）。
- **M2.5** 引入 ECharts 绘制“订单分类占比”饼图（对接 `overviewOrders`）。
- **M2.6** 整合 ECharts 页面 resize 自适应钩子，防止缩放变形。

### Phase 3: 多进程守护托管 (PM2)
- **M3.1** 使用 `pm2 start ecosystem.config.cjs` 启动并托管全量微服务及前端进程。
- **M3.2** 验证 Redis、Nacos、Gateway、Business、Pay、Notice 及前端 preview 服务正常。

### Phase 4: 自动化烟雾测试与 E2E 验证
- **M4.1** 运行 Newman API 烟雾测试以验证数据统计及业务接口可通。
- **M4.2** 运行 Playwright 验证登录、下单、支付及 WebSocket 提醒的闭环正常。

---

## 修订历史

| 日期 | 版本 | 变更描述 |
|------|------|----------|
| 2026-07-01 | v1 | 初始版本，规划首页对接真实接口与 ECharts 可视化重構，并规划自动化测试验证 |
