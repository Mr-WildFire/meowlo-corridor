# 回廊地块 / 黑胶碎片 / 出口 Prompt

> 用途：Cocos 3.8.8 横屏 1920×1080，固定 128px 格子  
> 风格：2D 卡通游戏资产，平涂、粗轮廓、轻微纸张颗粒  
> 色调：深紫黑回廊 + 琥珀暖光 + 青蓝音乐微光  
> 不要文字、水印、UI、背景杂物

## 0. 统一风格前缀

每个 prompt 开头都加：

```text
2D cartoon game asset, stylized hand-drawn shapes, clean bold dark-plum outline,
flat colors, one soft shadow tone, subtle paper grain,
muted deep aubergine and plum palette, warm amber accents, cyan musical glow,
no text, no letters, no watermark, no logo, no UI
```

## 1. 地板（无缝平铺）

### 规格

```text
1024 × 1024 生成
512 × 512 导出
不透明
可无缝平铺
```

### 英文 Prompt

```text
2D cartoon game asset, stylized hand-drawn shapes, clean bold dark-plum outline,
flat colors, one soft shadow tone, subtle paper grain,
muted deep aubergine and plum palette, warm amber accents, cyan musical glow,
no text, no letters, no watermark, no logo, no UI,

seamless tileable floor texture for a dark old corridor,
top-down orthographic view, no perspective,
aged dark wooden planks, slightly uneven board seams,
subtle purple-brown wood grain, occasional small scratches,
faint warm amber light pooling evenly, no directional shadow,
no objects, no furniture, no walls, no characters,
edges must tile perfectly left-right and top-bottom,
game background tile, high detail but low contrast
```

### 中文 Prompt

```text
2D 卡通游戏资产，手绘造型，深紫黑粗轮廓，
平涂上色，一层柔和暗部，轻微纸张颗粒，
深紫黑与李子色调，少量琥珀暖色，青蓝音乐微光，
不要文字、字母、水印、logo、UI，

幽暗回廊的无缝平铺地板，
正俯视，正交视角，无透视，
旧深色木板，板缝略微不齐，
紫棕色木纹，少量细小划痕，
均匀的暖琥珀微光，不要方向性阴影，
不要物件、家具、墙、角色，
左右和上下必须能无缝拼接，
游戏背景地块，细节适中、低对比
```

### 无缝检查

生成后用 Photoshop 的 Offset 滤镜检查接缝；必要时手动修。

## 2. 墙（横向可重复）

### 规格

```text
1024 × 256 生成
512 × 128 或 256 × 64 导出
透明背景
左右可重复
游戏里旋转 90° 作为竖墙
```

### 英文 Prompt

```text
2D cartoon game asset, stylized hand-drawn shapes, clean bold dark-plum outline,
flat colors, one soft shadow tone, subtle paper grain,
muted deep aubergine and plum palette, warm amber accents, cyan musical glow,
no text, no letters, no watermark, no logo, no UI,

horizontal wall segment for a dark old corridor,
side view, orthographic, straight-on,
faded patterned wallpaper above, dark wooden wainscot below,
thin amber trim line, subtle chipped edges,
seamless left-right repeating, transparent background,
no floor, no ceiling, no door, no window, no objects,
centered, full width, game tile
```

### 中文 Prompt

```text
2D 卡通游戏资产，手绘造型，深紫黑粗轮廓，
平涂上色，一层柔和暗部，轻微纸张颗粒，
深紫黑与李子色调，少量琥珀暖色，青蓝音乐微光，
不要文字、字母、水印、logo、UI，

幽暗回廊的横向墙段，
正侧视，正交，平视，
上半部褪色花纹墙纸，下半部深色木护墙板，
一条细琥珀色压边，边缘轻微破损，
左右可无缝重复，透明背景，
不要地板、天花板、门、窗、物件，
居中，占满宽度，游戏地块
```

### 说明

- 现在 `MazeRenderer` 的墙是横向条带，竖墙靠旋转 90°；
- 墙图不要带地板/天花板，否则旋转后会穿帮。

## 3. 黑胶碎片

### 规格

```text
1024 × 1024 生成
256 × 256 或 512 × 512 导出
透明背景
单个物件
```

### 英文 Prompt

