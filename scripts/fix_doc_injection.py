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

def find_paragraph_by_text(doc_path, keyword):
    out = run_cmd(["officecli", "query", doc_path, "paragraph", "--find", keyword, "--json"])
    data = json.loads(out)
    if data.get('success') and data['data']['results']:
        path = data['data']['results'][0]['path']
        match = re.search(r"paraId=(\w+)", path)
        if match:
            return match.group(1)
    return None

def read_cover_info(doc_path):
    # Read Class, ID, Name from 1-第2周报.docx
    res = {}
    for kw in ["班    级", "学    号", "姓    名"]:
        pid = find_paragraph_by_text(doc_path, kw)
        if pid:
            out = run_cmd(["officecli", "get", doc_path, f"/body/p[@paraId={pid}]", "--json"])
            try:
                data = json.loads(out)
                text = data['data']['results'][0].get('text', '')
                res[kw] = text
            except:
                pass
    return res

def apply_cover_page(doc_path, cover_info, batch_cmds):
    # Sync cover info (Class, ID, Name) to target docx
    for kw, full_text in cover_info.items():
        if not full_text:
            continue
        pid = find_paragraph_by_text(doc_path, kw)
        if not pid:
            continue
        p_path = f"/body/p[@paraId={pid}]"
        # Parse value part after kw
        val = full_text.replace(kw, "").strip()
        batch_cmds.extend([
            {"command": "set", "path": p_path, "props": {"text": ""}},
            {"command": "add", "parent": p_path, "type": "run", "props": {
                "text": f"{kw}           ",
                "size": "15pt",
                "font.ea": "宋体",
                "font.latin": "Times New Roman",
                "underline": "none"
            }},
            {"command": "add", "parent": p_path, "type": "run", "props": {
                "text": f"   {val}   ",
                "size": "15pt",
                "font.ea": "宋体",
                "font.latin": "Times New Roman",
                "underline": "single"
            }}
        ])

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

def find_target_cell(doc_path, title_keyword):
    # Detect table row/cell location by matching title_keyword
    out = run_cmd(["officecli", "get", doc_path, "/body/tbl[1]", "--json"])
    try:
        data = json.loads(out)
        rows = data['data']['results'][0]['children']
        for r_idx, r in enumerate(rows, start=1):
            cells = r.get('children', [])
            for c_idx, c in enumerate(cells, start=1):
                cell_text = c.get('text', '')
                if title_keyword in cell_text:
                    # If this row has a second cell tc[2], target is tc[2]
                    if len(cells) >= 2 and c_idx == 1:
                        return f"/body/tbl[1]/tr[{r_idx}]/tc[2]"
                    # Else if single cell row, target is the NEXT row tc[1]
                    elif r_idx < len(rows):
                        return f"/body/tbl[1]/tr[{r_idx+1}]/tc[1]"
    except Exception as e:
        print(f"Error inspecting table in {doc_path}: {e}")
    return None

def process_doc5(doc_path, txt_path, cover_info):
    with open(txt_path, 'r', encoding='utf-8') as f:
        content = f.read()
    batch_cmds = []
    apply_cover_page(doc_path, cover_info, batch_cmds)
    
    design_match = re.search(r"一、项目设计内容\n(.*?)(?=\n二、设计目标)", content, re.DOTALL)
    obj_match = re.search(r"二、设计目标\n(.*?)(?=\n三、进度目标)", content, re.DOTALL)
    prog_match = re.search(r"三、进度目标\n(.*?)(?=\n四、导师审核意见)", content, re.DOTALL)
    
    if design_match:
        cell_p = find_target_cell(doc_path, "一、项目设计内容") or "/body/tbl[1]/tr[2]/tc[1]"
        inject_cell(doc_path, cell_p, design_match.group(1).strip(), batch_cmds)
    if obj_match:
        cell_p = find_target_cell(doc_path, "二、设计目标") or "/body/tbl[1]/tr[4]/tc[1]"
        inject_cell(doc_path, cell_p, obj_match.group(1).strip(), batch_cmds)
    if prog_match:
        cell_p = find_target_cell(doc_path, "三、进度目标") or "/body/tbl[1]/tr[6]/tc[1]"
        inject_cell(doc_path, cell_p, prog_match.group(1).strip(), batch_cmds)
        
    if batch_cmds:
        run_cmd(["officecli", "batch", doc_path, "--commands", json.dumps(batch_cmds)])

