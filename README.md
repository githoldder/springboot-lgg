# C-G Fresh / 常工鲜生

> Spring Boot + Vue + 微信小程序的校园鲜果 O2O 运营系统。

常工鲜生是一个面向校园场景的生鲜零售系统原型，业务目标来自真实创业计划：用微信小程序承接学生端下单，用后台系统管理水果、果篮、订单、骑手、营业数据和实时来单提醒，服务“预售汇总、集中采购、校内配送、运营复盘”的闭环。

当前仓库基于 RuoYi-Vue / RuoYi 微服务体系改造，后端采用 Spring Boot 3 + Spring Cloud Alibaba，管理端采用 Vue 3 + Vite + Element Plus，小程序端保留为用户下单入口。项目既可作为校园鲜果 O2O 的 MVP 参考，也可作为 Spring Boot + Vue 微服务业务改造样例。

## 项目定位

- **业务场景**：校园鲜果、果切、果篮、饮品的在线浏览、加购、下单、模拟支付与配送履约。
- **运营模式**：围绕 C2F / 预售思路，先在小程序侧汇集需求，再由管理端完成商品、订单、配送、报表与采购辅助管理。
- **目标用户**：学生消费者、校园配送员、店铺/创业团队管理员。
- **当前阶段**：MVP / 演示系统。微信支付、微信登录、OSS 等外部能力使用 mock 或本地配置，适合本地演示与二次开发，不建议直接裸奔上生产。

## 功能特性

### 用户端小程序

- 微信登录降级 mock，便于无正式微信配置时本地调试。
- 水果分类、单品、果篮套餐、规格属性展示。
- 购物车加减、清空、订单确认、备注、地址管理。
- 下单、模拟支付、支付确认、历史订单、订单详情。
- 支持支付成功后触发后台来单提醒。

### 管理后台

- 基于 RuoYi 权限体系的后台登录、用户、角色、菜单、字典、日志、定时任务等基础能力。
- 水果分类、商品、果篮套餐、员工/骑手、店铺营业状态管理。
- 订单条件查询、接单、拒单、取消、派送、骑手分配、完成、打印与导出。
- 工作台营业额、订单概览、商品概览、用户与销量报表。
- 微服务监控入口与本地演示面板。

### 后端能力

- Spring Cloud Gateway 统一路由。
- Nacos 服务发现。
- Redis 缓存与会话支撑。
- MinIO 本地对象存储配置。
- WebSocket 实时来单通知。
- Mock Pay 支付服务与通知链路。
- MyBatis / MySQL 业务数据持久化。
- PRD、测试脚本、数据库迁移脚本随仓库维护。

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 后端 | Java 17, Spring Boot 3.2.5, Spring Cloud 2023, Spring Cloud Alibaba, MyBatis, PageHelper |
| 网关与注册 | Spring Cloud Gateway, Nacos |
| 数据与中间件 | MySQL, Redis, MinIO |
| 管理端前端 | Vue 3.4, Vite 5, Element Plus, Pinia, Vue Router, ECharts |
| 小程序端 | uni-app 编译产物 / 微信小程序 |
| 工程化 | Maven, PM2, Playwright, Apifox Collection |

## 仓库结构

```text
springboot-lgg
├── README.md
├── ecosystem.config.cjs                 # PM2 本地服务编排
├── mp-weixin                            # 微信小程序端
├── ruoyi-vue-lgg-backend                # Spring Boot / Spring Cloud 后端
│   ├── ruoyi-gateway                    # API 网关，端口 8090
│   ├── ruoyi-admin                      # RuoYi 系统管理服务，端口 8081
│   ├── ruoyi-business                   # 常工鲜生业务服务，端口 8088
│   ├── ruoyi-pay                        # Mock 支付服务，端口 8085
│   ├── ruoyi-notice                     # 通知服务，端口 8086
│   ├── ruoyi-common
│   ├── ruoyi-framework
│   ├── ruoyi-system
│   ├── ruoyi-quartz
│   ├── ruoyi-generator
│   └── sql                              # 初始化与迁移 SQL
├── ruoyi-vue-lgg-frontend               # Vue3 管理后台
├── prds                                 # Sprint PRD 与真实状态记录
├── tests                                # E2E、接口与真实用户订单测试脚本
└── docs                                 # 课程报告、演示材料与交付文档
```

## 核心业务模型

项目中的菜品模型已按水果业务语义改造，主要表位于 `ruoyi-vue-lgg-backend/sql/lgg_business_schema.sql`：

- `lgg_category`：水果、果切、果篮、饮品等分类。
- `lgg_fruit`：水果单品。
- `lgg_fruit_flavor`：规格、熟度、冰度、甜度等属性。
- `lgg_fruit_box` / `lgg_fruit_box_item`：果篮套餐与套餐明细。
- `lgg_shopping_cart`：用户购物车。
- `lgg_orders` / `lgg_order_detail`：订单主表与订单明细。
- `lgg_address_book`：宿舍/配送地址。
- `lgg_user`：C 端用户。

## 服务端口

| 服务 | 端口 | 说明 |
| --- | --- | --- |
| Gateway | `8090` | 统一 API 入口 |
| Admin | `8081` | RuoYi 系统管理服务 |
| Business | `8088` | 常工鲜生核心业务服务 |
| Pay | `8085` | Mock 支付服务 |
| Notice | `8086` | 通知服务 |
| Vue Preview | `8087` | 管理端本地预览 |
| Redis | `6380` | 本地 Redis |
| MinIO | `9020` / `9021` | API / Console |
| Nacos | `8848` | 服务注册发现 |

