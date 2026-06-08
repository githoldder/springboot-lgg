---
name: wechat-miniprogram
description: 微信小程序开发运维技能。处理小程序编译、IDE调试、静态资源管理、后端网关对接、E2E监控、PM2服务管理、tabBar与组件配置等场景。当用户需要开发/修复/部署微信小程序时使用，特别是uni-app编译输出项目的手动运维。
---

# 微信小程序开发运维

针对 uni-app 编译输出的小程序项目（mp-weixin 目录）进行手动运维、调试、修复和部署。

## 架构通信链

小程序与后端通信链路：
```
mp-weixin (微信开发者工具模拟器)
    ↓ HTTP (baseUrl = localhost:8090)
ruoyi-gateway (PM2, port 8090)
    ↓ Nacos 路由
ruoyi-business (PM2, port 8088)
ruoyi-admin (PM2, port 8081)
```

所有后端服务通过 PM2 管理，端口映射：
| 服务 | PM2 名称 | 端口 |
|------|----------|------|
| Nacos | nacos | 8848 |
| Redis | redis | 6379 |
| MinIO | minio | 9000 |
| 网关 | gateway | 8090 |
| 业务服务 | business | 8088 |
| 管理后台 | admin | 8081 |
| 支付服务 | pay | 8086 |
| 通知服务 | notice | 8087 |

## 核心工作流

### 1. PM2 服务管理

```bash
# 检查所有服务状态
pm2 list

# 停止所有服务
pm2 delete all

# 重启单个服务
pm2 restart gateway

# 查看日志
pm2 logs business --lines 50
```

### 2. 小程序 IDE 调试

```bash
# 项目路径
PROJECT="/path/to/mp-weixin"

# 打开项目
"/Applications/wechatwebdevtools.app/Contents/MacOS/cli" open --project "$PROJECT"

# 开启自动编译
"/Applications/wechatwebdevtools.app/Contents/MacOS/cli" auto --project "$PROJECT"

# 清除全部缓存
"/Applications/wechatwebdevtools.app/Contents/MacOS/cli" cache -c all --project "$PROJECT"

# 关闭项目
"/Applications/wechatwebdevtools.app/Contents/MacOS/cli" close --project "$PROJECT"

# 预览/上传
"/Applications/wechatwebdevtools.app/Contents/MacOS/cli" preview --project "$PROJECT"
"/Applications/wechatwebdevtools.app/Contents/MacOS/cli" upload --project "$PROJECT" --version 1.0.0 --desc "描述"
```

### 3. 资源与配置管理

#### 3.1 tabBar 配置 (app.json)

```json
"tabBar": {
  "color": "#999999",
  "selectedColor": "#009E81",
  "backgroundColor": "#FFFFFF",
  "list": [
    {
      "pagePath": "pages/index/index",
      "iconPath": "static/brand-icon.png",
      "selectedIconPath": "static/brand-icon.png",
      "text": "首页"
    }
  ]
}
```

#### 3.2 图标尺寸规范
- tabBar 图标必须 ≤ 40KB，推荐 81×81px
- 超出会触发 IDE 警告"图标超过 40KB"
- 使用 macOS `sips` 命令调整：

```bash
# 查看当前尺寸
sips -g pixelWidth -g pixelHeight image.png

# 缩放
sips --resampleWidth 81 image.png --out resized.png
```

#### 3.3 packOptions.ignore (project.config.json)

避免将 `node-modules/`、`node_modules/`、`.map` 文件打包：
```json
"packOptions": {
  "ignore": [
    { "type": "suffix", "value": ".map" }
  ]
}
```

**关键规则**：
- 如果页面使用了 `uni-ui` 等组件（如 `uni-list-item`, `uni-easyinput`），其 JSON 组件声明路径指向 `node-modules/`，
  则 **不能忽略** `node-modules/` 文件夹（`"value": "node-modules/"`），否则编译时会报"未找到组件"错误。
- `.map` 后缀始终可以忽略。

#### 3.4 urlCheck 与域名校验

