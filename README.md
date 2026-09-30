# Luminary Card Customizer


## 运行

需要 Node.js 20 或更新版本。在本目录运行：

```sh
npm run dev
```

打开 http://127.0.0.1:5173 。如端口被占用，运行 `PORT=5174 npm run dev`。

也可使用任意静态 HTTP 服务器，例如 `python3 -m http.server 5173 --bind 127.0.0.1`。页面使用 ES modules，请通过 HTTP 打开，而非直接双击 index.html。

## 已实现

- Card：比例、宽度、圆角、票券侧孔与撕线。
- Colors：Pearl / Aurora / Rose / Abyss / Graphite，三种颜色、渐变角度。
- Texture：Rosette 等纹理、上传、缩放、透明度、混合模式、浮雕。
- Lighting：箔面、眩光、颗粒、最大倾斜。
- Content：标题、副标题、持卡人、编号、有效期、文字颜色、Star / Rings / None。
- Scene：WebGL 极光背景开关，WebGL 不可用时显示 CSS 背景。
- 实时预览、浏览器本地保存、JSON 导入/导出、恢复默认值。
- 触屏交互、移动端布局、键盘方向键倾斜、Escape / Home 回正、减少动态效果偏好。

星形是 `.card` 下与 `.card-surface` 并列的独立 3D 图层，使用 `translateZ(18px)`，并补偿静止时的透视投影位置。卡面倾斜会产生相对视差；标记具有单独的金属渐变、受光变化与轻微阴影。18px 是根据视频中数像素的相对位移拟合的实现值，不是获取到的原项目源码参数。

上传图片限制为 3 MB；导入前将图像解码并规范化为 PNG，最长边 1024px。配置导出会携带自定义图片，可完整迁移。所有处理在本地浏览器进行，不需要后端、账号或 API key。

## 文件

- `index.html`：卡片层级与主工作区。
- `src/app.js`：面板、状态、图片与配置导入导出。
- `src/config.js`：默认值、预设、范围及导入校验。
- `src/styles.css`：布局、光学材质和独立 Logo 图层。
- `src/motion.js`：弹簧倾斜、光线跟踪与标记受光。
- `src/aurora.js`：从同源 GitHub 项目取得并调整配色的 WebGL 极光。
- `assets/`：本地字体、箔面、从参考视频提取的周期纹理及来源说明。

## 验证

```sh
npm test
```

4 项配置校验测试通过。另以独立 Chrome 会话通过 12 组浏览器验收，覆盖全部面板、悬浮层、上传、导入导出、本地保存、窄屏和减少动态效果；证据位于`reference/analysis/browser-checks.json`。

## 对齐范围

视频共 549 个解码帧，时长 9.566667 秒。已保存每帧真实 PTS、变化记录、关键帧、面板字段表及星形视差估计。

视频可见的标签、默认值、分组与主要交互已实现。未找到作者的完整定制面板源码，因此未展开的下拉选项、其他配色的精确参数、范围边界和导出格式采用了可用实现。当前是有对照证据的视觉复刻，不能声称与原项目逐像素一致。录屏的系统边框、鼠标轨迹和浏览器工具栏不属于应用界面。

代码与素材来源、字体许可见 [THIRD_PARTY.md](THIRD_PARTY.md)。

## 参考资料

`reference/reference.mp4` 保存原视频；`reference/analysis/index.html` 是逐帧播放器；`reference/analysis/alignment-report.md` 是对照报告。运行本项目后也可访问 `/reference/analysis/index.html`。
