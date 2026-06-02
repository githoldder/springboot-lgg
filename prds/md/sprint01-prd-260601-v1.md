# Sprint 01 PRD: GreenFruit Demo Stabilization

Last Updated: 2026-06-02 08:51

## Objective

Make the GreenFruit course project credible and locally demo-ready on the RuoYi Vue3 and Spring Boot stack, while keeping scope small and avoiding Docker or microservice expansion.

## Key Results

- KR1: Services are managed by PM2 and can be started repeatedly without unmanaged zombie processes.
- KR2: RuoYi Vue3 admin shows GreenFruit business pages instead of only stock RuoYi system pages.
- KR3: Mini program core flow can open shop, login, view fruit categories, submit order, and trigger mock payment without visible legacy catering text.
- KR4: Source-visible legacy traces are reduced enough for a normal course-code review.
- KR5: Demo secrets are removed or converted to placeholders.

## Tasks

- S01-T01: Establish local agent rules and PM2 process governance.
- S01-T02: Fix API encoding and shop status initialization blockers. [Done]
- S01-T03: Add GreenFruit menus and minimal Vue3 business pages to RuoYi admin. [Done]
  - S01-T03-STEP01: Add admin API clients. [Done]
  - S01-T03-STEP02: Add minimal business views and routes. [Done]
  - S01-T03-STEP03: Fix persisted menu encoding and reproducible menu SQL. [Done]
  - S01-T03-STEP04: Replace stock home page with GreenFruit operations dashboard and clean default RuoYi entry links. [Done]
  - S01-T03-STEP05: Repair full database mojibake across RuoYi initialization tables. [Done]
- S01-T04: Clean visible mini program legacy text and project identity. [Done]
- S01-T05: Remove or mask secrets and high-risk `itcast/itheima/sky` traces. [Done]

## Current Scope Boundary

Do not add Docker, Nacos, Gateway, distributed transactions, or microservice splitting in this sprint.

The old Vue2 admin remains as a reference only. It is not the target architecture.
