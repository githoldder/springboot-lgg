# Sprint 11 PRD: 多 Agent 运营助手雏形

Last Updated: 2026-07-17

## 大目标

在前序业务数据、推荐数据和 AI 工作流基础上，构建多 Agent 运营助手雏形。系统从“单点 AI 功能”升级为“可协作的运营辅助团队”，包括运营分析 Agent、客服 Agent、推荐策略 Agent。所有关键动作仍必须人工审批。

---

## Product Board

| ID | 用户价值 | 验收口径 | 优先级 |
|---|---|---|---|
| S11-PB-1 | 管理员获得每日经营建议 | 系统输出热销、滞销、补货、优惠建议 | P0 |
| S11-PB-2 | 客服问题可自动归类并给处理建议 | 售后/客服工单可被分类为退款、补发、投诉、咨询 | P0 |
| S11-PB-3 | 推荐策略可自动给出优化建议 | 根据点击/下单转化反馈调整推荐权重建议 | P1 |
| S11-PB-4 | 多 Agent 工作流可观测 | 每次 Agent 推理有输入、输出、调用链和人工确认记录 | P1 |

## Engineering Board

| ID | 工程任务 | 目标文件/模块 | 状态 | 优先级 |
|---|---|---|---|---|
| S11-EB-1 | 定义 Agent 角色与工具调用边界 | LangGraph workflow | planned | P0 |
| S11-EB-2 | 运营分析 Agent | 订单、商品、评价、会员数据 API | planned | P0 |
| S11-EB-3 | 客服 Agent | 售后、FAQ、评价回复 API | planned | P0 |
| S11-EB-4 | 推荐策略 Agent | 推荐日志、转化数据、商品数据 | planned | P1 |
| S11-EB-5 | Agent 执行日志与人工审批表 | `lgg_agent_run_log`、`lgg_agent_action_approval` | planned | P0 |
| S11-EB-6 | 管理端 Agent 控制台 MVP | `views/business/ai-ops` | planned | P1 |

---

## Decision Hierarchy

| Epic | Module | Feature | User Story | Task |
|---|---|---|---|---|
| Epic B | 多 Agent | 运营分析 Agent | 作为创业者，我希望系统主动给出补货和活动建议 | 定义订单/商品/会员查询工具；Agent 输出建议；管理员确认 |
| Epic B | 多 Agent | 客服 Agent | 作为管理员，我希望售后问题能自动分类并推荐处理方式 | 工单分类；建议退款/补发/拒绝理由；保留人工审批 |
| Epic B | 多 Agent | 推荐策略 Agent | 作为运营者，我希望推荐规则能基于效果持续优化 | 统计曝光、点击、加购、下单；输出权重调整建议 |
| Epic B | Agent 治理 | 执行日志与审批 | 作为系统负责人，我希望 AI 的每一步都可追踪 | 新增 Agent run log；记录工具调用；关键动作必须人工确认 |
| Epic B | Agent 控制台 | AI Ops 管理页 | 作为管理员，我希望集中查看 Agent 建议和审批记录 | 管理端 Agent 控制台；筛选、详情、审批、驳回 |

---

## 范围边界

- 多 Agent 只输出建议，不自动执行业务写操作。
- 自动退款、自动发券、自动改价、自动补货全部禁止。
- Agent 工具只能调用白名单 API。
- 每次 Agent 运行必须有 run log 和 action approval。
- 不做复杂 A/B 测试平台，只输出推荐权重调整建议。

## 验收标准

- 运营分析 Agent 可输出热销、滞销、补货、优惠建议。
- 客服 Agent 可给售后工单分类并生成处理建议。
- 推荐策略 Agent 可基于转化数据输出权重调整建议。
- 管理端可查看 Agent 运行记录和审批状态。
- 无人工确认时，Agent 不会改变订单、库存、价格、优惠券等核心数据。

## 修订历史

| 日期 | 版本 | 变更描述 |
|---|---|---|
| 2026-07-17 | v1 | 新增第二次迭代 Sprint11 PRD，聚焦多 Agent 运营助手雏形 |
