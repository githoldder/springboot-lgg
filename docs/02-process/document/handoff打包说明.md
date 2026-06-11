# handoff 打包说明

## 压缩方式

handoff 目录使用 **Python `zipfile`（UTF-8 标准编码）** 打包，文件名以 Unicode 标准存储，与 macOS 自带 `zip` 不同（后者在 Windows 下中文必乱码）。

## Windows 用户解压

| 工具 | 中文文件名 | 下载 |
|------|:--:|------|
| **7-Zip**（推荐） | ✅ | https://www.7-zip.org/ |
| **WinRAR** | ✅ | https://www.winrar.com/ |
| **Bandizip** | ✅ | https://www.bandisoft.com/bandizip/ |
| Windows 11 资源管理器 | ✅ | 自带 |
| Windows 7/XP 资源管理器 | ❌ | 需装 7-Zip |

## Mac 用户解压

双击即可，系统自带 Archive Utility 无问题。

## 内容结构

```
handoff/
├── README.md
├── 02-process/
│   ├── txt/              # 论文纯文本（分章）
│   │   ├── 00-report-master.txt
│   │   ├── chapters/     # 各章节 txt
│   │   └── defense/      # 四位成员答辩稿
│   └── Figure/screenshots/  # 截图素材
└── 03-report/
    ├── doc/
    └── pdf/              # 最终 PDF
```

## 验证文件完整性

```bash
# Mac/Linux
unzip -l springboot-lgg-handoff.zip | grep -c '^[0-9]'

# Windows（7-Zip 命令行）
7z l springboot-lgg-handoff.zip | tail -1
```
