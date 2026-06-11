import re

# Read files
with open('docs/02-process/document/latex/分布式/data/chap03.tex', 'r', encoding='utf-8') as f:
    chap03 = f.read()

with open('docs/02-process/document/latex/分布式/data/chap04.tex', 'r', encoding='utf-8') as f:
    chap04 = f.read()

with open('docs/02-process/document/latex/分布式/data/chap05.tex', 'r', encoding='utf-8') as f:
    chap05 = f.read()

# Define blocks
U01 = r'''\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.9\textwidth]{figures-pdf/系统总体架构图.pdf}
  \caption{系统架构图}
  \label{fig:U01}
\end{figure}
'''
U05 = r'''\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.9\textwidth]{figures-pdf/用例图.pdf}
  \caption{系统核心用例图}
  \label{fig:U05}
\end{figure}
'''
U04 = r'''\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.9\textwidth]{figures-pdf/微服务模块依赖结构图.pdf}
  \caption{微服务模块依赖结构图}
  \label{fig:U04}
\end{figure}
'''
U07 = r'''\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.9\textwidth]{figures-pdf/U07-database-er.pdf}
  \caption{核心业务数据库实体关系图}
  \label{fig:U07}
\end{figure}
'''
U06 = r'''\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.9\textwidth]{figures-pdf/U06-shopping-activity.pdf}
  \caption{用户购物与支付状态流转活动图}
  \label{fig:U06}
\end{figure}
'''
U02 = r'''\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.9\textwidth]{figures-pdf/支付成功与包装提醒时序图.pdf}
  \caption{订单模拟支付与状态更新时序图}
  \label{fig:U02}
\end{figure}
'''
U03 = r'''\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.9\textwidth]{figures-pdf/订单状态流转图.pdf}
  \caption{订单状态流转与消息通知流程图}
  \label{fig:U03}
\end{figure}
'''
S01 = r'''\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.9\textwidth]{figures/S01-pm2-status-real.png}
  \caption{PM2服务运行状态}
  \label{fig:S01}
\end{figure}
'''
S02 = r'''\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.9\textwidth]{figures/S02-nacos-services-real.png}
  \caption{Nacos服务注册中心}
  \label{fig:S02}
\end{figure}
'''
S03 = r'''\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.9\textwidth]{figures/S03-gateway-route-real.png}
  \caption{Gateway接口动态路由转发}
  \label{fig:S03}
\end{figure}
'''
S04 = r'''\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.9\textwidth]{figures/S04-feign-call-real.png}
  \caption{OpenFeign跨服务远程状态调用}
  \label{fig:S04}
\end{figure}
'''
S05 = r'''\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.9\textwidth]{figures/S05-rabbitmq-bindings-real.png}
  \caption{RabbitMQ消息事件队列绑定}
  \label{fig:S05}
\end{figure}
'''
S06 = r'''\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.9\textwidth]{figures/S06-websocket-frames-real.png}
  \caption{WebSocket后台实时提醒推送}
  \label{fig:S06}
\end{figure}
'''
S07 = r'''\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.9\textwidth]{figures-pdf/S07-mp-checkout.pdf}
  \caption{微信小程序商品结算UI}
  \label{fig:S07}
\end{figure}
'''
S08 = r'''\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.9\textwidth]{figures/S08-mock-pay-success-real.png}
  \caption{生鲜模拟支付成功界面}
  \label{fig:S08}
\end{figure}
'''
S09 = r'''\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.9\textwidth]{figures/S09-admin-notification-real.png}
  \caption{后台订单即时提醒卡片UI}
  \label{fig:S09}
\end{figure}
'''
S10 = r'''\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.9\textwidth]{figures/S10-dashboard-real.png}
  \caption{核心运营多维统计图表}
  \label{fig:S10}
\end{figure}
'''
S11 = r'''\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.9\textwidth]{figures/S11-newman-cli-real.png}
  \caption{Newman微服务接口测试报告}
  \label{fig:S11}
\end{figure}
'''
S12 = r'''\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.9\textwidth]{figures/S12-playwright-cli-real.png}
  \caption{Playwright端到端闭环测试结果}
  \label{fig:S12}
\end{figure}
'''
S14 = r'''\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.9\textwidth]{figures-pdf/S14-mp-order-detail.pdf}
  \caption{微信小程序订单详情UI}
  \label{fig:S14}
\end{figure}
'''
S15 = r'''\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.9\textwidth]{figures-pdf/S15-mp-order-list.pdf}
  \caption{微信小程序订单列表UI}
  \label{fig:S15}
\end{figure}
'''

