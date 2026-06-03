# Docs 文档工作区规范

本文档总结当前项目采用的文档工作流，可迁移到其他课程设计、实验报告、课程大作业和长期项目中。

## 1. 核心思想

文档目录采用 IPO 结构。

I 是 Input，放原始输入源。

P 是 Process，放中间处理材料。

O 是 Output，放最终交付物。

对应目录为：

```text
docs/
  01-resource/
  02-process/
  03-report/
```

这样做的目的，是把“老师给的文件”“AI 和人一起处理的文本”“最终交付给老师的文件”彻底解耦。

## 2. 标准目录结构

```text
docs/
  README.md
  docs-workspace-standard.md

  01-resource/
    requirement.docx
    template.docx
    reference.pdf
    submit-guide.md

  02-process/
    README.txt

    Figure/
      README.txt
      screenshot-checklist.txt
      screenshots/
      pdf-pages/

    prompt/
      report-agent-prompt-template.txt

    data/
      README.txt
      extracted-sources/

    script/
      README.txt
      extract_text_sources.py

    document/
      README.txt
      report-txt/
      defense-txt/
      process-notes/
      paste-script.txt

  03-report/
    reports/
    source/
    pdf/
```

## 3. 01-resource 规则

`01-resource` 只放原始输入源。

常见文件包括课程指导书、提交说明、Word 模板、PDF 参考报告、老师给的代码包、示例截图等。

规则如下：

1. 原始输入源只读保存。
2. 不直接修改老师给的 docx、pdf、md。
3. Word 临时文件、系统缓存文件不作为有效输入。
4. 如果原始材料涉及他人姓名、学号、参考报告内容，可以本地保存，但不建议推送到远端仓库。

## 4. 02-process 规则

`02-process` 是主要工作区。

这里放所有可编辑文本、中间数据、截图清单、提示词模板和脚本。

### 4.1 Figure

Figure 用于管理截图和 PDF 页面图。

`screenshot-checklist.txt` 记录报告需要哪些截图。

`screenshots` 放实际截图文件。

`pdf-pages` 放从 PDF 渲染出的页面图。

正文中使用统一占位符：

```text
[截图占位符: S01-PM2服务状态]
```

### 4.2 prompt

prompt 放可复用提示词模板。

提示词模板必须与具体课程内容解耦，方便迁移到其他项目。

模板通常包含：

1. 读取 `docs/01-resource`。
2. 明确最终目标是交付 Word、PDF、答辩记录和源码。
3. 要求正文先写 txt。
4. 要求截图使用占位符。
5. 要求最终 Word 由人工粘贴排版。

### 4.3 data

data 放中间数据。

`extracted-sources` 用于保存从 docx、pdf、md 抽取出的 txt 文本。

抽取规则：

1. 同一材料同时存在 docx 和 pdf 时，优先读取 pdf。
2. PDF 转 txt 时保留页码标注，例如 `--- PAGE 1 ---`。
3. 抽取文本只用于参考，不直接作为最终报告正文。

### 4.4 script

script 放简单脚本。

原则是能用简单脚本解决的问题，不引入复杂自动化。

常见脚本包括：

1. 文本抽取脚本。
2. 目录检查脚本。
3. 截图清单校验脚本。
4. 报告文本统计脚本。

### 4.5 document

document 放最终要粘贴进 Word 的纯文本。

`report-txt` 放报告正文母版。

`defense-txt` 放个人答辩记录。

`process-notes` 放架构选型、过程说明和中间判断。

`paste-script.txt` 放人工粘贴 Word 的步骤。

## 5. 03-report 规则

`03-report` 只放最终交付物。

常见内容包括：

1. 最终 docx。
2. 最终 pdf。
3. 源码压缩包。
4. 第五组或小组专属交付文件夹。

规则如下：

1. 最终 Word 由人工打开模板后粘贴。
2. 不使用 LibreOffice 批量生成最终报告。
3. PDF 由 Word 手动导出。
4. 最终文件命名必须包含班级、组别、项目名或成员姓名学号。

## 6. 文本写作规则

课程报告正文优先使用纯 txt。

除非明确要求，不让 AI 默认生成过多 Markdown 风格。

需要避免的常见痕迹：

```text
大量项目符号
大量加粗符号
大量代码块
过密的小标题
机械式三段论
```

推荐方式：

1. 摘要、背景、设计说明尽量使用自然段。
2. 技术选型和目录规范可以使用表格或分点。
3. 最终粘贴 Word 前，删除不必要的 Markdown 语法。
4. 图片位置用截图占位符，不直接让 AI 生成 Word 图片排版。

## 7. Git 与远端规则

长期项目必须使用 Git 管理。

建议规则：

1. 原始参考材料如涉及他人内容，放本地 ignore。
2. 可复用的 txt、脚本、规范文档可以提交。
3. 每完成一个明确任务后提交一次 commit。
4. 主分支保持可演示、可交付。
5. 高风险实验放独立分支。

## 8. Agent 工作规则

Agent 每次处理文档前，应先读取：

1. `docs/README.md`
2. `docs/docs-workspace-standard.md`
3. `docs/02-process/README.txt`
4. `docs/02-process/document/paste-script.txt`
5. 当前任务相关的 txt 母版

Agent 修改规则：

1. 优先修改 `02-process/document` 中的 txt。
2. 不直接改最终 Word，除非用户明确要求。
3. 不直接改原始输入源。
4. 需要截图时，只新增截图占位符和截图清单。
5. 需要自动化时，只写简单脚本，避免过度工程化。

## 9. 当前项目映射

当前项目 `springboot-lgg` 的成员信息为：

```text
23软一 23030301 曹磊
23软一 23030302 陈佳明
23软一 23030303 陈晓楠
23软一 23030304 程志阳
```

当前报告正文母版：

```text
docs/02-process/document/report-txt/00-report-master.txt
```

当前答辩记录：

```text
docs/02-process/document/defense-txt/member1-defense.txt
docs/02-process/document/defense-txt/member2-defense.txt
docs/02-process/document/defense-txt/member3-defense.txt
docs/02-process/document/defense-txt/member4-defense.txt
```

当前截图清单：

```text
docs/02-process/Figure/screenshot-checklist.txt
```

当前最终交付目录：

```text
docs/03-report/reports/第五组/
```

