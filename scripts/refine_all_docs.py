import os
import json
import subprocess
import re

def run_cmd(cmd):
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise Exception(f"Command failed: {' '.join(cmd)}\n{res.stderr}")
    return res.stdout

def clean_tex(tex_content):
    lines = [l.split('%')[0].strip() for l in tex_content.split('\n')]
    tex = '\n'.join(lines)
    tex = re.sub(r'\\(chapter|section|subsection|subsubsection)\*?\{([^}]+)\}', r'\2', tex)
    tex = re.sub(r'\\(textbf|textit|emph|cite|ref)\{([^}]+)\}', r'\2', tex)
    tex = tex.replace(r'\%', '%').replace(r'\_', '_').replace(r'\&', '&')
    tex = re.sub(r'\\[a-zA-Z]+', '', tex)
    paragraphs = [p.strip() for p in tex.split('\n\n') if p.strip()]
    return '\n\n'.join(paragraphs)

def inject_cell_with_title(doc_path, cell_path, title_text, body_text, batch_cmds, indent="24pt"):
    out = run_cmd(["officecli", "get", doc_path, cell_path, "--json"])
    data = json.loads(out)
    orig_count = data['data']['results'][0]['childCount'] if data.get('success') and data['data']['results'] else 1

    lines = [line.strip() for line in body_text.split('\n') if line.strip()]

    # p[1] 保持标题
    batch_cmds.append({"command": "set", "path": f"{cell_path}/p[1]", "props": {"text": title_text}})

    # p[2...] 注入正文
    for i, line in enumerate(lines, start=2):
        batch_cmds.append({
            "command": "add",
            "parent": cell_path,
            "type": "paragraph",
            "props": {
                "text": line,
                "firstLineIndent": indent,
                "font.ea": "宋体",
                "font.latin": "Times New Roman",
                "size": "12pt"
            }
        })

    # 清理多余的历史遗留段落
    total_p = orig_count + len(lines)
    keep_p = len(lines) + 1
    for i in range(total_p, keep_p, -1):
        batch_cmds.append({"command": "remove", "path": f"{cell_path}/p[{i}]"})

