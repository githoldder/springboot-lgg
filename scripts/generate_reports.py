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

def process_weekly_report(docx_path, txt_path, output_path):
    print(f"Processing {docx_path} with data from {txt_path}...")
    
    # 1. Parse TXT
    with open(txt_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract fields
    class_name = re.search(r"班\s*级：(.*)", content).group(1).strip()
    student_id = re.search(r"学\s*号：(.*)", content).group(1).strip()
    student_name = re.search(r"姓\s*名：(.*)", content).group(1).strip()
    
    date_match = re.search(r"日期：(.*)", content)
    date_str = date_match.group(1).strip() if date_match else ""

    work_record = re.search(r"工作情况记录：\n(.*?)(?=\n工作、学习体会及收获：)", content, re.DOTALL).group(1).strip()
    harvest = re.search(r"工作、学习体会及收获：\n(.*)", content, re.DOTALL).group(1).strip()

    # Create working copy
    run_cmd(["cp", docx_path, output_path])

    batch_cmds = []

    # 2. Cover Page Updates
    cover_updates = [
        {"path": "/body/p[@paraId='6C4C03E2']", "prefix": "班    级           ", "val": f"   {class_name}   "},
        {"path": "/body/p[@paraId='3B3DE785']", "prefix": "学    号            ", "val": f"  {student_id}  "},
        {"path": "/body/p[@paraId='50E79AE1']", "prefix": "姓    名              ", "val": f"   {student_name}   "},
    ]
    
    for update in cover_updates:
        # We assume paraId in the template is consistent. 
        # Use no quotes for paraId to avoid syntax error in officecli
        pid = update['path'].split('=')[1].replace("'", "").replace("]", "")
        p_path = f"/body/p[@paraId={pid}]"
        
        batch_cmds.extend([
            {"command": "set", "path": p_path, "props": {"text": ""}},
            {"command": "add", "parent": p_path, "type": "run", "props": {
                "text": update['prefix'],
                "size": "15pt",
                "font.ea": "宋体",
                "font.latin": "Times New Roman",
                "underline": "none"
            }},
            {"command": "add", "parent": p_path, "type": "run", "props": {
                "text": update['val'],
                "size": "15pt",
                "font.ea": "宋体",
                "font.latin": "Times New Roman",
                "underline": "single"
            }}
        ])

    # 3. Table Updates
    # cell_mappings: (xpath, text_content)
    cell_mappings = [
        ("/body/tbl[1]/tr[1]/tc[2]", date_str),
        ("/body/tbl[1]/tr[2]/tc[2]", work_record),
        ("/body/tbl[1]/tr[3]/tc[2]", harvest)
    ]

    for cell_path, text in cell_mappings:
        orig_count = get_child_count(output_path, cell_path)
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        if not lines:
            lines = [""]

        # update first paragraph
        batch_cmds.append({
            "command": "set",
            "path": f"{cell_path}/p[1]",
            "props": {"text": lines[0]}
        })

        # add remaining paragraphs
        for i in range(1, len(lines)):
            batch_cmds.append({
                "command": "add",
                "parent": cell_path,
                "type": "paragraph",
                "props": {
                    "text": lines[i],
                    "firstLineIndent": "24pt",
                    "font.ea": "宋体",
                    "font.latin": "Times New Roman",
                    "size": "12pt"
                }
            })

        # remove leftover original paragraphs (start from the end)
        total_p = orig_count + len(lines) - 1
        keep_p = len(lines)
        for i in range(total_p, keep_p, -1):
            batch_cmds.append({
                "command": "remove",
                "path": f"{cell_path}/p[{i}]"
            })

    # Execute batch
    batch_json = json.dumps(batch_cmds)
    try:
        run_cmd(["officecli", "batch", output_path, "--commands", batch_json])
        print(f"Successfully updated {output_path}")
    except Exception as e:
        print(f"Failed to batch update {output_path}: {str(e)}")
        with open(output_path + ".batch.json", "w") as f:
            f.write(batch_json)

if __name__ == "__main__":
    base_dir = "/Users/caolei/Desktop/springboot-lgg/docs/03-report/实训文档"
    out_dir = os.path.join(base_dir, "output")
    os.makedirs(out_dir, exist_ok=True)
    
    # Process 1-第2周报.docx -> 1第一周周报告.txt
    docx_file = os.path.join(base_dir, "23030301曹磊-1", "1-第2周报.docx")
    txt_file = os.path.join(base_dir, "reports_txt", "1第一周周报告.txt")
    out_file = os.path.join(out_dir, "1-第2周报_filled.docx")
    
    process_weekly_report(docx_file, txt_file, out_file)
