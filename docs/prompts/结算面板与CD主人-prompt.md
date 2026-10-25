# 结算面板 / 完整 CD / 主人 Prompt

> 用途：通关、超时结算 Overlay  
> 风格：和暂停/设置面板一致，深紫黑 + 古铜金 + 青蓝音乐光  
> 原则：**面板不生成文字**，标题、星级、按钮文字都在 Cocos 里加

## 0. 分件

| 资源 | 生成 | 导出 | 说明 |
|---|---:|---:|---|
| 结算面板 | 1200×900 | 900×640 | 无文字，中部留空 |
| 完整 CD | 1024×1024 | 512×512 | 完整、无缺口、透明 |
| 主人 · 通关 | 1024×1024 | 512×512 | 背影、围裙、拿 CD，不露脸 |
| 主人 · 超时 | 1024×1024 | 512×512 | 抱猫，不露脸，暖光 |
| 星级印章 | 512×512 | 96×96 | 黄铜星，透明 |

按钮直接复用暂停面板的按钮 Sprite，不单独生成。

## 1. 结算面板

### 规格

```text
生成 1200×900（4:3）
导出 900×640
不透明
无文字、无数字、无按钮
中部留空给标题/星级/插画/按钮
```

### 英文 Prompt

```text
2D stylized game UI panel, hand-painted texture, clean readable shapes,
dark aubergine and deep plum palette, warm antique brass accents,
small cyan musical glow, subtle paper grain and worn edges,
soft top-left light, low contrast, no text, no letters, no numbers,
no watermark, no logo, no UI labels, no buttons, no photorealistic 3D,

a large portrait result panel for a storybook game,
rounded rectangular frame with a thin antique brass border,
dark aubergine lacquered wood and aged paper surface,
small brass corner ornaments, subtle vinyl groove engraving in the corners,
a quiet empty center for text and a character portrait,
a shallow arch motif at the top edge, no center illustration,
no spotlight, no strong vignette, no bright center,
flat even lighting, centered, full panel visible,
game result panel, 1200x900
```

### 中文

```text
2D 风格化游戏 UI 面板，手绘质感，造型清晰易读，
深紫黑与深李色调，少量古铜金，青蓝音乐微光，
轻微纸张颗粒和磨损边缘，左上柔和光，低对比，
不要文字、字母、数字、水印、logo、UI 标签、按钮，不要写实 3D，

绘本游戏的大号结算面板，
圆角矩形外框，细古铜金边，
深紫黑漆木与旧纸表面，
四角有小型黄铜装饰，角落有很淡的黑胶沟槽刻纹，
中部留空，给标题、星级、角色插画和按钮，
顶部边缘有浅浅的拱形纹样，不要中心插画，
不要聚光灯、不要强暗角、不要中心亮斑，
均匀平光，居中，完整面板，
游戏结算面板，1200×900
```

### 负面

```text
text, numbers, stars, buttons, UI layout, complete interface,
photorealistic, 3D render, plastic, toy, CGI, clay,
bright center, spotlight, strong vignette, heavy shadow,
neon, saturated rainbow, horror, gore, clutter, busy center,
blurry, low contrast, noisy, jpeg artifacts, cropped
```

## 2. 完整 CD

### 规格

```text
生成 1024×1024
导出 512×512
透明背景
单个完整唱片
中心孔透明
```

### 英文 Prompt

```text
2D cartoon game item icon, clean bold dark-plum outline,
flat colors with one soft highlight, subtle paper grain,
black vinyl, warm antique brass and cream palette, cyan musical accent,
centered, single object, isolated on plain pure white background,
no text, no letters, no numbers, no watermark, no logo, no UI,
no shadow, no multiple objects, no scenery,

a complete black vinyl record, perfectly circular and unbroken,
fine concentric grooves, subtle iridescent rainbow rim,
antique brass center label with a cream circular ring,
one clean transparent center hole, no writing on the label,
slightly three-quarter top-down view, centered,
clean silhouette, readable at 128px, game collectible icon, 1024x1024
```

### 中文

```text
2D 卡通游戏道具图标，干净粗深紫黑轮廓，
平涂上色，一层柔和亮部，轻微纸张颗粒，
黑色黑胶，暖古铜金与奶油色，青蓝音乐微光，
居中，单个物件，纯白背景，
不要文字、字母、数字、水印、logo、UI，
不要投影、不要多个物件、不要背景杂物，

一张完整的黑色黑胶唱片，完美圆形，没有缺口，
细密同心圆纹，边缘有很淡的彩虹反光，
古铜金中心圆标，外圈有一圈奶油色细环，
一个干净透明的中心孔，圆标上不要写字，
轻微 3/4 俯视，居中，
剪影干净，128px 下可辨认，游戏收藏品图标，1024×1024
```

