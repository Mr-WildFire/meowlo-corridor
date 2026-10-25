# 横屏菜单背景 Prompt

> 用途：1920×1080 横屏难度菜单背景  
> 场景：**旧宅回廊 / 主人家的回廊**，不是唱片店  
> 老八：**海豹双色布偶猫**，不是橘猫  
> 重点：中间留空给难度卡，左右有画面，不要生成文字/UI

## 1. 构图目标

```text
16:9 横屏，1920×1080
上方 0–22%：暗、干净，放标题
中间 30–78%：低对比，放三张难度卡
下方 8%：暗，放提示
左侧/右侧：旧宅走廊、房门、壁灯、旧家具
左下角：布偶猫老八的剪影
中心：不要高亮、不要大物件
```

推荐：

- 场景是**旧宅/老房子的回廊**，不是商店
- 左侧或右侧有一扇**半开的门**，门后是暖色音乐房
- 猫放在**左下角**，朝门或回廊深处看
- 中心用暗色地面/雾气过渡，留空给卡片
- 墙上不要挂满黑胶唱片，改用旧相框、壁纸、壁灯、五线谱

## 2. 主 Prompt（英文）

```text
16:9 landscape game menu background, 1920x1080,
handmade paper-cut storybook diorama, flat layered construction paper,
slight depth, soft paper grain, clean cut edges,
a quiet old family-house corridor at night, outside a forgotten music room,
deep aubergine and plum shadows, aged wooden floor, faded patterned wallpaper,
framed old family photos, a small antique gramophone on a side table,
scattered sheet music pages, a half-open door with warm amber light on the left,
warm wall lamps, soft pools of light, dust motes in the air,
a few thin cyan musical notes and tiny CD shard glints floating,
a small fluffy seal bicolor ragdoll cat silhouette at the lower left,
ivory cream body, dark chocolate brown mask and ears, dark brown bushy tail,
bright blue eyes, dark red collar with a small amber tag,
looking toward the warm doorway, back three-quarter view, cozy and mysterious,
empty calm center for a title and three difficulty cards,
low contrast center, visual interest on the left and right edges,
soft vignette, cinematic composition, high contrast silhouette,
muted colors, not neon, not photorealistic,
no text, no letters, no UI, no buttons, no cards, no frames,
no logo, no watermark, no signature,
no record shop, no vinyl store, no orange tabby, no orange cat
```

## 3. 负面 Prompt

```text
text, letters, typography, words, logo, watermark, signature,
UI, menu, buttons, cards, panels, frames, borders,
photorealistic, 3D render, plastic, toy, clay, CGI,
neon cyberpunk, bright neon, saturated purple, rainbow,
horror, gore, scary, creepy, dark monster,
human, humanoid, catgirl, anthropomorphic, bipedal,
orange tabby, orange cat, ginger cat, record shop, vinyl store, record store,
walls covered with vinyl records, shopping street, neon shop sign,
extra limbs, extra tails, deformed paws, cropped cat,
busy center, cluttered center, bright center, high detail center,
low contrast, blurry, noisy, jpeg artifacts
```

## 4. 中文版 Prompt

```text
16:9 横屏游戏菜单背景，1920×1080，
纸雕绘本风格，分层纸张，扁平纸艺，轻微层叠深度，
纸张纹理，清晰剪裁边缘，
夜晚安静的旧宅回廊，一扇通往旧音乐房的半开门，
深紫黑与李子色阴影，旧木地板，褪色花纹墙纸，
墙上旧家庭相框，边桌上一台旧留声机，
散落的五线谱纸，左侧半开门透出暖琥珀色灯光，
暖色壁灯，柔和光斑，空气中有灰尘微粒，
少量青蓝色音符和细小 CD 碎片微光，
左下角一只海豹双色布偶猫剪影，
奶油白身体，深巧克力棕面罩和耳朵，深棕蓬松尾巴，
蓝色眼睛，暗红色项圈和小琥珀吊牌，
朝暖色门的方向看，身体略背对镜头，温暖神秘，
画面中间留空，低对比，用于标题和三张难度卡，
左右两侧有视觉重点，中心安静，
柔和暗角，电影感构图，剪影清晰，
低饱和，不要霓虹，不要写实，
不要文字、字母、UI、按钮、卡片、边框、logo、水印，
不要唱片店、不要黑胶商店、不要橘猫、不要橘色猫
```

## 5. 三个备选构图

### A. 猫在左下（推荐）

```text
same as main prompt, cat at lower left, small in frame,
looking toward the warm doorway on the left, back three-quarter view
```

### B. 纯场景，无猫

```text
same as main prompt, no characters, no cat,
empty old house corridor, half-open door on the left,
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
--no text, letters, UI, buttons, cards, watermark, human, catgirl,
orange tabby, record shop
```

### Flux / SDXL

- 分辨率：1536×864 或 1920×1080
- Steps：28–35
- CFG：4–6
- 固定 seed
- 需要更干净的中心时，用当前 `menu_bg` 做 img2img，重绘强度 0.35–0.5

### 图生图参考

```text
keep the old-house corridor composition and the paper-cut palette,
replace the center with dark low-contrast negative space,
keep the half-open warm door on the left,
add a seal bicolor ragdoll cat at the lower left,
no text, no UI, no record shop, no orange cat
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
- 是旧宅回廊，不是唱片店
- 猫是海豹双色布偶猫，不是橘猫
- 中心没有高亮杂物
- 标题区域干净
- 左右有旧宅/门/壁灯细节
- 猫不抢中心
- 没有文字/UI/水印
- 深色但能看清回廊层次