table3_1 = r'''
\begin{table}[htbp]
  \centering
  \caption{微服务核心组件与职责表}
  \label{tab:service_components}
  \begin{tabular}{llll}
    \toprule
    微服务名称 & 监听端口 & 核心依赖 & 核心职责 \\
    \midrule
    lgg-admin & 8080 & MySQL, Redis & 登录鉴权、系统配置、角色权限过滤 \\
    lgg-business & 8088 & MySQL, Redis, MinIO & 分类与商品管理、购物车、订单状态更新 \\
    lgg-pay & 8085 & OpenFeign, RabbitMQ & 模拟微信扣款、触发业务回调、投递事件 \\
    lgg-notice & 8086 & RabbitMQ, WebSocket & 消费支付成功事件、推送网页端弹窗提醒 \\
    lgg-gateway & 8090 & Nacos & 全平台统一入口、跨域处理、动态路由分发 \\
    \bottomrule
  \end{tabular}
\end{table}
'''

table3_2 = r'''
\begin{table}[htbp]
  \centering
  \caption{核心数据库表与索引设计表}
  \label{tab:database_tables}
  \begin{tabular}{llll}
    \toprule
    表名 & 功能说明 & 核心索引列 & 索引类型 \\
    \midrule
    lgg\_category & 存储水果分类信息 & category\_name & 唯一索引 \\
    lgg\_fruit & 存储水果单品与图片 & fruit\_name & 全文索引 \\
    lgg\_order & 存储用户支付订单流转 & order\_no & 唯一索引 \\
    lgg\_order\_detail & 订单下挂载的水果明细 & order\_id & 普通索引 \\
    \bottomrule
  \end{tabular}
\end{table}
'''

table4_1 = r'''
\begin{table}[htbp]
  \centering
  \caption{订单生命周期状态流转表}
  \label{tab:order_status}
  \begin{tabular}{lll}
    \toprule
    状态值 & 状态名称 & 触发条件与流转限制 \\
    \midrule
    0 & 待付款 & 用户提交结算确认单，默认初始状态 \\
    1 & 已支付待接单 & 用户完成模拟微信扣款，由 Feign 远程调用更新 \\
    2 & 已接单处理中 & 运营人员在后台确认为有效订单并分配处理 \\
    3 & 已包装待配送 & 仓库人员完成货品打包并录入物流单号 \\
    4 & 配送中 & 快递系统回调或手动变更为发货状态 \\
    5 & 已完成 & 用户在小程序端点击确认收货或系统超时自动确认 \\
    \bottomrule
  \end{tabular}
\end{table}
'''

table5_1 = r'''
\begin{table}[htbp]
  \centering
  \caption{核心接口自动化回归测试用例表}
  \label{tab:api_tests}
  \begin{tabular}{llll}
    \toprule
    接口名称 & 请求路径 & 验证目标 & 核心断言规则 \\
    \midrule
    拉取验证码 & /captchaImage & 网关外部入口连通性 & 状态码 200，包含 captchaEnabled \\
    管理员登录 & /login & 认证拦截与令牌颁发 & 业务 code=200，返回有效 token \\
    分类列表查询 & /admin/category/list & 业务服务与缓存读取 & data 数组非空，响应耗时 <2s \\
    订单分页查询 & /admin/order/conditionSearch & 分页结构与跨服务查询 & data.records 非空，格式符合标准 \\
    \bottomrule
  \end{tabular}
\end{table}
'''

health_text = r'''
在微服务架构中，由于各个服务分布在不同的进程与端口中，统一的健康监控面板对于系统运维至关重要。如上图 \ref{fig:health} 所示，系统实现了一个全局微服务健康看板，用于对核心服务及其基础依赖的存活状态进行实时遥测。该看板主要分为三个维度的检测：

首先是微服务实例本身的状态监测（图左侧 5/5 在线）。各个微服务集成了 `spring-boot-starter-actuator` 运行时监控组件，并通过 `management.endpoints.web.exposure.include=health` 将健康端点开放给外部。监控大屏通过 Gateway 网关依次调用 `lgg-admin`、`lgg-gateway`、`lgg-business`、`lgg-pay` 和 `lgg-notice` 的 `/actuator/health` 接口，并解析其返回的 `{"status":"UP"}` 数据，展示当前延迟（通常在 6ms~24ms 之间），确保微服务进程自身能够正常响应 HTTP 请求。

其次是基础中间件依赖的连通性监控（图中部 3/3 正常）。在分布式环境中，即使微服务进程正常运行，如果底层的数据库或消息队列中断，业务同样会瘫痪。由于各微服务内部配置了 Redis、RabbitMQ 和 Nacos 的连接，Actuator 会利用内置的 `RedisHealthIndicator`、`RabbitHealthIndicator` 自动发送 PING 心跳指令并捕获 PONG 回复。监控面板汇总这些信息，直观地证明了从应用到中间件的 TCP 长连接处于健康可用状态。

最后是网关路由与直连测试的比对（图右侧 2/2 正常）。面板对同一个核心业务端点 `/user/shop/status` 发起了两次并行探测，一次通过 `http://127.0.0.1:8090/...` 走网关转发，另一次通过 `http://127.0.0.1:8088/...` 绕过网关直连。通过比对两者的返回信息（`{"code":1,"data":1}`）与延迟差距，可以验证 Gateway 的动态路由功能工作正常且未引入过高的性能损耗。
'''

