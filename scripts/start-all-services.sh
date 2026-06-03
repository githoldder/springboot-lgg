#!/bin/bash

echo "=========================================="
echo "  绿果果水果零售配送系统 - 一键启动所有服务"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. 检查 MySQL
echo -e "${YELLOW}[1/5] 检查 MySQL...${NC}"
if mysql -u root -p123456 -e "SELECT 1" 2>/dev/null | grep -q "1"; then
    echo -e "${GREEN}✓ MySQL 已启动 (端口 3306)${NC}"
else
    echo -e "${RED}✗ MySQL 未启动，请先启动 MySQL${NC}"
    exit 1
fi
echo ""

# 2. 检查 Redis
echo -e "${YELLOW}[2/5] 检查 Redis...${NC}"
if redis-cli ping 2>/dev/null | grep -q "PONG"; then
    echo -e "${GREEN}✓ Redis 已启动 (端口 6379)${NC}"
else
    echo -e "${RED}✗ Redis 未启动，正在启动...${NC}"
    redis-server --daemonize yes
    sleep 2
    if redis-cli ping 2>/dev/null | grep -q "PONG"; then
        echo -e "${GREEN}✓ Redis 启动成功${NC}"
    else
        echo -e "${RED}✗ Redis 启动失败${NC}"
        exit 1
    fi
fi
echo ""

# 3. 检查 PM2
echo -e "${YELLOW}[3/5] 检查 PM2 进程管理器...${NC}"
if command -v pm2 >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PM2 已安装，将由 PM2 托管若依后端和前端${NC}"
else
    echo -e "${RED}✗ 未找到 PM2，请先安装 PM2 后再启动服务${NC}"
    exit 1
fi
echo ""

# 4. 启动若依新后端 (Spring Boot 8081)
echo -e "${YELLOW}[4/5] 启动/重启若依后端服务 (PM2: lgg-ruoyi-backend)...${NC}"
if [ ! -f "ruoyi-vue-lgg-backend/ruoyi-admin/target/ruoyi-admin.jar" ]; then
    echo -e "${RED}✗ 未找到后端 Jar，请先执行：cd ruoyi-vue-lgg-backend && mvn -DskipTests package${NC}"
    exit 1
fi
pm2 startOrRestart ecosystem.config.cjs --only lgg-ruoyi-backend --update-env
echo -e "${YELLOW}正在等待后端监听端口 8081...${NC}"
for i in {1..60}; do
    if lsof -i :8081 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ 若依后端启动成功！${NC}"
        break
    fi
    if [ $i -eq 60 ]; then
        echo -e "${RED}✗ 后端启动超时，请检查：pm2 logs lgg-ruoyi-backend --lines 80${NC}"
        exit 1
    fi
    sleep 1
    echo -n "."
done
echo ""
if curl --noproxy '*' -sS -m 5 http://127.0.0.1:8081/captchaImage >/dev/null 2>&1; then
    echo -e "${GREEN}✓ 后端健康探测通过${NC}"
else
    echo -e "${YELLOW}⚠ 后端端口已监听，但健康探测未通过，请检查日志${NC}"
fi
echo ""

# 5. 启动若依 Vue3 前端 (Vite 8082)
echo -e "${YELLOW}[5/5] 启动/重启若依 Vue3 前端 (PM2: lgg-ruoyi-frontend)...${NC}"
pm2 startOrRestart ecosystem.config.cjs --only lgg-ruoyi-frontend --update-env
echo -e "${YELLOW}正在等待前端监听端口 8082...${NC}"
for i in {1..30}; do
    if lsof -i :8082 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ 若依 Vue3 前端启动成功！${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ 前端启动超时，请检查：pm2 logs lgg-ruoyi-frontend --lines 80${NC}"
        exit 1
    fi
    sleep 1
    echo -n "."
done
echo ""
if curl --noproxy '*' -sS -m 5 http://127.0.0.1:8082/ >/dev/null 2>&1; then
    echo -e "${GREEN}✓ 前端健康探测通过${NC}"
else
    echo -e "${YELLOW}⚠ 前端端口已监听，但首页探测未通过，请检查日志${NC}"
fi
echo ""
pm2 list

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}      绿果果水果零售配送系统服务已就绪！${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo -e "📊 ${BLUE}服务状态及端口监听：${NC}"
echo -e "  ✓ ${GREEN}MySQL (数据库)${NC}  : 3306"
echo -e "  ✓ ${GREEN}Redis (缓存)${NC}    : 6379"
echo -e "  ✓ ${GREEN}若依后端(Java)${NC}  : 8081"
echo -e "  ✓ ${GREEN}若依前端(Vue3)${NC}  : 8082"
echo ""
echo -e "🌐 ${BLUE}演示与访问入口：${NC}"
echo -e "  1. ${YELLOW}绿果果后台管理端${NC}   : ${BLUE}http://localhost:8082${NC}"
echo -e "     默认账号          : ${GREEN}admin${NC}"
echo -e "     演示密码          : ${GREEN}请使用已加固演示密码${NC}"
echo -e "  2. ${YELLOW}绿果果微信小程序${NC}   : 请使用微信开发者工具打开 ${BLUE}mp-weixin${NC} 目录"
echo -e "     (已自动启用开发沙箱及微信模拟支付闭环流程)"
echo ""
echo -e "📝 ${BLUE}运行日志查看方式：${NC}"
echo -e "  后端日志 : ${BLUE}pm2 logs lgg-ruoyi-backend --lines 80${NC}"
echo -e "  前端日志 : ${BLUE}pm2 logs lgg-ruoyi-frontend --lines 80${NC}"
echo -e "  服务状态 : ${BLUE}pm2 list${NC}"
echo ""
