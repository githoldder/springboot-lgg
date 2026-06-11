import os

files_to_patch = [
    'mp-weixin/app.json',
    'mp-weixin/pages/index/index.json',
    'mp-weixin/pages/index/index.wxml',
    'mp-weixin/pages/details/index.wxml'
]

for filepath in files_to_patch:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        content = content.replace("绿果果生鲜店", "常工鲜生")
        content = content.replace("绿果果", "常工鲜生")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {filepath}")
