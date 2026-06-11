# 绿果果报告正文扩写与格式化防踩坑指南

本目录（`docs/02-process/document/report-txt/`）用于托管最终大作业设计报告的纯文本正文内容（以便于后续复制粘贴到 Word 报告模版中进行终装）。为确保正文排版在 Word 中完美呈现、避免重复清洗的劳动成本，任何编辑本目录下 `.txt` 分章报告文件的 Agent 与协作人员，**必须严格遵守并执行本指南中的规范**。

## 核心规避原则与防踩坑细节

### 1. 严禁使用任何 Markdown 列表语法 (No Markdown Lists)
* **避坑原理**：
  在 Markdown 中，`- `、`* ` 或 `1. ` 开头的列表能够被渲染引擎优雅展示。然而，在直接复制纯文本至 Microsoft Word 中时，这些格式化列表不会被 Word 自动识别，而是退化为带着反人类短划线或数字点号的碎散行段，极大地破坏了学术报告与设计文档的严谨性。
* **规范要求**：
  * 严禁在分章报告中写出任何以 `- ` 或 `* ` 开头的列表行。
  * 严禁写出任何以 `1. `、`2. ` 等“数字+点号+空格”开头的段落。
  * **替代方案**：将所有的列举、分项阐述的内容，完全重构为**连续流动的段落叙述体（Paragraph-style）**。如果在段落叙述中必须区分先后次序，请直接内嵌在句子中，并使用标准的中文顿号（如 `第一、`，`第二、`，`其一、`，`其二、`）或中点号（`·`）等纯中文富文本符号，确保粘贴至 Word 后浑然一体，无需二次返工排版。

### 2. 严禁使用任何 Markdown 反单引号与代码标记 (No Backticks)
* **避坑原理**：
  在大作业报告中提及 Java 类名（如 `OrderServiceImpl`）、包名、文件名、端口（如 `8090`）或特定的属性配置时，Agent 的生成逻辑通常会自动使用反单引号（`` ` ``）进行语法包裹。这会导致复制后的纯文本中布满零散难读的反单引号字符。
* **规范要求**：
  * 整个分章报告中绝对不允许包含任何反单引号字符。
  * **替代方案**：对于任何代码符号、包名或接口，直接以纯文本输出（例如直接输出 `OrderServiceImpl`），或者使用中文双引号（“OrderServiceImpl”）或中文方括号（【OrderServiceImpl】）进行表述，严禁夹带任何反单引号。

### 3. 截图占位符与工程图占位符联动修改规则 (Placeholder Consistency)
* **避坑原理**：
  大作业报告中需要图文并茂，遇到需要配图的位置，系统定义了标准的纯文本占位符来进行定位。如果各文件间的占位符不一致，会导致拼装或后续截图工具报错。
* **规范要求**：
  * 截图类占位符统一使用格式：`[截图占位符: Sxx-名称]`（如 `[截图占位符: S01-PM2服务运行状态]`）
  * UML工程图类占位符统一使用格式：`[工程图占位符: Uxx-名称]`（如 `[工程图占位符: U01-系统架构图]`）
  * **联动修改链路**：如果因为扩写或逻辑微调，修改、增删了任何占位符，**必须同步在以下三个位置进行一致性更新**：
    1. `docs/02-process/document/report-txt/chapters/*.txt`（分章正文对应位置）
    2. `docs/02-process/Figure/screenshot-checklist.txt`（截图清单总账，用于人工查对）
    3. `docs/02-process/Figure/screenshot-capture-script.txt`（截图采集自动化脚本，用于自动运行）
  * 修改完成后，必须在终端按序运行下方命令，进行重新拼装和严格的占位符校验：
    ```bash
    # 重新装配拼装最终报告
    bash docs/02-process/script/assemble_report_txt.sh
    # 严格检验占位符与清单是否一致
    bash docs/02-process/script/check_screenshot_placeholders.sh
    ```

## 自动化双重审查命令 (Double-check Scripts)

为防止意外引入 Markdown 语法，在装配报告前，**必须**在仓库根目录下运行以下命令进行审查，如果输出任何内容，则说明格式不合格，需定位对应的行进行修复：

```bash
# 1. 检查是否含有反单引号 (应无输出)
grep -n '`' docs/02-process/document/report-txt/chapters/*.txt

# 2. 检查是否含行首 Markdown 列表标记 (应无输出)
grep -nE '^[ \t]*[-*] |^[ \t]*[0-9]+\. ' docs/02-process/document/report-txt/chapters/*.txt
```

## 清洗工具代码片段

协作时若发现历史章节中有零碎的不合规字符，可运行以下 Python 脚本片段批量处理各章节：

```python
import re
import pathlib

def clean_file(file_path):
    content = file_path.read_text(encoding="utf-8")
    
    # 1. 清洗掉所有的反单引号
    content = content.replace("`", "")
    
    # 2. 将行首 Markdown 列表 `- ` 或 `* ` 转换为顿号或合并为段落叙述体
    content = re.sub(r'^[ \t]*[-*][ \t]+', '· ', content, flags=re.MULTILINE)
    
    # 3. 将行首 Markdown 序号 `1. ` 等转换为中文括号或顿号
    content = re.sub(r'^[ \t]*(\d+)\.[ \t]+', r'\1、', content, flags=re.MULTILINE)
    
    file_path.write_text(content, encoding="utf-8")

# 批量执行
for p in pathlib.Path("docs/02-process/document/report-txt/chapters").glob("*.txt"):
    clean_file(p)
```
