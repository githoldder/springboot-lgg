# Sprint11 Dual Board Sync

Last Updated: 2026-07-17

Linked PRDs:
- `../md/sprint11-prd-260717-v1.md`
- `../json/sprint11-prd-260717-v1.json`

## Product Board

| ID | Item | Priority | Status |
|---|---|---|---|
| S11-PB-1 | 每日经营建议 | P0 | planned |
| S11-PB-2 | 客服问题分类与处理建议 | P0 | planned |
| S11-PB-3 | 推荐策略优化建议 | P1 | planned |
| S11-PB-4 | 多 Agent 工作流可观测 | P1 | planned |

## Engineering Board

| ID | Item | Priority | Status |
|---|---|---|---|
| S11-EB-1 | Agent 角色与工具调用边界 | P0 | planned |
| S11-EB-2 | 运营分析 Agent | P0 | planned |
| S11-EB-3 | 客服 Agent | P0 | planned |
| S11-EB-4 | 推荐策略 Agent | P1 | planned |
| S11-EB-5 | Agent 执行日志与人工审批表 | P0 | planned |
| S11-EB-6 | 管理端 Agent 控制台 MVP | P1 | planned |

## Decision Hierarchy (Feature, User-Story, Task 拆分)

| Feature | User Story | Task |
|---|---|---|
| **F11-1: LangGraph 多 Agent 协作编排** | 作为管理员，我希望系统内的多个 AI 角色（运营、客服、推荐）能通过一个中心化的协作网络共享订单和库存状态，主动协同为我提供经营优化的全套方案。 | - 编写基于 **LangGraph** (或 Dify Workflow) 的有向图多 Agent 编排引擎。<br>- 设计 Shared State 结构：统一维护订单状态、商品库存、当前营销活动状态。<br>- 定义 Tool Calling 接口范围，限制 Agent 的可执行写权限。 |
| **F11-2: 运营分析 Agent 与一键优惠券生成** | 作为店长，我希望运营 Agent 发现某款水果库存积压且销量低迷时，能自动在后台配置好一张促销优惠券草稿，并推送到我的界面让我“一键确认”发布。 | - 编写运营 Agent 工具集：读取单品库存预警和低周转率水果清单。<br>- Agent 评估滞销程度，调用 `CouponService` 构造一张满减券 Payload（设定金额和使用期限）。<br>- 写入 `lgg_agent_action_approval`（Agent 行为审批表）。<br>- 通过 WebSocket 将优惠券确认信息实时推送到 RuoYi 后端大屏和商家 App，管理员点击确认则修改 `lgg_coupon` 状态生效。 |
| **F11-3: 推荐策略 Agent 反馈控制** | 作为运营人员，我希望推荐 Agent 能分析用户的“曝光-点击-加购-下单”漏斗转化率，并自动微调商品的推荐权重，无需我手动修改。 | - 编写推荐策略 Agent，读取 S09 收集的 `lgg_user_behavior_log` 数据。<br>- 分析转化率异常（如高曝光低点击的水果），输出推荐权重 `recommend_weight` 调整建议草稿。<br>- 经管理员人工在 Agent 控制台审批同意后，执行数据库写操作更新。 |
| **F11-4: Agent 运行痕迹与可观测性控制台** | 作为技术负责人，我希望能在若依后台看到每次 Agent 运行的完整思考轨迹（Reasoning Path）、工具调用参数以及人工审批的历史记录，以便审计和优化。 | - 设计 `lgg_agent_run_log` 运行轨迹日志表。<br>- 在若依管理后台新建 `views/business/ai-ops` 菜单，作为 Agent 工作流控制台。<br>- 控制台能够可视化展示 Agent 状态、大模型 Prompt、Tool 返回值、以及审批列表。 |

## Sprint Exit Criteria

- 运营、客服、推荐策略三个 Agent 至少有建议输出闭环。
- Agent 运行记录、工具调用和审批状态可追踪。
- Agent 不会绕过人工确认修改核心业务数据。
