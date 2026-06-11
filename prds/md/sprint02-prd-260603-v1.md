# Sprint 02 PRD: Distributed Microservices Refactoring

Last Updated: 2026-06-06 10:45

## Objective

完成绿果果项目（springboot-lgg）的微服务架构改造，引入全套微服务治理与外围组件（Nacos, Gateway, Redis, MinIO, RabbitMQ），并通过 PM2 实现本地一键守护稳定演示。同时完成接口与前端端到端（E2E）测试覆盖，满足大作业高级要求。

## Key Results

- **S02-KR1**: 系统成功拆分为 `lgg-gateway`, `lgg-admin`, `lgg-business`, `lgg-pay`, `lgg-notice` 五个微服务，并在 Nacos 成功注册发现。
- **S02-KR2**: 完成 PM2 生态集成，能够通过 `pm2 start` 一键拉起 Nacos 及所有 Java/Vue 进程并守护。
- **S02-KR3**: `lgg-business` 发起支付 -> `lgg-pay` 模拟支付成功并使用 OpenFeign 调用 `lgg-business` 更新订单状态 -> `lgg-pay` 发送 RabbitMQ 消息 -> `lgg-notice` 消费并推送 WebSocket 提醒。
- **S02-KR4**: 静态资源（图片/附件）存储由本地/OSS 成功切换至 MinIO。
- **S02-KR5**: 输出 Apifox CLI / Newman 的接口测试报告及 Playwright 的 E2E 端到端演示截图。

---

## Tasks & Steps

### S02-T01: 搭建微服务基座与网关 (Status: success, KR: S02-KR1)
- **S02-T01-STEP01**: Integrate Nacos & Spring Cloud in root POM
- **S02-T01-STEP02**: Create `ruoyi-gateway` module
- **S02-T01-STEP03**: Add Actuator endpoints to core modules

### S02-T02: 本地 PM2 与 MinIO 整合 (Status: running, KR: S02-KR2, S02-KR4)
- **S02-T02-STEP01**: Configure PM2 ecosystem for middleware and services
- **S02-T02-STEP02**: Add MinIO Maven dependency and properties (in application.yml)
- **S02-T02-STEP03**: Implement MinIO Configuration and Client Utility
- **S02-T02-STEP04**: Refactor file upload controller to use MinIO with token validation

### S02-T03: 系统管理服务改造 (Status: success, KR: S02-KR1)
- **S02-T03-STEP01**: Configure `ruoyi-admin` to register in Nacos
- **S02-T03-STEP02**: Verify authentication endpoints route and work via Redis

### S02-T04: Vue3 前端路由与网关对接 (Status: running, KR: S02-KR1, S02-KR2)
- **S02-T04-STEP01**: Adjust frontend API proxy target to Gateway (8090)
- **S02-T04-STEP02**: Verify CAPTCHA and login request flows through Gateway

### S02-T05: 核心业务服务与 OpenFeign 基础 (Status: running, KR: S02-KR1, S02-KR3)
- **S02-T05-STEP01**: Configure `ruoyi-business` to register in Nacos
- **S02-T05-STEP02**: Verify core business APIs respond on port 8088
- **S02-T05-STEP03**: Add OpenFeign and LoadBalancer dependencies to business module

### S02-T06: 数据库表与关联校验 (Status: success, KR: S02-KR1)
- **S02-T06-STEP01**: Verify table prefixes and logical db isolation

### S02-T07: 创建支付微服务(ruoyi-pay) (Status: todo, KR: S02-KR1, S02-KR2, S02-KR3)
- **S02-T07-STEP01**: Create Maven module `ruoyi-pay`
- **S02-T07-STEP02**: Add `ruoyi-pay` to root POM modules
- **S02-T07-STEP03**: Configure port 8085 and Nacos registry in `ruoyi-pay`
- **S02-T07-STEP04**: Add Spring Boot Actuator & OpenFeign dependencies to `ruoyi-pay`
- **S02-T07-STEP05**: Define Mock Pay API and Pay Controller in `ruoyi-pay`
- **S02-T07-STEP06**: Configure RabbitMQ connection and exchange in `ruoyi-pay`
- **S02-T07-STEP07**: Implement RabbitMQ event publisher on pay success
- **S02-T07-STEP08**: Build `ruoyi-pay` Jar and add PM2 configuration
- **S02-T07-STEP09**: Verify Nacos registration and response of `lgg-pay`

### S02-T08: 创建通知与WebSocket微服务(ruoyi-notice) (Status: todo, KR: S02-KR1, S02-KR2, S02-KR3)
- **S02-T08-STEP01**: Create Maven module `ruoyi-notice`
- **S02-T08-STEP02**: Add `ruoyi-notice` to root POM modules
- **S02-T08-STEP03**: Configure port 8086 and Nacos registry in `ruoyi-notice`
- **S02-T08-STEP04**: Add Spring Boot Actuator & WebSocket dependencies to `ruoyi-notice`
- **S02-T08-STEP05**: Implement RabbitMQ queue consumer in `ruoyi-notice`
- **S02-T08-STEP06**: Configure WebSocket server endpoint in `ruoyi-notice` direct connection (8086)
- **S02-T08-STEP07**: Add WebSocket notification trigger on RabbitMQ event
- **S02-T08-STEP08**: Build `ruoyi-notice` Jar and add PM2 configuration
- **S02-T08-STEP09**: Verify Nacos registration and response of `lgg-notice`

### S02-T09: OpenFeign 跨服务接口集成与调用 (Status: todo, KR: S02-KR3)
- **S02-T09-STEP01**: Define OpenFeign client in `ruoyi-pay` calling `ruoyi-business` to update order status
- **S02-T09-STEP02**: Implement order payment status modification endpoint in `ruoyi-business`

### S02-T10: 自动化与端到端测试覆盖 (Status: todo, KR: S02-KR5)
- **S02-T10-STEP01**: Configure and run Newman/Apifox CLI API collection tests
- **S02-T10-STEP02**: Write Playwright E2E test scripts
- **S02-T10-STEP03**: Execute E2E suite and generate reports/screenshots

---

## Current Scope Boundary

- 保持数据库现状，逻辑隔离即可。
- RabbitMQ 服务由 `brew services` 管理。
- 全量依赖 PM2 进行本地 Java/Vue 进程守护。
- 直接跳过 Docker Compose。
- WebSocket 演示直连 `notice` 端口 8086。
