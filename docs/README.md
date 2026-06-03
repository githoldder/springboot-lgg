# Docs Workspace Rules

本目录只保留三类材料：原始输入源、文本中间层、最终交付文件夹。

## 目录结构

| 路径 | 用途 | 修改规则 |
| --- | --- | --- |
| `00-input-sources/` | 原始输入源：课程指导书、提交说明、参考模板、第八组参考材料 | 只读保存，不在此处改内容 |
| `01-text-workbench/` | 纯文本工作区：抽取文本、报告正文 txt、答辩记录 txt、截图占位符、粘贴脚本 | 后续主要修改都在这里进行 |
| `02-final-delivery/` | 最终交付：第五组 docx/pdf/源码包 | 手动打开 Word 后，按 txt 和截图占位符粘贴排版 |

## 工作原则

1. 不再依赖 LibreOffice 自动转换 docx/pdf。
2. Word 文件只作为最终排版容器。
3. 报告正文、答辩记录、截图说明先在 txt 中定稿。
4. 截图统一使用 `[截图占位符: Sxx-名称]` 标记。
5. 最终手动将 txt 内容和截图复制到 Word 模板中，再导出 PDF。

## 推荐流程

1. 运行 `01-text-workbench/scripts/extract_text_sources.py` 抽取原始材料文本。
2. 在 `01-report-txt/` 编写第五组设计报告正文。
3. 在 `02-defense-txt/` 编写每位成员答辩记录。
4. 在 `03-screenshot-placeholders/` 维护截图清单。
5. 手动打开 `02-final-delivery/reports/第五组/*.docx`，逐段粘贴 txt 内容和截图。