### 关键

- 不要生成“破损”“缺口”“碎片”
- 中心孔必须透明
- 圆标上不要出现任何文字

## 3. 主人 · 通关

设定：主人**不露正脸**，围裙、手、旧 CD 机是识别点。

### 规格

```text
生成 1024×1024
导出 512×512
透明背景
单个人物剪影/半身
```

### 英文 Prompt

```text
2D cartoon game character, clean hand-drawn silhouette,
dark plum and warm amber palette, soft cyan musical rim light,
single adult owner seen from behind, no face visible,
wearing a simple apron over a long cardigan,
holding a complete vinyl record with both hands,
gentle posture, warm rim light along the shoulders and hands,
centered, full upper body visible, isolated on plain white background,
no text, no watermark, no background scenery, no shadow,
readable at 128px, storybook game illustration, 1024x1024
```

### 中文

```text
2D 卡通游戏角色，干净手绘剪影，
深紫黑与暖琥珀色调，青蓝音乐轮廓光，
单个成年主人，背影，不露脸，
长开衫外面系着简单围裙，
双手捧着一张完整黑胶唱片，
姿态温柔，肩膀和手部有暖色轮廓光，
居中，完整上半身，纯白背景，
不要文字、水印、背景杂物、投影，
128px 下可辨认，绘本游戏插画，1024×1024
```

### 负面

```text
face, facial features, eyes, portrait, front view,
text, watermark, logo, background room, furniture, floor,
photorealistic, 3D render, plastic, detailed skin, fingers with errors,
multiple people, crowd, horror, gore,
hard shadow, strong vignette, neon, saturated rainbow,
blurry, low contrast, noisy, jpeg artifacts, cropped
```

## 4. 主人 · 超时（可选）

如果超时结算需要单独插画：

```text
2D cartoon game character, clean hand-drawn silhouette,
dark plum and warm amber palette, soft rose and amber rim light,
single adult owner seen from behind, no face visible,
wearing a simple apron, gently carrying the cat in both arms,
the cat is a cream Ragdoll with dark chocolate mask, ears and tail,
one small black vinyl-record charm on its collar,
warm protective posture, centered, full upper body visible,
isolated on plain white background, no text, no watermark,
no background scenery, no shadow, 1024x1024
```

注意：

- 猫不要画成橘猫
- 猫是海豹双色布偶：奶油身体、深巧克力面罩/耳朵/尾巴、蓝眼
- 主人仍然不露脸

## 5. 星级印章

### 规格

```text
生成 512×512
导出 96×96
透明背景
单个黄铜星
```

```text
2D cartoon game UI icon, clean bold dark-plum outline,
antique brass and warm gold, subtle cyan musical glow,
one single five-pointed brass star, slightly worn edges,
small music-note engraving in the center,
centered, transparent background, no text, no numbers,
no shadow, no multiple stars, readable at 32px, 512x512
```

## 6. 通用负面

```text
text, letters, numbers, typography, label writing,
UI screenshot, full interface, buttons, cards, layout,
photorealistic, 3D render, plastic, toy, CGI, clay,
neon cyberpunk, saturated rainbow, horror, gore,
bright spotlight, strong vignette, hard directional shadow,
multiple objects, clutter, busy background, scenery,
blurry, low contrast, noisy, jpeg artifacts, cropped
```

## 7. 生成顺序

```text
1. 结算面板
2. 完整 CD
3. 主人 · 通关
4. 主人 · 超时（需要才做）
5. 星级印章
```

不要一次生成拼图。

## 8. 导出与接入

```text
assets/resources/art/props/
├─ result_panel.png   900×640
├─ cd.png             512×512
├─ owner.png          512×512
├─ owner_timeout.png  512×512
└─ star.png           96×96
```

要求：

- PNG-32
- 面板不透明
- CD / 主人 / 星级透明
- 中心孔透明
- 不烘投影
- 面板中部不要放任何文字或图标

## 9. 验收

- 面板无文字、无按钮
- 面板中部足够空
- CD 完整、无缺口
- 主人不露脸
- 猫不是橘猫
- 128px 下仍能读出 CD / 人物剪影
- 与暂停/设置面板同一套紫黑 + 黄铜风格