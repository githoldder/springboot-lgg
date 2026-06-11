import json

def update_lib_version(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if 'setting' in data:
            data['setting']['libVersion'] = "3.0.0"
        elif 'libVersion' in data:
            data['libVersion'] = "3.0.0"
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Updated {file_path}")
    except Exception as e:
        print(f"Failed to update {file_path}: {e}")

update_lib_version('mp-weixin/project.config.json')
update_lib_version('mp-weixin/project.private.config.json')
