---
name: officecli-word-workflow
description: OfficeCLI Word 文档注入与替换工作流。当需要使用 officecli 修改 Word (.docx) 文件时触发，包括表格单元格替换、正文段落注入、格式刷复制等场景。
---

# OfficeCLI Word 注入与替换工作流

## 核心原则

**先观察，再方案，再执行。** 绝不盲目写入。

## 工作流（严格按顺序执行）

### Phase 1: 观察 — 识别模版结构与现有格式

在对任何 `.docx` 文件进行修改前，**必须先完整观察**目标文档的结构和格式：

```bash
# 1. 查看文档大纲（段落数、表格数、图片数）
officecli view document.docx outline

# 2. 查看文档的纯文本内容（定位段落路径）
officecli view document.docx text

# 3. 获取目标节点的详细格式属性（JSON 输出）
officecli get document.docx "/body/tbl[1]/tr[2]/tc[1]" --json

# 4. 查询特定元素获取格式细节（如段落的 font、size、bold 等）
officecli get document.docx "/body/p[3]/r[1]" --json
```

**必须记录的格式属性（用于后续格式刷）：**
- `size` — 字号（如 `12pt`、`10.5pt`）
- `font.latin` / `font.ea` — 西文/中文字体
- `bold` / `italic` — 加粗/斜体
- `underline` — 下划线样式
- `color` — 字体颜色
- `align` — 段落对齐方式
- `lineSpacing` — 行间距
- `indent` — 缩进

### Phase 2: 输入源 — 确认 TXT 数据文件

**必须有明确的输入源 TXT 文件**。所有写入 Word 的内容都从 TXT 文件中读取和解析，不凭空生成。

- 输入源通常位于 `reports_txt/` 或类似的纯文本目录。
- 使用 Python 脚本通过正则解析 TXT 文件中的结构化段落（如"工作情况记录："、"体会与收获："等标记分割）。
- 解析后的数据作为 `officecli set` 或 `officecli add` 的输入值。

### Phase 3: 方案 — 制定替换/注入映射表

在执行前，必须明确列出完整的映射关系：

```
输入源 TXT 段落              →  目标 DOCX 路径                      →  操作类型
────────────────────────────────────────────────────────────────────────────────
txt["工作情况记录"]           →  /body/tbl[1]/tr[2]/tc[1]/p[1]      →  set (替换)
txt["学习体会"]               →  /body/tbl[1]/tr[3]/tc[1]/p[1]      →  set (替换)
txt["新增章节"]               →  /body/p[最后一段] 之后               →  add (追加)
```

### Phase 4: 格式刷 — 写入时复制模版格式

**这是最关键的一步。** Word 文档通常基于模版，注入新内容时必须保持与模版中已有内容一致的格式。

#### 替换操作（set）— 格式自动继承
当使用 `officecli set` 替换已有段落的 `text` 属性时，段落级格式（对齐、行距等）通常会保留。但如果原段落有多个 run，替换后会合并为单个 run，此时需要手动补刷 run 级格式：

```bash
# 替换文本后，刷上格式
officecli set document.docx "/body/tbl[1]/tr[2]/tc[1]/p[1]" --prop text="新内容"
officecli set document.docx "/body/tbl[1]/tr[2]/tc[1]/p[1]/r[1]" --prop size=12pt --prop font="宋体" --prop bold=false
```

#### 新增操作（add）— 必须显式指定格式
当使用 `officecli add` 追加新段落时，**必须从 Phase 1 中观察到的模版格式中复制属性**：

```bash
# 先观察模版中同类段落的格式
officecli get document.docx "/body/p[5]/r[1]" --json
# 假设观察到: size=12pt, font.ea=宋体, font.latin="Times New Roman", lineSpacing=1.5x

# 追加段落时完整复制格式
officecli add document.docx "/body" --type paragraph --prop text="新正文段落" --prop size=12pt --prop lineSpacing=1.5x
officecli set document.docx "/body/p[last()]/r[1]" --prop font="宋体" --prop size=12pt
```

#### 批量操作（batch）— 高效执行
当需要修改多个位置时，使用 batch 命令在单次 open/save 周期内完成：

```json
[
  {"command": "set", "path": "/body/tbl[1]/tr[2]/tc[1]/p[1]", "props": {"text": "新工作记录"}},
  {"command": "set", "path": "/body/tbl[1]/tr[2]/tc[1]/p[1]/r[1]", "props": {"size": "12pt", "font": "宋体"}},
  {"command": "set", "path": "/body/tbl[1]/tr[3]/tc[1]/p[1]", "props": {"text": "新学习体会"}},
  {"command": "set", "path": "/body/tbl[1]/tr[3]/tc[1]/p[1]/r[1]", "props": {"size": "12pt", "font": "宋体"}}
]
```

### Phase 5: 验证 — 确认写入结果

```bash
# 验证文本内容
officecli view document.docx text

# 验证格式属性
officecli get document.docx "/body/tbl[1]/tr[2]/tc[1]/p[1]/r[1]" --json
```

## 可控格式属性速查

| 属性 | 级别 | 示例值 | 说明 |
|------|------|--------|------|
| `text` | paragraph/run | `"内容"` | 纯文本 |
| `bold` | run | `true/false` | 加粗 |
| `italic` | run | `true/false` | 斜体 |
| `underline` | run | `single/double/dotted` | 下划线 |
| `size` | run | `12pt` / `10.5pt` | 字号 |
| `color` | run | `#FF0000` | 字体颜色 |
| `highlight` | run | `yellow` | 背景高亮 |
| `font` | run | `"宋体"` | 统一设置所有字体槽 |
| `font.latin` | run | `"Times New Roman"` | 西文字体 |
| `font.ea` | run | `"宋体"` | 中文字体 |
| `align` | paragraph | `center/left/right` | 段落对齐 |
| `lineSpacing` | paragraph | `1.5x` / `18pt` | 行间距 |
| `indent` | paragraph | `2cm` | 左缩进 |

## 注意事项

1. **合并单元格**：Word 表格中存在 colspan 合并单元格时，`tc` 索引可能不连续。必须用 `officecli get ... --json` 先确认实际可用的 `tc[N]` 路径。
2. **段落路径**：使用 `officecli view ... text` 获取每个段落的 `@paraId` 路径，避免用错误的索引定位。
3. **保存时机**：`officecli batch` 和 `officecli set` 均会自动保存。如果使用 `officecli open` 常驻模式，需要手动 `officecli save` 或 `officecli close` 刷盘。
4. **格式一致性**：写入后务必用 `get --json` 抽查至少一个修改过的 run，确认格式属性与模版一致。