def process_doc6(doc_path, data_dir, cover_info):
    with open(os.path.join(data_dir, "chap01.tex"), 'r', encoding='utf-8') as f:
        c1 = clean_tex(f.read())
    with open(os.path.join(data_dir, "chap03.tex"), 'r', encoding='utf-8') as f:
        c3 = clean_tex(f.read())
        
    batch_cmds = []
    apply_cover_page(doc_path, cover_info, batch_cmds)
    report_text = f"【系统概述与设计背景】\n{c1}\n\n【系统架构与设计实现】\n{c3}"
    cell_p = find_target_cell(doc_path, "主要的实施内容") or find_target_cell(doc_path, "任务") or "/body/tbl[1]/tr[2]/tc[1]"
    inject_cell(doc_path, cell_p, report_text, batch_cmds)
    if batch_cmds:
        run_cmd(["officecli", "batch", doc_path, "--commands", json.dumps(batch_cmds)])

def process_doc9(doc_path, data_dir, cover_info):
    full_text = []
    for i in range(1, 7):
        file_p = os.path.join(data_dir, f"chap0{i}.tex")
        if os.path.exists(file_p):
            with open(file_p, 'r', encoding='utf-8') as f:
                full_text.append(clean_tex(f.read()))
                
    batch_cmds = []
    apply_cover_page(doc_path, cover_info, batch_cmds)
    combined = "\n\n".join(full_text)
    cell_p = find_target_cell(doc_path, "正文") or find_target_cell(doc_path, "内容") or "/body/tbl[1]/tr[2]/tc[1]"
    inject_cell(doc_path, cell_p, combined[:12000], batch_cmds)
    if batch_cmds:
        run_cmd(["officecli", "batch", doc_path, "--commands", json.dumps(batch_cmds)])

def process_doc10(doc_path, txt_path, cover_info):
    with open(txt_path, 'r', encoding='utf-8') as f:
        content = f.read()
    batch_cmds = []
    apply_cover_page(doc_path, cover_info, batch_cmds)
    cell_p = find_target_cell(doc_path, "答辩") or "/body/tbl[1]/tr[1]/tc[1]"
    inject_cell(doc_path, cell_p, content, batch_cmds)
    if batch_cmds:
        run_cmd(["officecli", "batch", doc_path, "--commands", json.dumps(batch_cmds)])

def main():
    target_dir = "/Users/caolei/Desktop/springboot-lgg/docs/03-report/实训文档/23030301曹磊-1"
    txt_dir = "/Users/caolei/Desktop/springboot-lgg/docs/03-report/实训文档/reports_txt"
    data_dir = "/Users/caolei/Desktop/springboot-lgg/docs/03-report/实训文档/templates/data"

    doc1_path = os.path.join(target_dir, "1-第2周报.docx")
    print("=== 读取 1-第2周报.docx 封面人员信息 ===")
    cover_info = read_cover_info(doc1_path)
    print("读取到的封面信息:", cover_info)

    print("=== 开始精准表头识别与对应单元格注入 ===")

    process_doc5(os.path.join(target_dir, "5-实训任务书-项目1.docx"), os.path.join(txt_dir, "0软件开发实训任务书.txt"), cover_info)
    print("✓ 5-实训任务书-项目1.docx 封面同步 & 正文精准单元格注入完成")

    process_doc6(os.path.join(target_dir, "6-实训报告-项目1.docx"), data_dir, cover_info)
    print("✓ 6-实训报告-项目1.docx 封面同步 & 正文精准单元格注入完成")

    process_doc9(os.path.join(target_dir, "9-课程报告.docx"), data_dir, cover_info)
    print("✓ 9-课程报告.docx 封面同步 & 正文精准单元格注入完成")

    process_doc10(os.path.join(target_dir, "10-答辩记录.docx"), os.path.join(txt_dir, "6答辩记录.txt"), cover_info)
    print("✓ 10-答辩记录.docx 封面同步 & 正文精准单元格注入完成")

    print("=== 全部文档修复成功 ===")

if __name__ == "__main__":
    main()
