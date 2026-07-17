# Sprint 10 PRD: LangChain/LangGraph 业务辅助能力

Last Updated: 2026-07-17

## 大目标

在 Sprint09 的规则推荐、行为埋点和 AI 调用边界之上，引入 LangChain/LangGraph 风格的业务辅助工作流。AI 在本 Sprint 只输出“建议、草稿、摘要、润色”，所有对用户可见或影响业务状态的动作必须由用户或管理员确认。

---

## Product Board

| ID | 用户价值 | 验收口径 | 优先级 |
|---|---|---|---|
| S10-PB-1 | 用户评价可以被 AI 润色 | 用户输入短评后可生成更自然评价，用户确认后提交 | P0 |
| S10-PB-2 | 管理端客服能快速回复常见问题 | 售后/客服页可生成 FAQ 回复建议，管理员确认发送 | P0 |
| S10-PB-3 | 商品推荐理由更像人话 | 推荐接口可返回规则理由 + AI 润色理由，失败时回退规则理由 | P1 |
| S10-PB-4 | 管理员能看到日经营 AI 摘要 | 基于订单、销量、评价、售后生成今日运营摘要 | P1 |

## Engineering Board

| ID | 工程任务 | 目标文件/模块 | 状态 | 优先级 |
|---|---|---|---|---|
| S10-EB-1 | 引入独立 AI 编排服务或业务模块边界 | 可选 `ruoyi-ai` / `ruoyi-business.ai` | planned | P0 |
| S10-EB-2 | LangChain/LangGraph 工作流 PoC | AI 服务层，不侵入订单事务 | planned | P0 |
| S10-EB-3 | 评价润色接口 | `ReviewAiController`、`ReviewAiService` | planned | P0 |
| S10-EB-4 | 客服 FAQ 话术生成接口 | `CustomerServiceAiService`、售后页 | planned | P0 |
| S10-EB-5 | AI 调用日志、超时、失败降级 | `lgg_ai_call_log` | planned | P0 |
| S10-EB-6 | 管理端 AI 建议 UI | `views/business/aftersale`、`views/business/review` | planned | P1 |
| S10-EB-7 | 日经营摘要接口与展示 | `AiOpsService`、管理端首页或运营页 | planned | P1 |

---

## Decision Hierarchy

| Epic | Module | Feature | User Story | Task |
|---|---|---|---|---|
| Epic B | 评价 AI | AI 评价润色 | 作为用户，我想把简单评价润色得更自然 | 新增润色接口；用户确认后提交；保留原始文本和润色文本 |
| Epic B | AI 客服 | FAQ 回复建议 | 作为管理员，我希望系统根据问题生成回复草稿 | 接入售后/客服场景；生成建议话术；管理员确认后使用 |
| Epic B | AI 推荐文案 | 推荐理由润色 | 作为用户，我希望推荐理由更自然可信 | 规则理由传入 AI；生成短句；失败时回退规则理由 |
| Epic B | 运营摘要 | 日经营 AI 摘要 | 作为创业者，我希望每天快速知道卖得好/差和异常点 | 聚合订单、销量、评价、售后；生成摘要；管理端展示 |
| Epic B | AI 治理 | 调用日志与降级 | 作为系统负责人，我希望 AI 调用可追踪、可降级 | 新增调用日志；记录 provider、耗时、错误、fallback |

---

## 范围边界

- 不让 AI 自动回复用户，必须人工确认。
- 不让 AI 自动退款、改价、发券、改库存。
- 不做向量数据库和大规模 RAG 知识库。
- LangChain/LangGraph 先做单场景 PoC，不做复杂多 Agent。
- AI 失败必须不影响评论、售后、推荐等原业务流程。

## 验收标准

- 用户可点击生成评价润色，并确认后提交。
- 管理端售后/客服场景可生成回复草稿。
- 推荐理由可被 AI 润色，失败时回退规则理由。
- AI 调用日志记录请求类型、耗时、状态、失败原因。
- 日经营摘要能基于真实业务数据生成。

## 修订历史

| 日期 | 版本 | 变更描述 |
|---|---|---|
| 2026-07-17 | v1 | 新增第二次迭代 Sprint10 PRD，聚焦 LangChain/LangGraph 低风险业务辅助能力 |