Gateway 路由配置位于 `ruoyi-vue-lgg-backend/ruoyi-gateway/src/main/resources/application.yml`，当前主要路径包括 `/admin/**`、`/user/**`、`/notify/**`、`/ws/**`、`/pay/**`、`/notice/**`。

## 快速开始

### 环境要求

- JDK 17
- Maven 3.8+
- Node.js 18+ 与 npm / pnpm
- MySQL 8+
- Redis、Nacos、MinIO（可通过仓库内 PM2 编排启动本地实例）
- PM2（可选，用于一键启动本地演示环境）

### 1. 初始化数据库

创建数据库后导入 RuoYi 基础表和常工鲜生业务表：

```bash
mysql -uroot -p -e "CREATE DATABASE IF NOT EXISTS lgg_ruoyi DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -uroot -p lgg_ruoyi < ruoyi-vue-lgg-backend/sql/ry_20260417.sql
mysql -uroot -p lgg_ruoyi < ruoyi-vue-lgg-backend/sql/lgg_business_schema.sql
mysql -uroot -p lgg_ruoyi < ruoyi-vue-lgg-backend/sql/lgg_business_menu.sql
```

如需演示数据，可继续查看并导入 `ruoyi-vue-lgg-backend/sql/lgg_seed_fruit_staff.sql` 及后续 Sprint 迁移脚本。

### 2. 构建后端

```bash
cd ruoyi-vue-lgg-backend
mvn package -DskipTests
```

日常只构建业务模块时可使用：

```bash
mvn package -DskipTests -pl ruoyi-business -am
```

### 3. 构建管理端

```bash
cd ruoyi-vue-lgg-frontend
npm install
npm run build:prod
```

开发模式：

```bash
npm run dev
```

### 4. 启动本地演示环境

仓库提供 PM2 编排文件，可统一启动 Redis、MinIO、Nacos、后端服务与管理端预览：

```bash
pm2 start ecosystem.config.cjs
pm2 status
```

访问入口：

- 管理后台预览：`http://127.0.0.1:8087`
- API 网关：`http://127.0.0.1:8090`
- MinIO 控制台：`http://127.0.0.1:9021`
- Nacos 控制台：`http://127.0.0.1:8848`

## 小程序运行

小程序代码位于 `mp-weixin`。使用微信开发者工具导入该目录，必要时清除 DevTools 缓存并重新编译。

本地演示时，小程序默认通过网关访问后端接口。若出现请求超时，请先检查：

- `lgg-gateway`、`lgg-business`、`lgg-pay`、`lgg-notice` 是否已注册到 Nacos。
- 小程序请求域名与端口是否指向 `127.0.0.1:8090` 或本机可访问地址。
- 微信开发者工具是否开启“不校验合法域名”等本地调试选项。

## 测试与验证

仓库包含多种验证材料：

- `tests/apifox-collection.json`：接口集合。
- `tests/playwright-e2e.spec.ts`：管理端浏览器 E2E。
- `tests/e2e_test.py`、`tests/real_user_order_cases.py`：订单链路与真实用户场景测试脚本。
- `prds/md` 与 `prds/json`：每个 Sprint 的需求、修复项、阻塞项与验收记录。

常用验证命令示例：

```bash
npm install
npx playwright test tests/playwright-e2e.spec.ts
python3 tests/real_user_order_cases.py
```

具体脚本依赖当前本地服务、数据库数据和端口状态，运行前请先确认 PM2 服务全部在线。

## 当前实现状态

已跑通的主链路：

```text
用户浏览商品 -> 加入购物车 -> 选择地址 -> 提交订单
-> Mock 支付 -> 支付确认 -> 后台接单
-> 派送/完成 -> 用户端历史订单与后台工作台同步更新
```

已实现或重点修复过的能力：

- 商品、分类、果篮、购物车、订单、地址、用户登录等核心接口。
- 订单状态流与支付状态流。
- Mock 支付成功通知与 WebSocket 来单提醒。
- 管理端订单处理、营业统计、销量报表。
- 小程序地址回填、购物车数量、订单金额、支付页等关键问题修复。

仍需继续产品化的方向：

- 正式微信登录、微信支付、退款与证书配置。
- 采购汇总、楼栋分拣单、骑手扫码核销。
- 库存扣减、损耗统计、预售截单和补货建议。
- 企业微信/私域客服、会员、促销与复购触达。
- 外部对象存储与生产级部署配置。

## 开源说明

本项目脱胎于课程实训和创业 MVP 验证，仓库保留了部分报告、PRD、演示脚本与 Sprint 记录，便于追踪需求演进和问题修复过程。公开使用时建议重点参考：

- Spring Boot + Vue 的微服务改造方式。
- 生鲜 O2O 订单履约模型。
- 小程序、管理后台、网关、业务服务的联调结构。
- PRD 与代码同步演进的项目管理方式。

请在二次开发前检查配置文件中的 mock key、示例地址、演示账号和本地端口，并替换为自己的安全配置。

## License

前端与基础后台继承 RuoYi 生态的 MIT License；本仓库新增业务代码与文档按仓库实际许可约束使用。
