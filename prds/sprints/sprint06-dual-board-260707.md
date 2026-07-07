# Sprint06 Dual Board Sync

Last Updated: 2026-07-07 18:05

Linked PRDs:
- `../md/sprint06-prd-260707-v1.md`
- `../json/sprint06-prd-260707-v1.json`

## Product Board

| ID | Item | Priority | Status |
|----|------|----------|--------|
| S06-PB-1 | 真实微信用户绑定到数据库用户 | P0 | completed (mock/dev openid + unique index; real appid pending) |
| S06-PB-2 | 用户下单、订单、地址、购物车数据可持久化 | P0 | completed |
| S06-PB-3 | 管理端首页 ECharts 展示真实业务数据 | P0 | completed (existing real APIs verified by unit/build) |
| S06-PB-4 | 答辩可解释数据项从哪里来、怎么回到界面 | P1 | completed |
| S06-PB-5 | 测试数据覆盖真实姓名、电话、地址、商品和金额 | P1 | completed |

## Engineering Board

| ID | Item | Priority | Status |
|----|------|----------|--------|
| S06-EB-1 | 修复订单详情页左上角返回兜底 | P0 | completed |
| S06-EB-2 | 接入真实微信 appid/secret 配置与环境隔离 | P0 | remaining (requires real WeChat credentials) |
| S06-EB-3 | token 本地持久化与启动恢复 | P0 | completed |
| S06-EB-4 | user/openid 唯一索引和 upsert 登录逻辑 | P0 | completed |
| S06-EB-5 | 管理端首页统计接口改为真实 MySQL 聚合 | P0 | completed (pre-existing real aggregation re-verified) |
| S06-EB-6 | ECharts 对接真实接口并增加空态/加载态 | P1 | completed (build verified) |
| S06-EB-7 | uv/Python 测试环境并注入真实用户订单样本 | P1 | completed (direct Python runner used; uv sandbox panic noted) |
| S06-EB-8 | 更新 issue.md 的答辩数据流与 SQL 追问索引 | P1 | completed |

## Sprint Entry Criteria

- Sprint05 安全与并发测试已通过。
- 真实用户订单测试样本已进入 `tests/`。
- `issue.md` 已补充答辩数据流、SQL 追问和下一 Sprint 方向。
- 小程序订单详情返回 bug 已完成第一处止血修复。

## Sprint Exit Criteria

- 同一微信 openid 多次登录只映射一个 MySQL 用户。
- 小程序重启后 token/userId 能恢复并查询历史订单。
- 管理端首页指标和 ECharts 均来自 MySQL 聚合 SQL。
- 3-5 个真实用户样本可通过测试工具注入，并能覆盖下单、支付、完成、统计同步。
- 答辩材料能解释字段存储、SQL 查询、后端封装、接口返回和前端渲染全链路。

## Verification Log

- `node --check mp-weixin/common/vendor.js`
- `mvn test -pl ruoyi-business -am` -> 24 tests passed
- `npm run build:prod` -> Vite production build passed
- `mvn package -DskipTests -pl ruoyi-business -am` -> business jar rebuilt
- `pm2 restart lgg-business` -> service online
- `python3 tests/real_user_order_cases.py` -> 5 real user order cases passed
