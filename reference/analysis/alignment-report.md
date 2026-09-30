# 视频与项目复刻记录

参考：[原帖](https://x.com/dingyi/status/2100437892359462945)。卡片同源项目：[wildematt/flashcard](https://github.com/wildematt/flashcard)，提交 `9d60770c6a1a8d650d163650695e0ddd461d1ae`。这不是已经确认的作者定制工具源码。

## 原始数据

下载文件 `../reference.mp4`：1736×1080、H.264、9.566667 秒、549 个解码帧。名义帧率 60，实际帧间隔有变化，平均约 57.39 fps。时间标注来自 ffprobe 的 `best_effort_timestamp_time`，没有用帧号除以 30 或 60 来推算。

`frame-index.csv` / `frame-index.json` 含全部 549 帧的 PTS、相邻帧面板/卡面图像变化均值及近似区段标注。全部帧已经解码并计算变化；字段与视觉解释来自关键帧人工复核，并非声称人工逐一阅读了 549 张相同面板。`contact-sheet.jpg` 按约 0.5 秒取样。

## 时间线

| 时间/帧 | 观察 |
|---|---|
| 0.000 / 1 | Card、Colors 完整可见；Texture 的 Pattern 与上传按钮可见；卡片默认内容完整。 |
| 0.8–4.2 | 指针经过卡片，卡面绕 X/Y 轴倾斜，彩虹与箔面高光跟随，离开后弹性回正。 |
| 4.717 / 270 | 面板滚至 Texture；Scale 38%、Opacity 72%、Blend Normal、Emboss stroke 开启；Lighting 开始出现。 |
| 5.233 / 300 | Lighting 完整出现：Foil / Glare / Grain 都为 100%，Max tilt 10°。 |
| 5.767 / 330 | Content 与 Scene 完整可见。 |
| 6.283 / 360 | 再次验证 Content 字段；Logo 为 Star，Aurora background 开启。 |
| 6.6–7.1 | 面板向上滚回初始分组。 |
| 7.1–8.9 | 再次演示卡片倾斜与高光；没有可确认的参数值更改。 |
| 末段 | 浏览器顶部工具栏出现，录屏画面中的可用高度变化。 |

## 参数面板

| 分组 | 视频确认的字段及默认值 |
|---|---|
| Card | Ratio = Original · 292:423；Width = 292px；Corner radius = 28px；Ticket style = on；说明 Side punches and tear line。 |
| Colors | Pearl（选中）、Aurora、Rose、Abyss、Graphite；Primary #FFC9D8；Secondary #F3E7BD；Accent #C9B8EE；Gradient angle 200°。 |
| Texture | Pattern Rosette；Upload image…；Seamless tiles work best. Max 3 MB.；Scale 38%；Opacity 72%；Blend Normal；Emboss stroke on。 |
| Lighting | Foil 100%；Glare 100%；Grain 100%；Max tilt 10°。 |
| Content | Title Luminary Club；Subtitle Founding Member；Cardholder Alex Chen；Number 0042；Valid thru 2028.09；Text color #1B3326；Logo Star / Rings / None，选中 Star。 |
| Scene | Aurora background on；Animated WebGL light behind the card。 |
| 固定区域 | Customize；Live preview · auto-saved locally；Reset 图标；Import；Export。 |

未展开菜单的其余选项、滑杆最小/最大值、未选中预设的精确数值、按钮触发的文件格式无法从视频确认。本复刻实现了合理的可运行选项与 JSON 配置导入/导出；这些推定值见 `../../src/config.js`，与视频确认的默认值分开记录。

## 构图与材质

- 对照时使用 1416×880 CSS 像素视口；视频为屏幕录制后压缩缩放，约 1.226 倍图像比例。卡片静止包围盒约 292×423 CSS px，工作区居中；右栏约 380 CSS px。
- 黑色画布、接近黑色的面板、单像素分隔线、白色滑杆及开关，右侧正文约 13px。头部与页脚固定，中间面板独立滚动。
- 卡片包含渐变基底、原始箔纹、指针高光、周期 Rosette、浮雕暗线、颗粒、边缘反射、票券侧孔、撕线和内容。
- 从源帧的无文字区域提取 68×68 像素周期纹理，并分离亮线与暗线。此方法保留参考图案，不声称恢复原始矢量文件；压缩噪声和相位误差仍可能存在。

## 星形悬浮复核

`star-reference-frames.png` 展示 11 个时间点的原始局部。`star-parallax.json` 记录了基于卡边拟合的单应性与绿色标记重心估计。以卡面投影预测星形位置时，部分倾斜帧出现约 1–4 个源像素偏差。这支持细微视差的视觉判断，但边缘拟合、颜色变化和压缩误差意味着这些数值不能证明精确的物理高度。

实现将标记移出有 mask/overflow 的卡面容器，作为 `.card` 的并列子图层。父级保留 `transform-style: preserve-3d`，移除了会压平子层的父级 filter；标记使用 `translateZ(18px) scale(.97)`，位置按透视反投影补偿，保持静止构图。受光与微弱阴影独立更新，倾斜时产生真实投影差。18px 是拟合参数，未额外添加视频中没有的控制项。

## 验收结果与边界

功能：4 项配置测试通过；12 组真实浏览器测试通过，见 `browser-checks.json`。覆盖完整面板、独立悬浮图层、上传、导入导出、持久化、窄屏、键盘和减少动态效果，无丢失资源或 JavaScript 错误。

视觉：静止构图、已知字段/默认值、卡片比例、侧孔、渐变方向、纹理类别、信息布局及分层倾斜均有对应实现和截图。`comparison.jpg` 为并排复核。以下仍不作为像素一致通过：

1. 0.000s 起，纹理从视频提取后重新合成，细线对比度、干涉纹相位、字体栅格与局部颜色仍有差异。
2. 原始鼠标轨迹与动画相位未知，演示中的实时高光及极光不能逐帧完全重合；截图为对应界面状态，而非同一时刻的确定性视频回放。
3. 星形高度与动态阴影根据视觉拟合，无法确证原实现的参数。
4. 录屏系统白色边框、浏览器工具栏没有被加入应用界面。

结论：可运行的视觉复刻与交互验收通过；严格的逐像素、逐帧相同未通过/未宣称。没有使用 PSNR/SSIM 给不同鼠标状态和动画相位制造相似度分数。
