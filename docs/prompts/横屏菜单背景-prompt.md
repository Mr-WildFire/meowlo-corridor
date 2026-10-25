# 横屏菜单背景 Prompt

> 用途：1920×1080 横屏难度菜单背景  
> 风格：纸雕绘本 + 旧唱片回廊  
> 重点：中间留空给难度卡，左右有画面，不要生成文字/UI

## 1. 构图目标

```text
16:9 横屏，1920×1080
上方 0–22%：暗、干净，放标题
中间 30–78%：低对比，放三张难度卡
下方 8%：暗，放提示
左侧/右侧：悬挂唱片、旧墙、暖灯
左下或右下：小猫剪影
中心：不要放大物件，不要高亮
```

推荐：

- 猫放在 **左下角**，朝回廊深处看
- 光源在左侧或右侧，不要在中心
- 中间用暗色雾气/地面过渡，不要复杂纹理
- 留出奶油色文字的对比空间

## 2. 主 Prompt（英文）

```text
16:9 landscape game menu background, 1920x1080,
handmade paper-cut storybook diorama, flat layered construction paper,
slight depth, soft paper grain, clean cut edges,
a dark old record corridor deep in an abandoned music shop,
deep aubergine and plum shadows, aged wooden floor, dusty old wallpaper,
hanging vinyl records and faded record sleeves on the walls,
warm amber wall lamps on the left and right, soft pools of light,
thin cyan musical notes floating like glowing dust in the air,
a small orange tabby cat silhouette at the lower left, looking up at the records,
back turned slightly away from the viewer, cozy and mysterious,
empty calm center for a title and three difficulty cards,
low contrast center, visual interest on the left and right edges,
soft vignette, cinematic composition, high contrast silhouette,
muted colors, not neon, not photorealistic,
no text, no letters, no UI, no buttons, no cards, no frames,
no logo, no watermark, no signature
```

## 3. 负面 Prompt

```text
text, letters, typography, words, logo, watermark, signature,
UI, menu, buttons, cards, panels, frames, borders,
photorealistic, 3D render, plastic, toy, clay, CGI,
neon cyberpunk, bright neon, saturated purple, rainbow,
horror, gore, scary, creepy, dark monster,
human, humanoid, catgirl, anthropomorphic, bipedal,
extra limbs, extra tails, deformed paws, cropped cat,
busy center, cluttered center, bright center, high detail center,
low contrast, blurry, noisy, jpeg artifacts
```

## 4. 中文版 Prompt

```text
16:9 横屏游戏菜单背景，1920×1080，
纸雕绘本风格，分层纸张，扁平纸艺，轻微层叠深度，
纸张纹理，清晰剪裁边缘，
一间废弃旧唱片店深处的黑暗回廊，
深紫黑与李子色阴影，旧木地板，褪色旧墙纸，
墙上悬挂黑胶唱片和旧唱片封套，
左右两侧有暖琥珀色壁灯和柔和光斑，
空气中漂浮青蓝色音符光点，
左下角一只橘猫剪影，抬头看悬挂的唱片，
身体略微背对镜头，温暖神秘，
画面中间留空，低对比，用于标题和三张难度卡，
左右两侧有视觉重点，中心安静，
柔和暗角，电影感构图，剪影清晰，
低饱和，不要霓虹，不要写实，
不要文字、字母、UI、按钮、卡片、边框、logo、水印
```

## 5. 两个备选构图

### A. 有猫（推荐）

```text
same as main prompt, cat at lower left, small in frame,
looking up at hanging records, back three-quarter view
```

### B. 纯场景，无猫

```text
same as main prompt, no characters, no cat,
empty record corridor, stronger depth, warm lamps left and right,
empty center for menu cards
```

### C. 猫在右下

```text
same as main prompt, cat at lower right, looking left into the corridor,
visual weight on the right, left side darker for the title
```

## 6. 模型参数

### Midjourney

```text
--ar 16:9 --style raw --stylize 80
--no text, letters, UI, buttons, cards, watermark, human, catgirl
```

### Flux / SDXL

- 分辨率：1536×864 或 1920×1080
- Steps：28–35
- CFG：4–6
- 固定 seed
- 需要更干净的中心时，用 image-to-image 参考当前 `menu_bg`，重绘强度 0.35–0.5

### 图生图参考

如果已有满意的主视觉：

```text
keep the composition and palette of the reference image,
replace the center with dark low-contrast negative space,
add hanging vinyl records on the left and right,
keep the cat at the lower left,
no text, no UI
```

## 7. 生成后处理

1. 裁切到 1920×1080
2. 中心压暗 10–20%，保证奶油色文字可读
3. 四周轻微暗角
4. 不要加任何文字/按钮/卡片
5. UI 在 Figma/Cocos 里叠加
6. 导出 PNG，sRGB，控制在 2–4MB

## 8. 验收

- 16:9 横屏
- 中心没有高亮杂物
- 标题区域干净
- 左右有唱片/灯光细节
- 猫不抢中心
- 没有文字/UI/水印
- 深色但能看清回廊层次
- 和纸雕绘本风格一致