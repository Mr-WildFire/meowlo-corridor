# 回廊地块 / 黑胶碎片 / 出口 Prompt · v2

> 目的：修正上一版“有边框、有中心高光、有钉子、不可平铺”的问题  
> 风格：2D 卡通游戏资产，低对比，作为背景不抢角色  
> 画布：1920×1080，格子 128px

## 0. 统一风格前缀

```text
2D cartoon game asset, clean hand-drawn shapes, flat colors,
one soft shadow tone, subtle paper grain, muted dark plum palette,
warm amber accents, cyan musical glow, not photorealistic,
no text, no letters, no watermark, no logo, no UI
```

## 1. 地板 · 可平铺版

### 规格

```text
生成 1024×1024
导出 512×512
不透明
无缝平铺
8–10 排木板 / 512px
```

### 英文 Prompt

```text
2D cartoon game asset, clean hand-drawn shapes, flat colors,
one soft shadow tone, subtle paper grain, muted dark plum palette,
warm amber accents, cyan musical glow, not photorealistic,
no text, no letters, no watermark, no logo, no UI,

seamless tileable wooden floor texture for a dark corridor,
top-down orthographic view, no perspective,
8 to 10 horizontal dark wooden plank rows,
small staggered plank joints, thin dark seams,
subtle purple-brown wood grain and a few tiny scratches,
flat even lighting, no light spot, no gradient, no vignette,
no border, no frame, no nails, no metal studs, no objects, no shadows,
edges must tile perfectly left-right and top-bottom,
muted low-contrast background texture, game tile, 1024x1024
```

### 中文

```text
2D 卡通游戏资产，干净手绘造型，平涂，
一层柔和暗部，轻微纸张颗粒，低饱和深紫色调，
少量琥珀暖色，青蓝音乐微光，不要写实，
不要文字、字母、水印、logo、UI，

幽暗回廊的无缝平铺木地板，
正俯视，正交，无透视，
8–10 排横向深色木板，板缝错位，接缝细而暗，
紫棕色木纹，少量细小划痕，
均匀平光，不要亮斑、不要渐变、不要暗角，
不要边框、不要外框、不要钉子、不要金属钉、不要物件、不要阴影，
左右和上下必须无缝拼接，
低对比背景材质，游戏地块，1024×1024
```

### 关键

- 不要出现外框/暗角
- 不要中间亮斑
- 不要钉子
- 必须用 Offset 滤镜检查接缝

## 2. 地板 · 整块底图版

如果不想改代码做平铺，当前游戏是**一张地板图拉伸铺满棋盘**，用这张：

```text
生成 2048×2048
导出 1024×1024
不透明
整块木地板，不要求无缝
```

```text
2D cartoon game asset, clean hand-drawn shapes, flat colors,
one soft shadow tone, subtle paper grain, muted dark plum palette,
warm amber accents, cyan musical glow, not photorealistic,
no text, no letters, no watermark, no logo, no UI,

one large dark wooden floor panel for a corridor,
top-down orthographic, no perspective,
12 to 14 horizontal wooden planks, small staggered joints,
subtle purple-brown grain, a few fine scratches,
flat even lighting, no vignette, no border, no frame,
no nails, no metal studs, no furniture, no characters, no shadows,
low contrast, tileable-looking but designed as one large floor,
muted background, game floor, 2048x2048
```

## 3. 墙 · 横向可重复

### 规格

```text
生成 1024×256
导出 256×64
透明背景
左右可重复
```

```text
2D cartoon game asset, clean hand-drawn shapes, flat colors,
one soft shadow tone, subtle paper grain, muted dark plum palette,
warm amber accents, cyan musical glow, not photorealistic,
no text, no letters, no watermark, no logo, no UI,

horizontal wall segment for a dark corridor,
orthographic side view, straight-on,
faded patterned wallpaper on the upper half,
dark wooden wainscot on the lower half,
one thin amber trim line, subtle chipped edges,
flat even lighting, no shadow, no vignette,
seamless repeating left-right, isolated on transparent background,
no floor, no ceiling, no door, no window, no nails, no objects,
centered, full width, game wall tile, 1024x256
```

### 关键

- 不要带地板/天花板
- 不要钉子
- 不要外框
- 竖墙由游戏旋转 90°

## 4. 黑胶碎片

### 规格

```text
生成 1024×1024
导出 256×256 或 512×512
透明背景
```

```text
2D cartoon game asset, clean hand-drawn shapes, flat colors,
one soft shadow tone, subtle paper grain, muted dark plum palette,
warm amber accents, cyan musical glow, not photorealistic,
no text, no letters, no watermark, no logo, no UI,

a single broken black vinyl record shard, collectible game item,
jagged broken edge, glossy black record surface with fine circular grooves,
thin iridescent rainbow edge, small cyan musical sparkle,
three-quarter top-down view, centered, full object visible,
isolated on transparent background, clean silhouette, readable at 48px,
no shadow, no background, no multiple objects, no text
```

## 5. 出口

### 规格

```text
生成 1024×1024
导出 512×512
透明背景
```

```text
2D cartoon game asset, clean hand-drawn shapes, flat colors,
one soft shadow tone, subtle paper grain, muted dark plum palette,
warm amber accents, cyan musical glow, not photorealistic,
no text, no letters, no watermark, no logo, no UI,

a single magical exit doorway at the end of a dark corridor,
shaped like an upright old vinyl record sleeve,
dark carved wooden frame, deep purple interior,
soft cyan sound-wave light inside, thin amber rim light,
small floating musical notes, centered, full doorway visible,
isolated on transparent background, clean silhouette, readable at 128px,
no text, no sign, no floor, no wall, no shadow, no background
```

## 6. 通用负面 Prompt

```text
border, frame, outer frame, vignette, dark edges, rounded frame,
spotlight, bright center, light gradient, directional light, baked shadow,
nails, screws, metal studs, rivets, hinges, door handle,
perspective, isometric, tilted camera, 3D render, photorealistic, CGI, plastic,
text, letters, typography, logo, watermark, signature,
UI, HUD, buttons, cards, icons,
multiple objects, cluttered, furniture, characters, scenery,
neon, saturated purple, rainbow, horror, gore,
blurry, low contrast, noisy, jpeg artifacts, cropped
```

## 7. 导出与接入

| 资源 | 导出 | 路径 |
|---|---:|---|
| 地板（可平铺） | 512×512 | `art/board/floor.png` |
| 地板（整块） | 1024×1024 | 同上 |
| 墙 | 256×64 | `art/board/wall.png` |
| 碎片 | 256×256 | `art/props/fragment.png` |
| 出口 | 512×512 | `art/props/exit.png` |

- 地板不透明
- 墙/碎片/出口透明
- 不要烘投影
- 墙不要带地板/天花板
- 平铺地板用 Photoshop Offset 检查

## 8. 验收

- 没有边框/暗角/中心亮斑
- 没有钉子
- 地板能无缝平铺
- 墙左右能重复
- 碎片 48px 仍像黑胶
- 出口 128px 仍像门
- 与猫的卡通粗轮廓一致
- 背景不抢角色