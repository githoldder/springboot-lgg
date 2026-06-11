# 绿果果品牌与 MinIO 静态资源清单

## 品牌定位

绿果果面向生鲜水果零售与即时配送场景，品牌关键词为新鲜、轻量、可信、快速。Logo 采用青柠切片、叶片和配送动线构成，表达“鲜果零售 + 即时配送 + 绿色健康”的产品定位。

## 本地设计资产

| 文件 | 用途 |
| --- | --- |
| `greenfruit-logo.svg` | 品牌主标，可用于报告、PPT、登录页头图或运营物料。 |
| `greenfruit-logo.png` | 主标 PNG 导出版本。 |
| `greenfruit-icon.svg` | 方形品牌图标，可用于后台侧边栏、小程序门店 Logo、favicon。 |
| `greenfruit-icon.png` | 方形图标 PNG 导出版本。 |

## 外部真实静态资源

| 文件 | 来源 | 用途 |
| --- | --- | --- |
| `../brand-source/pexels-sliced-lime-9228154.jpg` | Pexels 图片页：https://www.pexels.com/photo/photo-of-a-sliced-lime-on-a-green-surface-9228154/ | 登录页与品牌视觉背景。 |
| `../brand-source/pexels-mixed-fruit-basket-37022356.jpg` | Pexels 图片页：https://www.pexels.com/photo/vibrant-basket-of-mixed-fresh-fruits-37022356/ | 商品展示、报告配图、运营页面素材。 |
| `/Users/caolei/Library/Containers/com.tencent.qq/Data/Downloads/mmexport1780767857843.jpg` | 用户提供参考图 | 仅作为青柠方向参考，不直接写入项目源码。 |

## 已上传 MinIO 资源

| 资源 | MinIO URL |
| --- | --- |
| 品牌主标 PNG | http://127.0.0.1:9000/greenfruit/03308238014f49739a302560ffaf714c.png |
| 品牌图标 PNG | http://127.0.0.1:9000/greenfruit/ff8dd63f2c16498f9a2f2840a4463044.png |
| 青柠背景图 | http://127.0.0.1:9000/greenfruit/0e2c87280b94463a8b35231f739dd7ee.jpg |
| 混合水果篮图 | http://127.0.0.1:9000/greenfruit/034750060be74f7f9053b27274401fc3.jpg |

## 已接入位置

| 位置 | 改造内容 |
| --- | --- |
| `ruoyi-vue-lgg-frontend/src/assets/logo/logo.png` | 替换为新的绿果果方形品牌图标。 |
| `mp-weixin/static/logo.png` | 替换为新的绿果果方形品牌图标。 |
| `ruoyi-vue-lgg-frontend/src/views/login.vue` | 登录页背景改为 MinIO 青柠背景图。 |
| `ruoyi-vue-lgg-frontend/src/views/register.vue` | 注册页背景改为 MinIO 青柠背景图。 |

## 当前注意事项

MinIO 服务通过 PM2 运行在本地 9000/9001 端口。上传接口已通过 `ruoyi-admin /common/upload` 真实写入对象存储，返回 code = 200。测试过程中本地 9000 端口存在偶发瞬时拒连，正式演示前应先执行 `curl --noproxy '*' -sS http://127.0.0.1:9000/minio/health/live` 检查健康状态。