# 1. Clean up chap03
chap03_clean = chap03.replace(U01, "").replace(U05, "").replace(U04, "").replace(U07, "").replace(S01, "").replace(S02, "").replace(S03, "")

# Distribute into chap03
# 3.1
c3_1 = chap03_clean.split(r'\section{非功能需求}')[0]
c3_1 = c3_1.replace("对于管理后台而言", "\n" + U06 + "\n对于管理后台而言")
c3_1 = c3_1.replace("在微信小程序端", "\n" + U03 + "\n在微信小程序端")
c3_1 = c3_1.replace("在微服务间协作方面", "\n" + U02 + "\n在微服务间协作方面")
chap03_clean = c3_1 + r'\section{非功能需求}' + chap03_clean.split(r'\section{非功能需求}')[1]

# 3.3
c3_3 = chap03_clean.split(r'\section{服务模块设计}')[0]
c3_3 = c3_3.replace("系统采用前后端分离与轻量微服务架构。", "\n" + U01 + "\n系统采用前后端分离与轻量微服务架构。")
c3_3 = c3_3 + "\n" + U05 + "\n"
chap03_clean = c3_3 + r'\section{服务模块设计}' + chap03_clean.split(r'\section{服务模块设计}')[1]

# 3.4
c3_4 = chap03_clean.split(r'\section{数据库设计}')[0]
c3_4 = c3_4.replace("系统的分布式后端在物理和逻辑上被拆分为", "\n" + U04 + "\n系统的分布式后端在物理和逻辑上被拆分为")
c3_4 = c3_4 + "\n" + table3_1 + "\n"
chap03_clean = c3_4 + r'\section{数据库设计}' + chap03_clean.split(r'\section{数据库设计}')[1]

# 3.5
chap03_clean = chap03_clean.replace("系统在数据持久层设计上，为了兼顾大作业演示", "\n" + U07 + "\n系统在数据持久层设计上，为了兼顾大作业演示")
chap03_clean = chap03_clean.replace("订单明细表 lgg\_order\_detail", "\n" + table3_2 + "\n订单明细表 lgg\_order\_detail")

with open('docs/02-process/document/latex/分布式/data/chap03.tex', 'w', encoding='utf-8') as f:
    f.write(chap03_clean)


# 2. Clean up chap04
chap04_clean = chap04.replace(S10, "").replace(U06, "").replace(U02, "").replace(S07, "").replace(S15, "").replace(S14, "").replace(S08, "").replace(S04, "").replace(U03, "").replace(S05, "").replace(S06, "").replace(S09, "")

# Distribute into chap04
# 4.1
c4_1 = chap04_clean.split(r'\section{水果分类、品种管理与 AOP 自动填充实现}')[0]
c4_1 = c4_1.replace("生鲜后台管理界面全面继承并改造了若依的管理界面。", "\n" + S10 + "\n生鲜后台管理界面全面继承并改造了若依的管理界面。")
c4_1 = c4_1.replace("大屏中部嵌入了两个基于百度开源", "\n" + S03 + "\n大屏中部嵌入了两个基于百度开源") # Gateway route fits somewhere here or end of 4.1
chap04_clean = c4_1 + r'\section{水果分类、品种管理与 AOP 自动填充实现}' + chap04_clean.split(r'\section{水果分类、品种管理与 AOP 自动填充实现}')[1]

