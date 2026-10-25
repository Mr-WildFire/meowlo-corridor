# 顶部 HUD 正式皮肤 Prompt

> 目标：替换当前 Graphics 顶栏，做 1920×1080 横屏 HUD  
> 原则：**AI 只出底材质和图标，不出文字、不出整套 UI**  
> 布局和文字在 Cocos/Figma 里完成

## 0. 分件清单

| 资源 | 生成 | 导出 | 说明 |
|---|---:|---:|---|
| 顶栏底 | 2048×256 | 1920×72 | 全宽、无圆角、无文字 |
| 音轨图标 | 512×512 | 64×64 | 黑胶 + 碎片 |
| 时间图标 | 512×512 | 64×64 | 怀表 |
| 步数图标 | 512×512 | 64×64 | 猫爪 |
| 种子图标 | 512×512 | 64×64 | 唱片标签/螺旋 |
| 菜单按钮 | 512×512 | 64×64 | normal / pressed |
| 菜单图标 | 512×512 | 32×32 | 三条线，透明 |

不要生成：

```text
整条带文字的 HUD
整排图标拼图
带数字的时钟/标签
带中文的按钮
```

## 1. 统一风格前缀

每个 prompt 前加：

```text
2D stylized game UI asset, hand-painted texture, clean readable shapes,
dark plum and aubergine palette, warm antique brass accents,
small cyan musical glow, subtle paper grain and worn edges,
soft top-left light, low contrast, no text, no letters, no numbers,
no watermark, no logo, no UI labels, no photorealistic 3D
```

## 2. 顶栏底

### 规格

```text
生成 2048×256
导出 1920×72
不透明或轻微透明
全宽，左右出血
```

### 英文 Prompt

```text
2D stylized game UI asset, hand-painted texture, clean readable shapes,
dark plum and aubergine palette, warm antique brass accents,
small cyan musical glow, subtle paper grain and worn edges,
soft top-left light, low contrast, no text, no letters, no numbers,
no watermark, no logo, no UI labels, no photorealistic 3D,

a long horizontal HUD bar background for a dark storybook game,
full-bleed rectangle, straight edges, no rounded corners,
dark aubergine lacquered wood and aged paper surface,
thin antique brass hairline along the top and bottom edges,
a few subtle scratches and worn corners, quiet center,
no icons, no text, no numbers, no emblem, no centerpiece,
no spotlight, no vignette, no strong gradient,
flat even lighting, seamless left-right continuation,
game UI strip, 2048x256
```

### 中文

```text
2D 风格化游戏 UI 资产，手绘质感，造型清晰易读，
深紫黑与茄紫色调，少量古铜金，青蓝音乐微光，
轻微纸张颗粒和磨损边缘，左上柔和光，低对比，
不要文字、字母、数字、水印、logo、UI 标签，不要写实 3D，

幽暗绘本游戏的长条 HUD 底栏，
全宽矩形，直边，无圆角，
深紫黑漆木与旧纸表面，
上下边缘各一条很细的古铜金压线，
少量划痕和磨损角，中间安静，
不要图标、不要文字、不要数字、不要徽章、不要中心装饰，
不要聚光灯、不要暗角、不要强渐变，
均匀平光，左右可延续，
游戏 UI 条，2048×256
```

### 关键

- 不要中心亮斑
- 不要圆角
- 不要图标/文字
- 左右要能延续
- 中间必须“安静”，给文字让位

## 3. 音轨图标

```text
2D stylized game UI icon, clean bold dark-plum outline,
flat colors with one soft highlight, subtle paper grain,
dark plum and warm brass palette, cyan musical accent,
centered, single object, transparent background,
no text, no numbers, no watermark, no UI frame, no shadow,
readable at 32px
```

```text
a single black vinyl record icon, small broken shard missing from one edge,
fine circular grooves, antique brass center label,
thin cyan musical glow on the broken edge,
slightly three-quarter top-down, centered,
clean silhouette, game HUD icon, 512x512
```

## 4. 时间图标

