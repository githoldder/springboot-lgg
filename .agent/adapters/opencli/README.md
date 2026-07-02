# OpenCLI Adapter

**仓库地址**: https://github.com/jackwener/OpenCLI
**官方文档**: https://opencli.info
**当前状态**: 已配置，按需启用

## 简介

OpenCLI 将任何网站转换为 CLI，并使用您已登录的浏览器运行 AI 代理。支持 100+ 网站适配器，可作为环境执行桥使用。

## 核心特性

- **网站适配器**: 内置 100+ 网站支持
- **浏览器自动化**: AI 代理可通过已登录 Chrome 操作网站
- **CLI 中心**: 统一管理 gh、docker、vercel 等本地工具
- **桌面应用适配器**: 支持 Cursor、Trae、ChatGPT 等 Electron 应用

## 安装

```bash
# npm 全局安装
npm install -g @jackwener/opencli

# 或下载 OpenCLIApp (推荐 macOS/Windows)
# https://opencli.info/download

# 验证安装
opencli doctor
```

## 浏览器桥接扩展

1. 从 [Chrome Web Store](https://chromewebstore.google.com/detail/opencli/ildkmabpimmkaediidaifkhjpohdnifk) 安装
2. 或手动安装：下载扩展 → `chrome://extensions` → 开发者模式 → 加载已解压的扩展

## 默认工作流

1. **环境检查**: 确认浏览器连接
   ```bash
   opencli doctor
   ```

2. **执行操作**: 使用内置适配器或浏览器命令
   ```bash
   opencli hackernews top --limit 5
   opencli browser work open https://example.com
   ```

3. **数据提取**: 获取结构化数据
   ```bash
   opencli bilibili hot -f json
   opencli browser work extract ".content"
   ```

4. **审计记录**: 生成操作报告
   ```bash
   # 操作日志会自动记录
   ```

## 支持网站

| 类别 | 网站 |
|------|------|
| 社交媒体 | 小红书、B站、知乎、Twitter、Reddit、LinkedIn |
| 新闻资讯 | HackerNews、少数派、虎扑 |
| 电商平台 | 淘宝、京东、1688、拼多多 |
| AI 工具 | Claude、Gemini、NotebookLM |
| 开发工具 | GitHub、Vercel、Docker |
| 更多 | 100+ 网站持续更新中 |

## 常用命令

```bash
# 查看所有命令
opencli list

# 使用内置适配器
opencli hackernews top --limit 5
opencli bilibili hot --limit 5
opencli xiaohongshu search "关键词"

# 浏览器操作
opencli browser work open https://example.com
opencli browser work click "button.submit"
opencli browser work extract ".content"
opencli browser work type "input[name=q]" "search term"

# 下载内容
opencli xiaohongshu download "https://..." --output ./xhs
opencli bilibili download BV1xxx --output ./bilibili

# 输出格式
opencli bilibili hot -f json    # JSON 格式
opencli bilibili hot -f csv     # CSV 格式
opencli bilibili hot -f md      # Markdown 格式
```

## AI 代理集成

```bash
# 安装技能到 AI 代理
npx skills add jackwener/opencli

# 或单独安装特定技能
npx skills add jackwener/opencli --skill opencli-browser
npx skills add jackwener/opencli --skill opencli-adapter-author
npx skills add jackwener/opencli --skill opencli-autofix
```

## 使用场景

- **数据采集**: 从社交媒体、电商平台获取数据
- **自动化操作**: 批量点赞、关注、发布
- **内容监控**: 监控特定页面变化
- **表单填写**: 自动化表单提交

## 注意事项

- 需要 Chrome 浏览器和 OpenCLI 扩展
- 首次使用需要登录目标网站
- 敏感操作需要 L3/L4/L5 权限审批
- 操作记录会自动写入 `sense/reports/`