def refine_doc5(doc_path):
    print("=== 丰满扩展 5-实训任务书-项目1.docx ===")
    batch_cmds = []

    content_text = (
        "本项目《常工鲜生微信小程序与微服务运营平台》致力于为高校生鲜电商与社区零售提供高可用、易扩展、现代化的一站式微服务解决方案。主要设计内容包括：\n"
        "1. 微服务分层架构规划：采用 Spring Cloud 技术栈进行模块拆分，包含 Spring Cloud Gateway 统一 API 网关 (8090)、Nacos 服务注册与配置中心 (8848)、RuoYi Admin 权限鉴权微服务 (8081)、RuoYi Business 生鲜核心业务服务 (8088)、RuoYi Pay 支付异步同步服务 (8085) 以及 RuoYi Notice WebSocket 消息即时通知服务 (8086)。\n"
        "2. 生鲜核心数据建模：设计并优化 MySQL 8.0 数据库表结构，包含生鲜商品表 (lgg_fruit)、打包盒/规格表 (lgg_box)、订单主明细表 (lgg_orders)、购物车表 (lgg_shopping_cart) 以及地址簿 (lgg_address_book) 等。\n"
        "3. 前后端与小程序全链路通畅：前端搭建基于 Vue 3 + Element Plus 的运营管理后台，实现商品管理、分类筛选、订单状态追踪与接单派送；C 端适配微信小程序，打通浏览、选购、加购、地址选择、模拟支付与订单历史追踪的全套业务流。\n"
        "4. 云原生容器化编排部署：编写独立的 Dockerfile 与 docker-compose.yml 编排脚本，整合 MySQL、Redis、RabbitMQ、Nacos、MinIO 对象存储以及 5 大 Java 微服务，实现开箱即用的一键容器化构建与部署。"
    )

    goal_text = (
        "1. 架构可扩展性目标：实现微服务高内聚低耦合设计，API 网关统一鉴权与跨域处理，服务间通信响应时间小于 100ms。\n"
        "2. 消息实时性目标：基于 RabbitMQ 与 WebSocket 长连接技术，实现用户支付成功后管理后台秒级弹窗音效提醒，送达率 100%。\n"
        "3. 存储与高性能缓存目标：使用 Redis 7.0 对频繁读取的生鲜分类与商品列表进行二级缓存，数据库查询 QPS 提升 300% 以上；使用 MinIO 实现商品图片的云原生存储。\n"
        "4. 容器化部署目标：彻底打通 Linux/OrbStack 虚拟机环境一致性，使用 Docker Compose 实现基础设施与业务微服务一键拉起，端到端黑盒自动化测试全过。"
    )

    schedule_text = (
        "Sprint 01 (第 1-2 周)：需求调研与架构设计，完成数据表 SQL 设计与微服务模块划分。\n"
        "Sprint 02 (第 3-4 周)：微服务基础框架搭建，实现 Gateway 网关、Nacos 注册中心与 RuoYi Admin 权限集成。\n"
        "Sprint 03 (第 5-6 周)：生鲜核心业务开发，完成 Fruit/Category/Cart/Address/Orders 模块及微信小程序 C 端联调。\n"
        "Sprint 04 (第 7-8 周)：支付与通知解耦，集成 RuoYi Pay、RabbitMQ 消息队列与 RuoYi Notice WebSocket 实时推送。\n"
        "Sprint 05 (第 9-10 周)：MinIO 对象存储集成与前端 Vue 3 管理后台功能完善。\n"
        "Sprint 06 (第 11-12 周)：云原生 Docker Compose 编排脚本编写，完成虚拟机环境搭建与服务部署。\n"
        "Sprint 07 (第 13-14 周)：端到端黑盒自动化测试，进行性能调优与代码基线 Commit / Push 固化。\n"
        "Sprint 08 (第 15-16 周)：撰写实训报告、任务书、答辩记录等全套文档，准备毕业答辩演示。"
    )

    inject_cell_with_title(doc_path, "/body/tbl[1]/tr[2]/tc[1]", "一、项目设计内容", content_text, batch_cmds)
    inject_cell_with_title(doc_path, "/body/tbl[1]/tr[4]/tc[1]", "二、设计目标", goal_text, batch_cmds)
    inject_cell_with_title(doc_path, "/body/tbl[1]/tr[6]/tc[1]", "三、进度目标", schedule_text, batch_cmds)

    run_cmd(["officecli", "batch", doc_path, "--commands", json.dumps(batch_cmds)])
    print("✓ 5-实训任务书-项目1.docx 丰满扩展完成！")

