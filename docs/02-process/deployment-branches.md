# Deployment Branch Strategy

项目保留两条部署路线，避免课程演示稳定性和容器化加分项互相干扰。

## main: 本地 PM2 现场演示路线

- 作为答辩和现场演示优先分支。
- 使用 `start-all-services.sh` 和 `ecosystem.config.cjs` 管理本地后端、前端等进程。
- 长运行服务统一交给 PM2，避免 loose `nohup ... &` 和僵尸进程。
- 不强依赖 Docker，降低现场机器环境不确定性。

## deploy/docker-compose: 容器化一键部署路线

- 作为课程报告中的高级部署与工程化扩展分支。
- 后续逐步加入 `docker-compose.yml`、服务 Dockerfile、Nacos、Redis、MySQL、RabbitMQ、MinIO、健康检查与日志卷。
- Compose 路线优先保证可读、可截图、可解释；不作为当前现场演示主路径。
- 所有真实密钥继续使用环境变量或 `.env.example` 占位，不提交真实凭证。

## Current Priority

当前优先级仍是 `main` 分支的本地 PM2 演示闭环。Docker Compose 分支用于后续加分项开发和报告截图补充。
