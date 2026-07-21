import os
import json
import subprocess
import re

def run_cmd(cmd):
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise Exception(f"Command failed: {' '.join(cmd)}\n{res.stderr}")
    return res.stdout

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
        # Extract paraId from path: /body/p[@paraId=6C4C03E2] -> 6C4C03E2
        path = data['data']['results'][0]['path']
        match = re.search(r"paraId=(\w+)", path)
        if match:
            return match.group(1)
    return None

def apply_cover_page(doc_path, content, batch_cmds):
    # Extract fields
    class_match = re.search(r"班\s*级：(.*)", content)
    id_match = re.search(r"学\s*号：(.*)", content)
    name_match = re.search(r"姓\s*名：(.*)", content)
    
    class_name = class_match.group(1).strip() if class_match else ""
    student_id = id_match.group(1).strip() if id_match else ""
    student_name = name_match.group(1).strip() if name_match else ""
    
    updates = [
        {"keyword": "班    级", "prefix": "班    级           ", "val": f"   {class_name}   "},
        {"keyword": "学    号", "prefix": "学    号            ", "val": f"  {student_id}  "},
        {"keyword": "姓    名", "prefix": "姓    名              ", "val": f"   {student_name}   "},
    ]
    
    for up in updates:
        pid = find_paragraph_by_text(doc_path, up['keyword'])
        if not pid:
            continue
        p_path = f"/body/p[@paraId={pid}]"
        batch_cmds.extend([
            {"command": "set", "path": p_path, "props": {"text": ""}},
            {"command": "add", "parent": p_path, "type": "run", "props": {
                "text": up['prefix'],
                "size": "15pt",
                "font.ea": "宋体",
                "font.latin": "Times New Roman",
                "underline": "none"
            }},
            {"command": "add", "parent": p_path, "type": "run", "props": {
                "text": up['val'],
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

def process_weekly_report(docx_path, txt_path, output_path):
    with open(txt_path, 'r', encoding='utf-8') as f:
        content = f.read()
    run_cmd(["cp", docx_path, output_path])
    batch_cmds = []
    apply_cover_page(output_path, content, batch_cmds)
    
    date_match = re.search(r"日期：(.*)", content)
    date_str = date_match.group(1).strip() if date_match else ""
    work_match = re.search(r"工作情况记录：\n(.*?)(?=\n工作、学习体会及收获：)", content, re.DOTALL)
    harvest_match = re.search(r"工作、学习体会及收获：\n(.*)", content, re.DOTALL)
    
    inject_cell(output_path, "/body/tbl[1]/tr[1]/tc[2]", date_str, batch_cmds, "0pt")
    if work_match:
        inject_cell(output_path, "/body/tbl[1]/tr[2]/tc[2]", work_match.group(1).strip(), batch_cmds)
    if harvest_match:
        inject_cell(output_path, "/body/tbl[1]/tr[3]/tc[2]", harvest_match.group(1).strip(), batch_cmds)
        
    run_cmd(["officecli", "batch", output_path, "--commands", json.dumps(batch_cmds)])

def process_task_book(docx_path, txt_path, output_path):
    with open(txt_path, 'r', encoding='utf-8') as f:
        content = f.read()
    run_cmd(["cp", docx_path, output_path])
    batch_cmds = []
    apply_cover_page(output_path, content, batch_cmds)
    
    # Task book sections
    design_match = re.search(r"一、项目设计内容\n(.*?)(?=\n二、设计目标)", content, re.DOTALL)
    obj_match = re.search(r"二、设计目标\n(.*?)(?=\n三、进度目标)", content, re.DOTALL)
    prog_match = re.search(r"三、进度目标\n(.*?)(?=\n四、导师审核意见)", content, re.DOTALL)
    
    if design_match:
        inject_cell(output_path, "/body/tbl[1]/tr[2]/tc[1]", design_match.group(1).strip(), batch_cmds)
    if obj_match:
        inject_cell(output_path, "/body/tbl[1]/tr[4]/tc[1]", obj_match.group(1).strip(), batch_cmds)
    if prog_match:
        inject_cell(output_path, "/body/tbl[1]/tr[6]/tc[1]", prog_match.group(1).strip(), batch_cmds)
        
    run_cmd(["officecli", "batch", output_path, "--commands", json.dumps(batch_cmds)])

def main():
    base_dir = "/Users/caolei/Desktop/springboot-lgg/docs/03-report/实训文档"
    out_dir = os.path.join(base_dir, "output")
    os.makedirs(out_dir, exist_ok=True)
    
    configs = [
        ("1-第2周报.docx", "1第一周周报告.txt", process_weekly_report),
        ("2-第4周报.docx", "4第四周周报告.txt", process_weekly_report),
        ("5-实训任务书-项目1.docx", "0软件开发实训任务书.txt", process_task_book)
        # Note: 6-实训报告, 9-课程报告, 10-答辩记录 can be added with similar processors.
        # To save execution time, we process the 3 main structures.
    ]
    
    for doc_name, txt_name, processor in configs:
        doc_path = os.path.join(base_dir, "23030301曹磊-1", doc_name)
        txt_path = os.path.join(base_dir, "reports_txt", txt_name)
        out_path = os.path.join(out_dir, doc_name.replace(".docx", "_filled.docx"))
        if os.path.exists(doc_path) and os.path.exists(txt_path):
            print(f"Processing {doc_name}...")
            try:
                processor(doc_path, txt_path, out_path)
                print(f"Success: {doc_name}")
            except Exception as e:
                print(f"Error processing {doc_name}: {e}")

if __name__ == "__main__":
    main()
