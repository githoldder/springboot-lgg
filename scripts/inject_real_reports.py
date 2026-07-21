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

def get_child_count(doc_path, xpath):
    out = run_cmd(["officecli", "get", doc_path, xpath, "--json"])
    data = json.loads(out)
    if not data.get('success') or not data['data']['results']:
        return 0
    return data['data']['results'][0]['childCount']

def inject_cell(doc_path, cell_path, text, batch_cmds, indent="24pt"):
    if not text:
        return
    orig_count = get_child_count(doc_path, cell_path)
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

def process_doc1(doc_path, txt_path):
    with open(txt_path, 'r', encoding='utf-8') as f:
        content = f.read()
    batch_cmds = []
    work_match = re.search(r"工作情况记录：\n(.*?)(?=\n工作、学习体会及收获：)", content, re.DOTALL)
    harvest_match = re.search(r"工作、学习体会及收获：\n(.*)", content, re.DOTALL)
    
    if work_match:
        inject_cell(doc_path, "/body/tbl[1]/tr[2]/tc[2]", work_match.group(1).strip(), batch_cmds)
    if harvest_match:
        inject_cell(doc_path, "/body/tbl[1]/tr[3]/tc[2]", harvest_match.group(1).strip(), batch_cmds)
        
    if batch_cmds:
        run_cmd(["officecli", "batch", doc_path, "--commands", json.dumps(batch_cmds)])

def process_doc2(doc_path, txt_path):
    with open(txt_path, 'r', encoding='utf-8') as f:
        content = f.read()
    batch_cmds = []
    work_match = re.search(r"工作情况记录：\n(.*?)(?=\n工作、学习体会及收获：)", content, re.DOTALL)
    harvest_match = re.search(r"工作、学习体会及收获：\n(.*)", content, re.DOTALL)
    
    if work_match:
        inject_cell(doc_path, "/body/tbl[1]/tr[2]/tc[2]", work_match.group(1).strip(), batch_cmds)
    if harvest_match:
        inject_cell(doc_path, "/body/tbl[1]/tr[3]/tc[2]", harvest_match.group(1).strip(), batch_cmds)
        
    if batch_cmds:
        run_cmd(["officecli", "batch", doc_path, "--commands", json.dumps(batch_cmds)])

def process_doc5(doc_path, txt_path):
    with open(txt_path, 'r', encoding='utf-8') as f:
        content = f.read()
    batch_cmds = []
    
    design_match = re.search(r"一、项目设计内容\n(.*?)(?=\n二、设计目标)", content, re.DOTALL)
    obj_match = re.search(r"二、设计目标\n(.*?)(?=\n三、进度目标)", content, re.DOTALL)
    prog_match = re.search(r"三、进度目标\n(.*?)(?=\n四、导师审核意见)", content, re.DOTALL)
    
    if design_match:
        inject_cell(doc_path, "/body/tbl[1]/tr[2]/tc[1]", design_match.group(1).strip(), batch_cmds)
    if obj_match:
        inject_cell(doc_path, "/body/tbl[1]/tr[4]/tc[1]", obj_match.group(1).strip(), batch_cmds)
    if prog_match:
        inject_cell(doc_path, "/body/tbl[1]/tr[6]/tc[1]", prog_match.group(1).strip(), batch_cmds)
        
    if batch_cmds:
        run_cmd(["officecli", "batch", doc_path, "--commands", json.dumps(batch_cmds)])

def process_doc6(doc_path, data_dir):
    with open(os.path.join(data_dir, "chap01.tex"), 'r', encoding='utf-8') as f:
        c1 = clean_tex(f.read())
    with open(os.path.join(data_dir, "chap03.tex"), 'r', encoding='utf-8') as f:
        c3 = clean_tex(f.read())
        
    batch_cmds = []
    report_text = f"【系统概述与设计背景】\n{c1}\n\n【系统架构与设计实现】\n{c3}"
    inject_cell(doc_path, "/body/tbl[1]/tr[2]/tc[1]", report_text, batch_cmds)
    if batch_cmds:
        run_cmd(["officecli", "batch", doc_path, "--commands", json.dumps(batch_cmds)])

def process_doc9(doc_path, data_dir):
    full_text = []
    for i in range(1, 7):
        file_p = os.path.join(data_dir, f"chap0{i}.tex")
        if os.path.exists(file_p):
            with open(file_p, 'r', encoding='utf-8') as f:
                full_text.append(clean_tex(f.read()))
                
    batch_cmds = []
    combined = "\n\n".join(full_text)
    inject_cell(doc_path, "/body/tbl[1]/tr[2]/tc[1]", combined[:12000], batch_cmds)
    if batch_cmds:
        run_cmd(["officecli", "batch", doc_path, "--commands", json.dumps(batch_cmds)])

def process_doc10(doc_path, txt_path):
    with open(txt_path, 'r', encoding='utf-8') as f:
        content = f.read()
    batch_cmds = []
    inject_cell(doc_path, "/body/tbl[1]/tr[1]/tc[1]", content, batch_cmds)
    if batch_cmds:
        run_cmd(["officecli", "batch", doc_path, "--commands", json.dumps(batch_cmds)])

def main():
    target_dir = "/Users/caolei/Desktop/springboot-lgg/docs/03-report/实训文档/23030301曹磊-1"
    txt_dir = "/Users/caolei/Desktop/springboot-lgg/docs/03-report/实训文档/reports_txt"
    data_dir = "/Users/caolei/Desktop/springboot-lgg/docs/03-report/实训文档/templates/data"

    print("=== 仅注入正文事实内容，保留模板原始封面与日期 ===")
    
    process_doc1(os.path.join(target_dir, "1-第2周报.docx"), os.path.join(txt_dir, "1第一周周报告.txt"))
    print("✓ 1-第2周报.docx 正文更新完成")

    process_doc2(os.path.join(target_dir, "2-第4周报.docx"), os.path.join(txt_dir, "4第四周周报告.txt"))
    print("✓ 2-第4周报.docx 正文更新完成")

    process_doc5(os.path.join(target_dir, "5-实训任务书-项目1.docx"), os.path.join(txt_dir, "0软件开发实训任务书.txt"))
    print("✓ 5-实训任务书-项目1.docx 正文更新完成")

    process_doc6(os.path.join(target_dir, "6-实训报告-项目1.docx"), data_dir)
    print("✓ 6-实训报告-项目1.docx 正文更新完成")

    process_doc9(os.path.join(target_dir, "9-课程报告.docx"), data_dir)
    print("✓ 9-课程报告.docx 正文更新完成")

    process_doc10(os.path.join(target_dir, "10-答辩记录.docx"), os.path.join(txt_dir, "6答辩记录.txt"))
    print("✓ 10-答辩记录.docx 正文更新完成")

    print("=== 成功：封面与日期保持原始状态，正文已完成覆盖注入 ===")

if __name__ == "__main__":
    main()
