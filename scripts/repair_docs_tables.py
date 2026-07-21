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

def inject_cell(doc_path, cell_path, text, batch_cmds, indent="24pt"):
    if not text:
        return
    out = run_cmd(["officecli", "get", doc_path, cell_path, "--json"])
    data = json.loads(out)
    orig_count = data['data']['results'][0]['childCount'] if data.get('success') and data['data']['results'] else 1

    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if not lines:
        lines = [""]

    batch_cmds.append({"command": "set", "path": f"{cell_path}/p[1]", "props": {"text": lines[0]}})

    for i in range(1, len(lines)):
        batch_cmds.append({
            "command": "add",
            "parent": cell_path,
            "type": "paragraph",
            "props": {
                "text": lines[i],
                "firstLineIndent": indent,
                "font.ea": "宋体",
                "font.latin": "Times New Roman",
                "size": "12pt"
            }
        })

    total_p = orig_count + len(lines) - 1
    keep_p = len(lines)
    for i in range(total_p, keep_p, -1):
        batch_cmds.append({"command": "remove", "path": f"{cell_path}/p[{i}]"})

def repair_doc6(doc_path, data_dir):
    print(f"=== 修复 6-实训报告-项目1.docx 表格数据 ===")
    with open(os.path.join(data_dir, "chap01.tex"), 'r', encoding='utf-8') as f:
        c1 = clean_tex(f.read())
    with open(os.path.join(data_dir, "chap03.tex"), 'r', encoding='utf-8') as f:
        c3 = clean_tex(f.read())
    with open(os.path.join(data_dir, "chap05.tex"), 'r', encoding='utf-8') as f:
        c5 = clean_tex(f.read())

    batch_cmds = []

    # 1. 恢复 Row 2 / tc[1] 左侧列标题文本
    out_tc1 = run_cmd(["officecli", "get", doc_path, "/body/tbl[1]/tr[2]/tc[1]", "--json"])
    tc1_data = json.loads(out_tc1)
    tc1_count = tc1_data['data']['results'][0]['childCount'] if tc1_data.get('success') and tc1_data['data']['results'] else 1

    batch_cmds.append({"command": "set", "path": "/body/tbl[1]/tr[2]/tc[1]/p[1]", "props": {"text": "主要的实施内容"}})
    for i in range(tc1_count, 1, -1):
        batch_cmds.append({"command": "remove", "path": f"/body/tbl[1]/tr[2]/tc[1]/p[{i}]"})

    # 2. 将正文正确灌入真正的填空大框 Row 2 / tc[2]
    report_text = f"【1. 系统概述与需求背景】\n{c1}\n\n【2. 系统架构设计与微服务实现】\n{c3}\n\n【3. 容器化部署与成果总结】\n{c5}"
    inject_cell(doc_path, "/body/tbl[1]/tr[2]/tc[2]", report_text, batch_cmds)

    # 3. 修正 Row 4 成员表格（替换张三/李四/王五）
    batch_cmds.append({"command": "set", "path": "/body/tbl[1]/tr[4]/tc[2]/p[1]", "props": {"text": "曹磊"}})
    batch_cmds.append({"command": "set", "path": "/body/tbl[1]/tr[4]/tc[3]/p[1]", "props": {"text": "23030301"}})
    batch_cmds.append({"command": "set", "path": "/body/tbl[1]/tr[4]/tc[4]/p[1]", "props": {"text": "13800000000"}})
    batch_cmds.append({"command": "set", "path": "/body/tbl[1]/tr[4]/tc[5]/p[1]", "props": {"text": "caolei@czu.edu.cn"}})

    # 清空 Row 5 / Row 6 死数据占位
    for r in [5, 6]:
        for c in range(2, 6):
            batch_cmds.append({"command": "set", "path": f"/body/tbl[1]/tr[{r}]/tc[{c}]/p[1]", "props": {"text": "-"}})

    # 4. 修正 Row 7 成员分工描述
    duty_text = "一、项目组成员分工描述：\n曹磊：作为独立项目负责人，全面负责《常工鲜生》运营平台的系统设计与开发。具体包含：Spring Cloud 微服务架构规划、Nacos 注册中心搭建、Gateway 网关配置、订单与支付处理流水线实现、Vue 3 后台管理端与微信小程序联调，以及全套 Docker Compose 云原生容器化编排部署。"
    inject_cell(doc_path, "/body/tbl[1]/tr[7]/tc[1]", duty_text, batch_cmds)

    run_cmd(["officecli", "batch", doc_path, "--commands", json.dumps(batch_cmds)])
    print("✓ 6-实训报告-项目1.docx 表格修复完成！")

def repair_doc10(doc_path):
    print(f"=== 修复 10-答辩记录.docx 答辩问答数据 ===")
    batch_cmds = []

    qas = [
        "【常工鲜生微信小程序与微服务运营平台 课程答辩记录】",
        "问题 1：项目微服务架构中，Gateway 网关是如何实现路由分发与统一鉴权的？",
        "回答 1：系统通过 Spring Cloud Gateway 统一监听 8090 端口，在配置文件中定义断言谓词转发至后端业务微服务；同时结合全局 JwtAuthenticationTokenFilter 对前端请求头中的 Token 进行合法性校验与跨域放行。",
        "问题 2：订单支付成功后，系统是如何实现秒级实时推送来单提醒的？",
        "回答 2：当支付服务完成支付逻辑后，主动向 RabbitMQ 交换机投递 pay.success 消息；ruoyi-notice 通知微服务异步消费该消息，并通过 WebSocket 长连接将提醒即时广播推送给前端 Vue 管理后台与小程序端。",
        "问题 3：在部署方面，为什么选择 Docker Compose 容器编排替代传统的直接运行？",
        "回答 3：项目包含 MySQL、Redis、Nacos、RabbitMQ、MinIO 以及 5 个 Spring Cloud Java 微服务。使用 Docker Compose 可以通过声明式的 yml 脚本进行基础设施一键拉起与服务编排，彻底打通环境一致性，符合现代云原生企业级部署标准。"
    ]

    out = run_cmd(["officecli", "get", doc_path, "/body/tbl[1]/tr[1]/tc[2]", "--json"])
    data = json.loads(out)
    tc2_count = data['data']['results'][0]['childCount'] if data.get('success') and data['data']['results'] else 1

    for i, text in enumerate(qas, start=1):
        if i <= tc2_count:
            batch_cmds.append({"command": "set", "path": f"/body/tbl[1]/tr[1]/tc[2]/p[{i}]", "props": {"text": text}})
        else:
            batch_cmds.append({
                "command": "add",
                "parent": "/body/tbl[1]/tr[1]/tc[2]",
                "type": "paragraph",
                "props": {"text": text, "font.ea": "宋体", "font.latin": "Times New Roman", "size": "10.5pt"}
            })

    run_cmd(["officecli", "batch", doc_path, "--commands", json.dumps(batch_cmds)])
    print("✓ 10-答辩记录.docx 答辩问答数据修复完成！")

def main():
    target_dir = "/Users/caolei/Desktop/springboot-lgg/docs/03-report/实训文档/23030301曹磊-1"
    data_dir = "/Users/caolei/Desktop/springboot-lgg/docs/03-report/实训文档/templates/data"

    repair_doc6(os.path.join(target_dir, "6-实训报告-项目1.docx"), data_dir)
    repair_doc10(os.path.join(target_dir, "10-答辩记录.docx"))

    print("=== 全量文档表格病灶彻底消除 ===")

if __name__ == "__main__":
    main()