```text
2D cartoon game asset, stylized hand-drawn shapes, clean bold dark-plum outline,
flat colors, one soft shadow tone, subtle paper grain,
muted deep aubergine and plum palette, warm amber accents, cyan musical glow,
no text, no letters, no watermark, no logo, no UI,

a single broken black vinyl record shard, collectible game item,
jagged broken edge, glossy black record surface with fine circular grooves,
thin iridescent rainbow edge catching cyan light,
small cyan musical sparkle, floating slightly above the ground,
centered, full object visible, transparent background,
clean silhouette, readable at 48px,
no shadow, no background, no multiple objects, no text
```

### 中文 Prompt

```text
2D 卡通游戏资产，手绘造型，深紫黑粗轮廓，
平涂上色，一层柔和暗部，轻微纸张颗粒，
深紫黑与李子色调，少量琥珀暖色，青蓝音乐微光，
不要文字、字母、水印、logo、UI，

单个破碎的黑胶唱片碎片，可收集游戏道具，
锯齿状断口，亮黑唱片表面带细密同心圆纹，
断口边缘有很薄的彩虹反光，接住青蓝光，
一点青蓝音符微光，轻微悬浮，
居中，完整物件，透明背景，
剪影干净，48px 下仍可辨认，
不要投影、不要背景、不要多个物件、不要文字
```

### 注意

不要用“水晶/宝石”关键词，否则会变成奇幻素材。

## 4. 出口

### 规格

```text
1024 × 1024 生成
512 × 512 导出
透明背景
单个建筑/门
```

### 英文 Prompt

```text
2D cartoon game asset, stylized hand-drawn shapes, clean bold dark-plum outline,
flat colors, one soft shadow tone, subtle paper grain,
muted deep aubergine and plum palette, warm amber accents, cyan musical glow,
no text, no letters, no watermark, no logo, no UI,

a single magical exit doorway at the end of a dark corridor,
shaped like an old vinyl record sleeve standing upright,
dark carved wooden frame, deep purple interior,
soft cyan sound-wave light glowing from inside,
thin amber rim light on the frame, small floating music notes,
centered, full doorway visible, transparent background,
clean silhouette, readable at 128px,
no text, no sign, no floor, no wall, no shadow, no background
```

### 中文 Prompt

```text
2D 卡通游戏资产，手绘造型，深紫黑粗轮廓，
平涂上色，一层柔和暗部，轻微纸张颗粒，
深紫黑与李子色调，少量琥珀暖色，青蓝音乐微光，
不要文字、字母、水印、logo、UI，

幽暗回廊尽头的一扇魔法出口，
外形像竖立的旧唱片封套，
深色木雕门框，深紫门内，
门内透出柔和青蓝声波光，
门框有细琥珀轮廓光，少量漂浮音符，
居中，完整门体，透明背景，
剪影干净，128px 下可辨认，
不要文字、不要指示牌、不要地板、不要墙、不要投影、不要背景
```

## 5. 通用负面 Prompt

```text
text, letters, typography, words, logo, watermark, signature,
UI, HUD, icon, button, frame, border,
photorealistic, 3D render, plastic, toy, CGI, clay,
neon cyberpunk, bright saturated neon, rainbow gradient,
horror, gore, scary, vampire, bat,
multiple objects, cluttered, busy background, scenery,
perspective, isometric, tilted camera,
hard directional shadow, baked lighting, strong vignette,
blurry, low contrast, noisy, jpeg artifacts, cropped
```

## 6. 推荐生成参数

### 地板

```text
1024 × 1024
SDXL / Flux
Steps 28–35
CFG 4–6
固定 seed
```

### 墙

```text
1024 × 256
横向构图
```

### 碎片 / 出口

```text
1024 × 1024
透明背景
```

## 7. 导出与接入

| 资源 | 导出 | 路径 |
|---|---:|---|
| 地板 | 512×512 | `art/board/floor.png` |
| 墙 | 256×64 | `art/board/wall.png` |
| 碎片 | 256×256 | `art/props/fragment.png` |
| 出口 | 512×512 | `art/props/exit.png` |

要求：

- PNG-24/32
- 地板不透明
- 墙/碎片/出口透明
- 碎片和出口不要烘投影，Cocos 里加
- 墙不要带地板/天花板
- 地板必须无缝

## 8. 验收

- 1920×1080 横屏下，128px 格子比例正确
- 地板平铺无缝
- 墙旋转 90° 后不穿帮
- 碎片 48px 仍能看出是黑胶
- 出口 128px 仍能看出是门
- 无文字/水印/UI
- 与猫的卡通粗轮廓风格一致