# Project Map

## Product Shape

GreenFruit, shown as `绿果果`, is a local course-demo fruit retail and delivery system based on RuoYi plus migrated Sky Take Out business logic.

The demo loop is:

1. Admin opens the RuoYi Vue3 management system.
2. Admin manages fruit categories, fruit items, fruit baskets, orders, and dashboard data.
3. WeChat mini program opens the GreenFruit shop.
4. User logs in with mock WeChat login, adds fruit items, submits an order, and triggers mock payment.
5. Backend updates order status and pushes a packaging reminder through WebSocket.

## Source Areas

| Path | Ownership |
| --- | --- |
| `ruoyi-vue-lgg-backend/` | Target RuoYi Spring Boot backend |
| `ruoyi-vue-lgg-backend/ruoyi-business/` | Migrated GreenFruit business module |
| `ruoyi-vue-lgg-frontend/` | Target RuoYi Vue3 admin frontend |
| `mp-weixin/` | WeChat mini program demo client |
| `project-sky-admin-vue-ts/` | Old Vue2 admin, migration reference only |
| `sky-take-out/` | Old Sky Take Out backend, migration reference only |
| `sql/` under backend | RuoYi and GreenFruit database initialization |
| `.agent/` | Agent rules and workflows |
| `prds/` | Ralph task control documents |
| `ecosystem.config.cjs` | PM2 process definitions |

## Current Architecture Boundary

- Use microservice architecture managed by local PM2:
  - `lgg-gateway` on `8090` (API Gateway)
  - `lgg-admin` on `8081` (System Admin)
  - `lgg-business` on `8088` (GreenFruit Core Business)
  - `lgg-pay` on `8085` (Mock Payment Processing)
  - `lgg-notice` on `8086` (WebSocket Notifications)
  - `lgg-ruoyi-frontend` on `8082` (Vite Admin Panel)
- Integrated local middleware: Nacos (8848), Redis (6379), MinIO (9000/9001), RabbitMQ (5672/15672).
- Do not use Docker or Docker-compose for service application layer; all run directly in local environment via PM2 daemon.

## Known Risk Areas

- Vue3 admin business pages are not fully migrated yet.
- Chinese text encoding is currently unreliable in some API responses.
- Legacy names such as `Dish`, `Setmeal`, `sky`, `itcast`, and `itheima` remain.
- Some mini program text and asset names still expose the original catering project.
- Business interfaces are mounted inside RuoYi but are not yet deeply integrated with RuoYi menu and permission conventions.
