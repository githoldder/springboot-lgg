# Sprint10 Dual Board Sync

Last Updated: 2026-07-17

Linked PRDs:
- `../md/sprint10-prd-260717-v1.md`
- `../json/sprint10-prd-260717-v1.json`

## Product Board

| ID | Item | Priority | Status |
|---|---|---|---|
| S10-PB-1 | AI 评价润色 | P0 | planned |
| S10-PB-2 | FAQ 回复建议 | P0 | planned |
| S10-PB-3 | AI 推荐理由润色 | P1 | planned |
| S10-PB-4 | 日经营 AI 摘要 | P1 | planned |

## Engineering Board

| ID | Item | Priority | Status |
|---|---|---|---|
| S10-EB-1 | AI 编排服务或模块边界 | P0 | planned |
| S10-EB-2 | LangChain/LangGraph 工作流 PoC | P0 | planned |
| S10-EB-3 | 评价润色接口 | P0 | planned |
| S10-EB-4 | 客服 FAQ 话术生成接口 | P0 | planned |
| S10-EB-5 | AI 调用日志、超时、失败降级 | P0 | planned |
| S10-EB-6 | 管理端 AI 建议 UI | P1 | planned |
| S10-EB-7 | 日经营摘要接口与展示 | P1 | planned |

## Decision Hierarchy (Feature, User-Story, Task 拆分)

| Feature | User Story | Task |
|---|---|---|
| **F10-1: 声明式 AI 润色引擎** | 作为用户，我希望在评价商品时能一键“AI 润色”，将我简短无序的真实体验润色为条理清晰的优质好评，以增加互动乐趣。 | - 在 `ruoyi-common` 引入 **LangChain4j** 集成 SDK，配置对接大模型 API。<br>- 在 `ruoyi-business` 模块创建 `ReviewAiService`，设计润色 Prompt 模板。<br>- 后端开发 `/review/polish` 接口，接收原始短评，返回润色后的好评草稿，并交由小程序端确认后再提交。 |
| **F10-2: 客服 FAQ 与 RAG 退换货判定** | 作为商家客服，我希望在处理“漏送/坏果”等退款工单时，AI 能基于历史赔付文档和 FAQ 自动提供一份处理意见和回复草稿，以便我快速完成操作。 | - 在 PostgreSQL 数据库中开启 **Pgvector** 扩展，并建立赔付标准向量表。<br>- 实现 RAG（检索增强生成）流程：将售后申请文本嵌入（Embedding），检索匹配最佳赔付指南。<br>- 结合订单明细，生成处理草稿（如：“坏果比例约30%，建议退款9.6元，并向用户致歉：XXX”）。 |
| **F10-3: 推荐重排与理由润色 (LLM Rerank)** | 作为用户，我希望首页推荐返回的商品理由不再生硬（如硬编码的“热销品”），而是更富有个性化的推荐理由。 | - 编写 AI Reranker：将 S09 收集的用户画像与规则召回的商品清单作为 Prompt 传入 LLM。<br>- LLM 结合用户消费喜好进行重排，并输出自然润色理由（如：“该产品常在下午茶热卖，非常适合您的偏好”）。 |
| **F10-4: 每日经营数据 AI 智能分析** | 作为店长，我希望每天能在管理端看板看到一份由 AI 聚合昨日订单、销量、坏果售后率和评价的“日经营摘要”，帮我指出异常经营点。 | - 编写 `AiOpsService` 定时触发器。<br>- 聚合昨日财务数据、商品销售排行、投诉率，整理成 Structured JSON 传入大模型。<br>- 接收 AI 输出的经营摘要（含销售概况、库存预警与营销建议），渲染在前端 Dashboard 大屏。 |

## Sprint Exit Criteria

- AI 评价润色、客服草稿、推荐理由润色至少各有一个可演示闭环。
- AI 调用有日志、超时、失败降级。
- 关键业务动作仍由用户或管理员确认。