def refine_doc6(doc_path, data_dir):
    print("=== 精准拆分填充 6-实训报告-项目1.docx 各空档表格 ===")
    with open(os.path.join(data_dir, "chap01.tex"), 'r', encoding='utf-8') as f:
        c1 = clean_tex(f.read())
    with open(os.path.join(data_dir, "chap02.tex"), 'r', encoding='utf-8') as f:
        c2 = clean_tex(f.read())
    with open(os.path.join(data_dir, "chap03.tex"), 'r', encoding='utf-8') as f:
        c3 = clean_tex(f.read())
    with open(os.path.join(data_dir, "chap04.tex"), 'r', encoding='utf-8') as f:
        c4 = clean_tex(f.read())
    with open(os.path.join(data_dir, "chap05.tex"), 'r', encoding='utf-8') as f:
        c5 = clean_tex(f.read())

    batch_cmds = []

    # Row 2: 主要的实施内容概要
    summary_text = (
        "【实施内容概要】\n"
        "本项目完成了《常工鲜生》生鲜电商平台的微服务重构与容器化部署。包含了生鲜商品的上架管理、分类筛选、购物车计算、订单创建与状态机流转；集成 Spring Cloud Gateway 实现统一路由与跨域鉴权；整合 RabbitMQ 与 WebSocket 打造来单秒级实时提醒；采用 Docker Compose 构建了包含 Nacos、Redis、MySQL、RabbitMQ、MinIO 以及 5 大 Java 微服务的一键容器编排运行环境。"
    )
    inject_cell_with_title(doc_path, "/body/tbl[1]/tr[2]/tc[2]", "", summary_text, batch_cmds)

    # Row 8: 二、项目研究背景
    inject_cell_with_title(doc_path, "/body/tbl[1]/tr[8]/tc[1]", "二、项目研究背景", c1, batch_cmds)

    # Row 9: 三、开发环境
    env_text = (
        "1. 操作系统：macOS / OrbStack Ubuntu 22.04 LTS (模拟企业级 Linux 服务器)\n"
        "2. 开发工具：IntelliJ IDEA 2024, VS Code, 微信开发者工具\n"
        "3. 后端技术栈：Java 17 (Amazon Corretto), Spring Boot 3.2.5, Spring Cloud 2023, RuoYi-Vue 微服务版\n"
        "4. 前端技术栈：Vue 3.x, Vite, Element Plus, Pinia, Vue Router, 微信小程序原生框架\n"
        "5. 中间件与数据库：MySQL 8.0, Redis 7.0-alpine, RabbitMQ 3.9 (Management), Nacos 2.2.3, MinIO (RELEASE.2023-09-04)\n"
        "6. 容器化编排：Docker 24.0, Docker Compose 3.8"
    )
    inject_cell_with_title(doc_path, "/body/tbl[1]/tr[9]/tc[1]", "三、开发环境", env_text, batch_cmds)

    # Row 10: 四、项目研究目标及主要内容
    inject_cell_with_title(doc_path, "/body/tbl[1]/tr[10]/tc[1]", "四、项目研究目标及主要内容", c2, batch_cmds)

    # Row 11: 五、项目创新特色概述
    innovation_text = (
        "1. 微服务统一接入与鉴权创新：基于 Spring Cloud Gateway 与 JWT Token 实现无状态安全认证，降低服务间耦合度。\n"
        "2. 异步解耦与秒级即时推送：引入 RabbitMQ 消息队列解耦支付与通知模块，配合 WebSocket 协议实现管理后台零延迟来单语音弹窗广播。\n"
        "3. 全栈容器化与敏捷部署创新：抛弃传统依赖本地环境部署的做法，全套微服务与中间件采用 Docker Compose 编排，支持在轻量虚拟机环境上一键构建部署与黑盒 E2E 测试。"
    )
    inject_cell_with_title(doc_path, "/body/tbl[1]/tr[11]/tc[1]", "五、项目创新特色概述", innovation_text, batch_cmds)

    # Row 12: 六、项目研究技术路线
    inject_cell_with_title(doc_path, "/body/tbl[1]/tr[12]/tc[1]", "六、项目研究技术路线", c3, batch_cmds)

    # Row 13: 七、项目模块结构图
    inject_cell_with_title(doc_path, "/body/tbl[1]/tr[13]/tc[1]", "七、项目模块结构图", c4, batch_cmds)

    # Row 14: 模块功能介绍及实现结果截图
    inject_cell_with_title(doc_path, "/body/tbl[1]/tr[14]/tc[1]", "模块功能介绍及实现结果截图", c5, batch_cmds)

    run_cmd(["officecli", "batch", doc_path, "--commands", json.dumps(batch_cmds)])
    print("✓ 6-实训报告-项目1.docx 全部 14 行表格空档拆分注入完成！")

def main():
    target_dir = "/Users/caolei/Desktop/springboot-lgg/docs/03-report/实训文档/23030301曹磊-1"
    data_dir = "/Users/caolei/Desktop/springboot-lgg/docs/03-report/实训文档/templates/data"

    refine_doc5(os.path.join(target_dir, "5-实训任务书-项目1.docx"))
    refine_doc6(os.path.join(target_dir, "6-实训报告-项目1.docx"), data_dir)

    print("=== 全量实训文档重构完善完成 ===")

if __name__ == "__main__":
    main()
