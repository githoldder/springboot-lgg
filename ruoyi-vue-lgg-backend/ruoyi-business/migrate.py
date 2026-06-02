import os
import shutil

# 定义路径
WORKSPACE = "/Users/caolei/Desktop/苍穹外卖项目代码"
SRC_COMMON = os.path.join(WORKSPACE, "sky-take-out/sky-common/src/main/java/com/sky")
SRC_POJO = os.path.join(WORKSPACE, "sky-take-out/sky-pojo/src/main/java/com/sky")
SRC_SERVER = os.path.join(WORKSPACE, "sky-take-out/sky-server/src/main/java/com/sky")
MAPPERS_XML = os.path.join(WORKSPACE, "sky-take-out/sky-server/src/main/resources/mapper")

DEST_JAVA_ROOT = os.path.join(WORKSPACE, "ruoyi-vue-lgg-backend/ruoyi-business/src/main/java/com/ruoyi/business")
DEST_XML_ROOT = os.path.join(WORKSPACE, "ruoyi-vue-lgg-backend/ruoyi-business/src/main/resources/mapper/business")

# 需要排除复制的文件
EXCLUDE_FILES = {
    "WebMvcConfiguration.java", # 自定义实现
}

def copy_and_refactor_java(src_dir, dest_root_dir):
    print(f"正在从 {src_dir} 迁移并重构 Java 文件...")
    for root, dirs, files in os.walk(src_dir):
        # 确定目标子目录
        rel_path = os.path.relpath(root, src_dir)
        if rel_path == ".":
            dest_dir = dest_root_dir
        else:
            dest_dir = os.path.join(dest_root_dir, rel_path)
            
        os.makedirs(dest_dir, exist_ok=True)
        
        for file in files:
            if not file.endswith(".java") or file in EXCLUDE_FILES:
                continue
                
            src_file_path = os.path.join(root, file)
            dest_file_path = os.path.join(dest_dir, file)
            
            # 读取内容并重构包名及导入
            with open(src_file_path, "r", encoding="utf-8") as f:
                content = f.read()
                
            # 执行包路径重命名
            content = content.replace("package com.sky", "package com.ruoyi.business")
            content = content.replace("import com.sky.", "import com.ruoyi.business.")
            
            # 兼容：如果有使用 javax.* 包而 Spring Boot 3/4 需要 jakarta.*
            content = content.replace("import javax.servlet.", "import jakarta.servlet.")
            content = content.replace("import javax.annotation.", "import jakarta.annotation.")
            
            # 写入目标文件
            with open(dest_file_path, "w", encoding="utf-8") as f:
                f.write(content)

def copy_and_refactor_xml(src_dir, dest_dir):
    print(f"正在从 {src_dir} 迁移并重构 XML 映射文件...")
    os.makedirs(dest_dir, exist_ok=True)
    for file in os.listdir(src_dir):
        if not file.endswith(".xml"):
            continue
            
        src_file_path = os.path.join(src_dir, file)
        dest_file_path = os.path.join(dest_dir, file)
        
        with open(src_file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # 替换 XML 里的命名空间和实体类型路径
        content = content.replace("com.sky.mapper", "com.ruoyi.business.mapper")
        content = content.replace("com.sky.entity", "com.ruoyi.business.entity")
        content = content.replace("com.sky.dto", "com.ruoyi.business.dto")
        content = content.replace("com.sky.vo", "com.ruoyi.business.vo")
        
        # 写入目标文件
        with open(dest_file_path, "w", encoding="utf-8") as f:
            f.write(content)

if __name__ == "__main__":
    # 清理并创建目标文件夹
    if os.path.exists(DEST_JAVA_ROOT):
        shutil.rmtree(DEST_JAVA_ROOT)
    os.makedirs(DEST_JAVA_ROOT, exist_ok=True)
    
    if os.path.exists(DEST_XML_ROOT):
        shutil.rmtree(DEST_XML_ROOT)
    os.makedirs(DEST_XML_ROOT, exist_ok=True)
    
    # 迁移三大模块的 Java 代码
    copy_and_refactor_java(SRC_COMMON, DEST_JAVA_ROOT)
    copy_and_refactor_java(SRC_POJO, DEST_JAVA_ROOT)
    copy_and_refactor_java(SRC_SERVER, DEST_JAVA_ROOT)
    
    # 迁移 XML Mappers
    copy_and_refactor_xml(MAPPERS_XML, DEST_XML_ROOT)
    
    print("✅ 基础代码包迁移与重构完成！")