# 4.3
c4_3 = chap04_clean.split(r'\section{WebSocket 消息广播与 RabbitMQ 解耦实现}')[0]
c4_3 = c4_3.replace("用户在小程序端结算商品并确认收货信息后提交订单，", "\n" + S07 + "\n用户在小程序端结算商品并确认收货信息后提交订单，")
c4_3 = c4_3.replace("为了保证支付系统的安全隔离与职责分离，项目专门解耦并设立", "\n" + table4_1 + "\n\n" + S14 + "\n为了保证支付系统的安全隔离与职责分离，项目专门解耦并设立")
c4_3 = c4_3.replace("在模拟支付回调阶段，系统对 OpenFeign", "\n" + S08 + "\n在模拟支付回调阶段，系统对 OpenFeign")
c4_3 = c4_3.replace("上述截图 S07 展示了微信小程序端的商品结算页面", "\n" + S15 + "\n\n" + S04 + "\n上述截图 S07 展示了微信小程序端的商品结算页面")
chap04_clean = c4_3 + r'\section{WebSocket 消息广播与 RabbitMQ 解耦实现}' + chap04_clean.split(r'\section{WebSocket 消息广播与 RabbitMQ 解耦实现}')[1]

# 4.4
c4_4 = chap04_clean.split(r'\section{本地 PM2 长运行进程托管实现}')[0]
c4_4 = c4_4.replace("通知服务 lgg-notice 中的消费者监听类采用了 RabbitListener", "\n" + S05 + "\n通知服务 lgg-notice 中的消费者监听类采用了 RabbitListener")
c4_4 = c4_4.replace("当消费者监听方法成功接收并反序列化消息后", "\n" + S06 + "\n当消费者监听方法成功接收并反序列化消息后")
c4_4 = c4_4.replace("在前端管理界面中，Vue3 组件在 onMounted 生命周期钩子中", "\n" + S09 + "\n在前端管理界面中，Vue3 组件在 onMounted 生命周期钩子中")
chap04_clean = c4_4 + r'\section{本地 PM2 长运行进程托管实现}' + chap04_clean.split(r'\section{本地 PM2 长运行进程托管实现}')[1]

# 4.5
chap04_clean = chap04_clean.replace("对于各个 Java 微服务，配置项中的 name 字段设置了语义化的进程标识名称", "\n" + S01 + "\n对于各个 Java 微服务，配置项中的 name 字段设置了语义化的进程标识名称")

with open('docs/02-process/document/latex/分布式/data/chap04.tex', 'w', encoding='utf-8') as f:
    f.write(chap04_clean)


# 3. Clean up chap05
chap05_clean = chap05.replace(S11, "").replace(S12, "")

# Distribute into chap05
# 5.1
c5_1 = chap05_clean.split(r'\section{Playwright 核心闭环端到端（E2E）测试}')[0]
c5_1 = c5_1.replace("为确保微服务对外提供的 RESTful 接口具备基本的鲁棒性与一致性", "\n" + S11 + "\n为确保微服务对外提供的 RESTful 接口具备基本的鲁棒性与一致性")
c5_1 = c5_1.replace("测试集中每个请求的 Tests 脚本标签页内编写了多维度的", "\n" + table5_1 + "\n测试集中每个请求的 Tests 脚本标签页内编写了多维度的")
chap05_clean = c5_1 + r'\section{Playwright 核心闭环端到端（E2E）测试}' + chap05_clean.split(r'\section{Playwright 核心闭环端到端（E2E）测试}')[1]

# 5.2
c5_2 = chap05_clean.split(r'\section{健康检查与微服务治理监控}')[0]
c5_2 = c5_2.replace("针对复杂的微服务协同场景，传统的接口测试难以覆盖跨服务的数据流转完整性", "\n" + S12 + "\n针对复杂的微服务协同场景，传统的接口测试难以覆盖跨服务的数据流转完整性")
chap05_clean = c5_2 + r'\section{健康检查与微服务治理监控}' + chap05_clean.split(r'\section{健康检查与微服务治理监控}')[1]

# 5.3
S_health = r'''\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.9\textwidth]{figures/S06-health-dashboard.png}
  \caption{微服务健康监控与全局看板}
  \label{fig:health}
\end{figure}
'''
# Copy the health image over and rename it
import os
os.system('cp "/Users/caolei/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Obsidian_root/00-Projects/011_项目经验/springboot-lgg/附件/微服务health总览.png" docs/02-process/document/latex/分布式/figures/S06-health-dashboard.png')

c5_3 = chap05_clean.split(r'\section{健康检查与微服务治理监控}')[1]
c5_3 = "\n" + S02 + "\n" + S_health + "\n" + health_text + "\n" + c5_3

chap05_clean = chap05_clean.split(r'\section{健康检查与微服务治理监控}')[0] + r'\section{微服务健康监控与全局看板}' + c5_3

with open('docs/02-process/document/latex/分布式/data/chap05.tex', 'w', encoding='utf-8') as f:
    f.write(chap05_clean)

