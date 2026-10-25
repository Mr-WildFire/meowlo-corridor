# 8 个道具图标 Prompt

> 用途：Cocos 横屏 1920×1080，道具图标  
> 规格：512×512 生成，256×256 导出，透明背景  
> 风格：2D 卡通游戏道具图标，粗轮廓、平涂、轻微纸张颗粒  
> 要求：单个物件、居中、48px 仍可辨认、无文字、无水印

## 0. 统一风格前缀

每个 prompt 开头加：

```text
2D cartoon game item icon, clean bold dark-plum outline,
flat colors with one soft highlight, subtle paper grain,
muted dark plum and warm amber palette, cyan musical accent,
centered, single object, isolated on plain pure white background,
no text, no letters, no label writing, no watermark, no logo, no UI,
no shadow, no multiple objects, no scenery
```

## 1. 蝴蝶

效果：10 步路线指引。

```text
2D cartoon game item icon, clean bold dark-plum outline,
flat colors with one soft highlight, subtle paper grain,
muted dark plum and warm amber palette, cyan musical accent,
centered, single object, isolated on plain pure white background,
no text, no letters, no label writing, no watermark, no logo, no UI,
no shadow, no multiple objects, no scenery,

a single paper origami butterfly, cyan and cream wings,
small dark musical-note pattern on the wings,
wings spread, slight upward float, thin cyan trail,
readable at 48px, game collectible icon
```

## 2. 萤火虫

效果：10 秒照亮范围。

```text
2D cartoon game item icon, clean bold dark-plum outline,
flat colors with one soft highlight, subtle paper grain,
muted dark plum and warm amber palette, cyan musical accent,
centered, single object, isolated on plain pure white background,
no text, no letters, no label writing, no watermark, no logo, no UI,
no shadow, no multiple objects, no scenery,

a single cute firefly, small amber body, translucent mint wings,
soft mint-green glowing lantern at the tail,
tiny cyan sparkles, gentle hovering pose,
readable at 48px, game collectible icon
```

## 3. 鲜花酒

效果：10 秒方向反转。

```text
2D cartoon game item icon, clean bold dark-plum outline,
flat colors with one soft highlight, subtle paper grain,
muted dark plum and warm amber palette, cyan musical accent,
centered, single object, isolated on plain pure white background,
no text, no letters, no label writing, no watermark, no logo, no UI,
no shadow, no multiple objects, no scenery,

a single small rose-colored glass bottle of flower wine,
cream blank label with a tiny musical note, dark cork,
soft pink glow inside the glass, a few petals at the base,
readable at 48px, game collectible icon
```

## 4. 猫条

效果：10 秒移动两格。

```text
2D cartoon game item icon, clean bold dark-plum outline,
flat colors with one soft highlight, subtle paper grain,
muted dark plum and warm amber palette, cyan musical accent,
centered, single object, isolated on plain pure white background,
no text, no letters, no label writing, no watermark, no logo, no UI,
no shadow, no multiple objects, no scenery,

a single torn cat treat pouch, warm amber and cream colors,
one treat stick poking out, small cat-ear shape on the pouch,
tiny motion lines, readable at 48px, game collectible icon
```

## 5. 下水道

效果：随机传送。

```text
2D cartoon game item icon, clean bold dark-plum outline,
flat colors with one soft highlight, subtle paper grain,
muted dark plum and warm amber palette, cyan musical accent,
centered, single object, isolated on plain pure white background,
no text, no letters, no label writing, no watermark, no logo, no UI,
no shadow, no multiple objects, no scenery,

a single dark iron sewer grate, top-down view,
heavy round metal cover with slots, cool gray-blue metal,
a small cyan swirling vortex glowing through the gaps,
readable at 48px, game collectible icon
```

## 6. 小鱼干

效果：增加 20 秒。

```text
2D cartoon game item icon, clean bold dark-plum outline,
flat colors with one soft highlight, subtle paper grain,
muted dark plum and warm amber palette, cyan musical accent,
centered, single object, isolated on plain pure white background,
no text, no letters, no label writing, no watermark, no logo, no UI,
no shadow, no multiple objects, no scenery,

a single golden dried fish snack, small fish-shaped treat,
warm amber and cream colors, slightly curved body,
tiny sesame seeds, small warm sparkle,
readable at 48px, game collectible icon
```

## 7. 毛线球

效果：15 秒留下路线。

```text
2D cartoon game item icon, clean bold dark-plum outline,
flat colors with one soft highlight, subtle paper grain,
muted dark plum and warm amber palette, cyan musical accent,
centered, single object, isolated on plain pure white background,
no text, no letters, no label writing, no watermark, no logo, no UI,
no shadow, no multiple objects, no scenery,

a single rose-red yarn ball, loose thread curling around it,
soft cream highlights, one thread trailing to the side,
slightly tangled, readable at 48px, game collectible icon
```

## 8. 黑羽

效果：减少 10 秒（负面道具）。

```text
2D cartoon game item icon, clean bold dark-plum outline,
flat colors with one soft highlight, subtle paper grain,
muted dark plum and warm amber palette, cyan musical accent,
centered, single object, isolated on plain pure white background,
no text, no letters, no label writing, no watermark, no logo, no UI,
no shadow, no multiple objects, no scenery,

a single dark violet-black feather, soft magenta and cyan edge light,
slightly curved, suspended upright, one small purple spark,
ominous but not horror, readable at 48px, game collectible icon
```

## 9. 通用负面 Prompt

```text
text, letters, typography, label writing, logo, watermark, signature,
UI, HUD, button, card, frame, border, badge,
multiple objects, group, pile, scenery, background, floor, shadow,
photorealistic, 3D render, plastic, toy, CGI, clay,
neon cyberpunk, saturated rainbow, horror, gore,
thin details, fragile lines, blurry, low contrast, noisy,
jpeg artifacts, cropped, off-center
```

## 10. 导出

| 道具 | 路径 |
|---|---|
| 蝴蝶 | `art/props/butterfly.png` |
| 萤火虫 | `art/props/firefly.png` |
| 鲜花酒 | `art/props/wine.png` |
| 猫条 | `art/props/cat_strip.png` |
| 下水道 | `art/props/sewer.png` |
| 小鱼干 | `art/props/fish.png` |
| 毛线球 | `art/props/yarn.png` |
| 黑羽 | `art/props/feather.png` |

```text
512×512 生成
256×256 导出
透明背景
居中，留 8–12px 安全边
```

## 11. 验收

- 8 个图标同一画风
- 同一光源方向
- 同一描边粗细
- 48px 下能区分
- 没有文字/水印
- 没有投影/背景
- 道具颜色和效果对应