开发环境下关闭域名校验：
```json
"setting": {
  "urlCheck": false,
  "checkSiteMap": false
}
```

当遇到 `ETIMEDOUT` 错误时检查：
1. 后端服务是否已启动（pm2 list）
2. urlCheck 是否为 false
3. 请求是否被代理/VPN 拦截

### 4. 认证与 API 通信

```js
// baseUrl 定义在 utils/env.js，实际值在编译后的 vendor.js 中
const baseUrl = 'http://localhost:8090'

// 登录流程
uni.login() → POST /user/user/login → 返回 JWT token

// 公开接口（无需 token）
GET  /user/shop/status
POST /user/user/login
GET  /user/common/download

// 保护接口（需 token header）
GET  /user/category/list
GET  /user/dish/list
POST /user/order/submit
```

模拟登录：
```bash
# 通过后端 API 直接模拟
curl -X POST http://localhost:8090/user/user/login \
  -H "Content-Type: application/json" \
  -d '{"code":"mock-test-code"}'
```

### 5. E2E 监控脚本

创建 `scripts/e2e_miniprogram_test.js`，使用 Node.js 进行边界监控，不依赖 `miniprogram-automator`（该库 require 时会阻塞 IDE 端口）。

检查清单：
1. 配置验证：app.json 有效性、project.config.json 完整性
2. 资源验证：所有引用图片是否存在、尺寸是否合规
3. 网络验证：后端 API 是否可达
4. 认证验证：登录接口是否正常
5. 环境验证：模拟器/真机环境是否正常

### 6. 常见问题排查

| 现象 | 原因 | 解决 |
|------|------|------|
| 模拟器空白只有 tabBar | 编译错误/组件未找到 | 检查 Console 错误；移除 node-modules 的 ignore 规则；清除缓存重新编译 |
| ETIMEDOUT | 后端未启动 或 urlCheck=true | `pm2 list` 检查服务；`urlCheck: false` |
| 图标超过 40KB 警告 | 图片太大 | `sips --resampleWidth 81` 缩放 |
| IDE 打不开项目 | 进程残留/端口冲突 | `pkill -f wechatwebdevtools` 后重试 |
| node-modules 相关编译错误 | 组件路径被忽略 | 从 packOptions.ignore 移除 node-modules/ |
| `wx.getSystemInfoSync is deprecated` | 基础库版本 | 不影响运行，可忽略或升级到新 API |
| login 返回 ok 但看不到页面 | 缓存问题 | 清除编译缓存 (`cache -c all`) |

### 7. IDE 提示与 Log 解读

**重要**：在开发者工具的 **Console** 面板可以看到：
- `App Launch` / `App Show`：应用生命周期
- `login:ok {code: "..."}`：登录成功
- `Error: timeout`：可能是请求超时，检查后端
- `TypeError: xxx is not a function`：运行时数据格式错误

在 **Network** 面板查看：
- 请求是否发出
- 响应状态码
- 响应数据格式

### 8. 数据格式异常处理

**常见运行时错误**：
- `data.some is not a function`：data 是 Object 而非 Array → 确保 API 返回数组格式
- `data.map is not a function`：data 是 Object 而非 Array → 检查 API 响应的结构
- `Cannot read property 'xxx' of undefined`：响应嵌套路径缺失 → 用可选链或默认值

解决方案：在对应页面的 onLoad/init 函数中对 API 响应做防御性检查：
```js
const list = res.data || []
// 或者安全访问嵌套属性
const items = res?.data?.records ?? []
```

## Skillset 边界

- ✅ 小程序 IDE CLI 操作
- ✅ 配置文件修改 (app.json, project.config.json)
- ✅ 静态资源管理 (图片压缩、缩放、替换)
- ✅ PM2 后端服务管理
- ✅ 后端 API 对接与调试
- ✅ E2E 边界监控脚本编写
- ✅ 编译错误排查
- ❌ uni-app 源码级开发（不修改 src 目录，仅操作编译输出）
- ❌ 非微信小程序平台（支付宝/百度/头条）
- ❌ iOS/Android 原生开发