```text
2D stylized game UI icon, clean bold dark-plum outline,
flat colors with one soft highlight, subtle paper grain,
dark plum and warm brass palette, cyan musical accent,
centered, single object, transparent background,
no text, no numbers, no watermark, no UI frame, no shadow,
readable at 32px
```

```text
a single antique pocket watch icon, round brass case,
cream clock face with simple tick marks, two amber hands,
small brass crown on top, short chain loop,
slightly three-quarter front view, centered,
clean silhouette, game HUD icon, 512x512
```

## 5. 步数图标

```text
2D stylized game UI icon, clean bold dark-plum outline,
flat colors with one soft highlight, subtle paper grain,
dark plum and warm brass palette, cyan musical accent,
centered, single object, transparent background,
no text, no numbers, no watermark, no UI frame, no shadow,
readable at 32px
```

```text
a single cat paw print icon, one large pad and four toe beans,
cream fur color with a thin brass outline,
slight worn stamp texture, centered, upright,
clean silhouette, game HUD icon, 512x512
```

## 6. 种子图标

```text
2D stylized game UI icon, clean bold dark-plum outline,
flat colors with one soft highlight, subtle paper grain,
dark plum and warm brass palette, cyan musical accent,
centered, single object, transparent background,
no text, no numbers, no watermark, no UI frame, no shadow,
readable at 32px
```

```text
a single round vinyl record label icon,
dark plum disc with a brass rim, cream spiral groove in the center,
one small cyan dot at the spiral end,
slightly three-quarter top-down, centered,
clean silhouette, game HUD icon, 512x512
```

## 7. 菜单按钮

### normal

```text
2D stylized game UI asset, hand-painted texture, clean readable shapes,
dark plum and aubergine palette, warm antique brass accents,
subtle paper grain and worn edges, soft top-left light, low contrast,
no text, no letters, no numbers, no watermark, no logo,

a single square menu button, rounded corners, dark aubergine lacquer,
thin antique brass border, four tiny brass corner rivets,
quiet center, slightly worn edges, centered,
game UI button, 512x512
```

### pressed

同 normal，追加：

```text
pressed state, darker surface, inset shadow, brass border slightly dimmed,
no icon, no text
```

### 菜单图标

```text
a simple three-line hamburger menu icon, cream lines,
top and bottom lines full width, middle line shorter,
one small brass dot at the right end of the middle line,
centered, transparent background, no text, no frame, 512x512
```

## 8. 通用负面 Prompt

```text
text, letters, numbers, typography, label, logo, watermark, signature,
UI screenshot, full HUD, complete interface, icon sheet, multiple icons,
photorealistic, 3D render, plastic, toy, CGI, clay,
neon cyberpunk, saturated rainbow, horror, gore,
bright spotlight, strong vignette, directional shadow, glow overload,
rounded ends, pill shape, frame around whole bar, border around canvas,
clutter, busy center, random symbols, gibberish glyphs,
blurry, low contrast, noisy, jpeg artifacts, cropped
```

## 9. 生成顺序

```text
1. 顶栏底
2. 音轨图标
3. 时间图标
4. 步数图标
5. 种子图标
6. 菜单按钮 normal
7. 菜单按钮 pressed
8. 菜单图标
```

不要一次生成八张拼图，风格会漂。

## 10. 导出与接入

```text
assets/resources/art/ui/hud/
├─ hud_bar.png           1920×72
├─ hud_icon_track.png    64×64
├─ hud_icon_time.png     64×64
├─ hud_icon_steps.png    64×64
├─ hud_icon_seed.png     64×64
├─ hud_menu_normal.png   64×64
├─ hud_menu_pressed.png  64×64
└─ hud_menu_icon.png     32×32
```

要求：

- PNG-32
- 图标透明
- 顶栏左右出血
- 所有图标同一描边粗细
- 同一左上光源
- 32px 下仍能辨认

## 11. 验收

- 顶栏没有文字/图标/中心亮斑
- 顶栏左右可延续
- 四个图标风格一致
- 菜单按钮 normal/pressed 只差明暗，不差结构
- 32px 下图标不糊
- 整体不抢主画面
- 和木地板、墙、菜单背景的紫棕/黄铜色调一致