# OfficeCLI Adapter

**仓库地址**: https://github.com/iOfficeAI/OfficeCli
**官方文档**: https://officecli.ai
**当前状态**: 已配置，按需启用

## 简介

OfficeCLI 是首个专为 AI 代理设计的 Office 套件，可读取、编辑和自动化 Word、Excel、PowerPoint 文件。单二进制文件，无需 Office 安装。

## 核心特性

- **单二进制**: 无依赖，跨平台 (macOS/Linux/Windows)
- **AI 原生**: CLI + JSON 接口，专为 AI 代理设计
- **内置渲染引擎**: 高保真 HTML/PNG 渲染，无需 Office
- **三层架构**: L1 Read → L2 DOM → L3 Raw XML

## 安装

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/iOfficeAI/OfficeCLI/main/install.sh | bash

# Windows (PowerShell)
irm https://raw.githubusercontent.com/iOfficeAI/OfficeCLI/main/install.ps1 | iex

# 验证安装
officecli --version
```

## 默认工作流

1. **L1 Read/View**: 先查看文档结构
   ```bash
   officecli view document.docx outline
   officecli view document.docx text
   ```

2. **L2 DOM Edit**: 批量修改元素
   ```bash
   officecli get document.docx /body/p[1] --json
   officecli set document.docx /body/p[1]/r[1] --prop text="New Text"
   ```

3. **L3 Raw XML**: 仅在必要时使用
   ```bash
   officecli raw document.docx '/body/p[1]'
   ```

4. **Render Gate**: 生成截图/PDF/HTML 预览并记录证据
   ```bash
   officecli view document.docx html -o /tmp/preview.html
   officecli view document.docx screenshot -o /tmp/screenshot.png
   ```

## 支持格式

| 格式 | 读取 | 修改 | 创建 | 渲染 |
|------|------|------|------|------|
| Word (.docx) | ✓ | ✓ | ✓ | ✓ |
| Excel (.xlsx) | ✓ | ✓ | ✓ | ✓ |
| PowerPoint (.pptx) | ✓ | ✓ | ✓ | ✓ |

## 常用命令

```bash
# 创建文档
officecli create deck.pptx
officecli create document.docx

# 添加内容
officecli add deck.pptx / --type slide --prop title="Q4 Report"
officecli add deck.pptx '/slide[1]' --type shape --prop text="Revenue grew 25%"

# 模板合并
officecli merge template.docx output.docx '{"key": "value"}'

# 批量操作
echo '[{"command":"set","path":"/slide[1]/shape[1]","props":{"text":"Hello"}}]' | officecli batch deck.pptx --json

# 实时预览
officecli watch deck.pptx
```

## AI 集成

```bash
# MCP 服务器配置
officecli mcp claude       # Claude Code
officecli mcp cursor       # Cursor
officecli mcp vscode       # VS Code / Copilot
```

## 使用场景

- **报告生成**: 从数据库/API 自动生成报告
- **文档批处理**: 批量查找/替换、样式更新
- **模板填充**: 设计一次模板，填充 N 次数据
- **质量检查**: 验证文档结构和格式问题

## 注意事项

- 修改文件后使用 `officecli save` 刷新到磁盘
- 大文件建议使用 resident 模式减少延迟
- 复杂操作建议先 `view outline` 了解结构
