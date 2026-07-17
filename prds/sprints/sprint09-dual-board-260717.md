# Sprint09 Dual Board Sync

Last Updated: 2026-07-17

Linked PRDs:
- `../md/sprint09-prd-260717-v1.md`
- `../json/sprint09-prd-260717-v1.json`

## Product Board

| ID | Item | Priority | Status |
|---|---|---|---|
| S09-PB-1 | 首页瀑布流 | P0 | planned |
| S09-PB-2 | 推荐权重配置 | P0 | planned |
| S09-PB-3 | 推荐结果可解释 | P0 | planned |
| S09-PB-4 | AI 可用行为数据 | P0 | planned |
| S09-PB-5 | AI 接入边界 | P1 | planned |
| S09-PB-6 | 热销/滞销与补货提醒 | P1 | planned |

## Engineering Board

| ID | Item | Priority | Status |
|---|---|---|---|
| S09-EB-1 | 商品推荐字段 | P0 | planned |
| S09-EB-2 | 首页瀑布流接口 | P0 | planned |
| S09-EB-3 | 管理端商品推荐配置 | P0 | planned |
| S09-EB-4 | 用户行为轻量埋点 | P0 | planned |
| S09-EB-5 | 推荐理由字段与规则解释器 | P0 | planned |
| S09-EB-6 | AI 调用边界与 mock provider | P1 | planned |
| S09-EB-7 | 热销/滞销/库存预警报表 | P1 | planned |
| S09-EB-8 | 推荐接口测试与数据样本 | P0 | planned |

## Decision Hierarchy (Feature, User-Story, Task 拆分)

| Feature | User Story | Task |
|---|---|---|
| **F09-1: 规则推荐召回引擎** | 作为用户，我希望首页能根据我的历史购买倾向、活动商品和热销程度为我做出初步的水果生鲜推荐，从而提高浏览效率。 | - 在 `lgg_fruit` 表新增 `is_recommend`（推荐标记）、`recommend_weight`（权重值）。<br>- 新增 SQL 逻辑：优先过滤“高销量、库存充足、带活动标签”的水果。<br>- 编写 `RecommendService` 获取推荐商品候选池（Top 20）。 |
| **F09-2: 推荐理由可解释器** | 作为用户，我想明确知道每一项被推荐商品的原因（如“热销推荐”、“复购首选”），以提高对系统的信任感。 | - 编写基于规则的推荐原理解释器。<br>- 在推荐 VO 响应体中包装 `recommend_reason` 字段。<br>- 若为用户复购品，返回“您常买的同类”；若为高热度商品，返回“近期爆款热卖”。 |
| **F09-3: 行为埋点数据收集** | 作为运营管理员，我需要系统自动记录用户的“曝光-点击-加购-下单-评价”完整行为链条，以为后续 AI 精准推荐积累训练数据。 | - 创建用户行为日志表 `lgg_user_behavior_log`。<br>- 小程序端关键页面埋点：商品列表滑动触底（曝光）、点击详情（点击）、点击加入购物车（加购）。<br>- 后端 AOP 拦截器捕获接口请求，异步写入埋点表。 |
| **F09-4: 统一 AI 调用边界** | 作为系统架构师，我希望在接入 LangChain/LangGraph 之前定义好后端与 AI 服务的接口契约和失败兜底（Fallback）边界。 | - 在 `ruoyi-common` 模块抽象 `AiClient` 接口。<br>- 实现 `MockAiClient` 返回稳定测试字符串。<br>- 拦截大模型调用超时逻辑，发生 504 错误时，无缝降级回退为规则推荐，防止阻断小程序首页渲染。 |

## Sprint Exit Criteria

- 首页瀑布流可分页加载。
- 推荐结果有可解释理由。
- 至少 3 类行为事件可记录。
- AI mock provider 可降级，不影响推荐主链路。
