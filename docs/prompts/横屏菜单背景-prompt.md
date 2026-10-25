# 横屏菜单背景 Prompt

> 用途：1920×1080 横屏难度菜单背景  
> 场景：**单纯的幽暗回廊迷宫**  
> 不要店面、不要房间、不要窗户、不要店内走廊  
> 事件：**蝙蝠叼走唱片，唱片掉进回廊**  
> 老八：**海豹双色布偶猫**，不是橘猫

## 1. 设定

```text
只有回廊迷宫本身
高墙、拱门、旧木地板、壁灯、雾气
没有店铺、没有柜台、没有窗、没有房间
蝙蝠在回廊里飞，叼着唱片
唱片从蝙蝠爪中滑落
布偶猫老八站在回廊左下角
```

## 2. 构图

```text
16:9 横屏，1920×1080
上方 0–22%：回廊深处/拱门，暗，放标题
中间 30–78%：回廊中段，低对比，放三张难度卡
下方 8%：暗，放提示
左侧：壁灯、拱门、猫
右侧：蝙蝠、滑落的唱片、青蓝微光
中心：回廊深处，低对比、不要高亮
```

- 回廊向画面深处延伸
- 蝙蝠在右侧/中右侧，正要飞进黑暗
- 唱片在蝙蝠下方滑落，带青蓝反光
- 猫在左下角，朝蝙蝠/唱片看
- 中心留空，给难度卡

## 3. 主 Prompt（英文）

```text
16:9 landscape game menu background, 1920x1080,
handmade paper-cut storybook diorama, flat layered construction paper,
slight depth, soft paper grain, clean cut edges,
a standalone dark maze corridor, endless old corridor made of tall paper-cut walls,
repeating arches, aged wooden floor, faded patterned wallpaper,
warm amber wall lamps on the left and right, soft pools of light,
deep aubergine and plum shadows, cold blue mist in the distance,
thin cyan musical notes and tiny vinyl shard glints floating in the air,
a small black bat silhouette flying through the corridor on the right,
carrying a shiny vinyl record in its claws, the record slipping and falling,
a thin cyan glint on the falling record, subtle motion, not scary,
a small fluffy seal bicolor ragdoll cat at the lower left,
ivory cream body, dark chocolate brown mask and ears, dark brown bushy tail,
bright blue eyes, dark red collar with a small amber tag,
looking up at the bat and the falling record, back three-quarter view,
curious and brave, cozy and mysterious,
empty calm center for a title and three difficulty cards,
low contrast dark center, visual interest on the left and right edges,
soft vignette, cinematic composition, high contrast silhouette,
muted colors, not neon, not photorealistic,
no text, no letters, no UI, no buttons, no cards, no frames,
no logo, no watermark, no signature,
no shop, no storefront, no room, no window, no interior,
no orange tabby, no orange cat
```

## 4. 负面 Prompt

```text
text, letters, typography, words, logo, watermark, signature,
UI, menu, buttons, cards, panels, frames, borders,
shop, storefront, store interior, window, room, interior, house, building facade,
counter, shelves, display window, door to a shop,
photorealistic, 3D render, plastic, toy, clay, CGI,
neon cyberpunk, bright neon, saturated purple, rainbow,
horror, gore, scary, creepy, giant bat, bat monster, vampire,
human, humanoid, catgirl, anthropomorphic, bipedal,
orange tabby, orange cat, ginger cat,
extra limbs, extra tails, deformed paws, cropped cat,
busy center, cluttered center, bright center, high detail center,
low contrast, blurry, noisy, jpeg artifacts
```

## 5. 中文版 Prompt

```text
16:9 横屏游戏菜单背景，1920×1080，
纸雕绘本风格，分层纸张，扁平纸艺，轻微层叠深度，
纸张纹理，清晰剪裁边缘，
一条独立的幽暗回廊迷宫，没有尽头，
高大的纸雕墙，重复的拱门，旧木地板，褪色花纹墙纸，
左右两侧暖琥珀色壁灯，柔和光斑，
深紫黑阴影，远处深蓝雾气，
空气中漂浮少量青蓝色音符和细小唱片碎片微光，
右侧一只小黑蝙蝠剪影在回廊里飞，
爪子里抓着一张发亮的黑胶唱片，唱片正在滑落，
唱片边缘有一道青蓝反光，轻微运动感，不恐怖，
左下角一只海豹双色布偶猫，
奶油白身体，深巧克力棕面罩和耳朵，深棕蓬松尾巴，
蓝色眼睛，暗红色项圈和小琥珀吊牌，
抬头看蝙蝠和掉落的唱片，身体略背对镜头，
好奇又勇敢，温暖神秘，
画面中间留空，低对比，用于标题和三张难度卡，
左右两侧有视觉重点，中心安静，
柔和暗角，电影感构图，剪影清晰，
低饱和，不要霓虹，不要写实，
不要文字、字母、UI、按钮、卡片、边框、logo、水印，
不要店面、不要店铺、不要房间、不要窗户、不要室内，
不要橘猫、不要橘色猫
```

## 6. 备选构图

### A. 猫在左下（推荐）

```text
same as main prompt, cat at lower left, bat and falling record at middle right,
empty dark corridor center for menu cards
```

### B. 猫在右下

```text
same as main prompt, cat at lower right, bat and record at upper right,
left side darker for the title
```

### C. 无猫，只保留事件

```text
same as main prompt, no characters, no cat,
bat carrying a falling record in the dark corridor,
empty center for menu cards
```

## 7. 模型参数

### Midjourney

```text
--ar 16:9 --style raw --stylize 80
--no text, letters, UI, buttons, cards, watermark, human, catgirl,
shop, storefront, room, window, orange tabby
```

### Flux / SDXL

- 分辨率：1536×864 或 1920×1080
- Steps：28–35
- CFG：4–6
- 固定 seed
- 如果模型总加店面/窗户，在负面词里加重 `shop, storefront, room, window`
- 中心不够暗时，后期压暗回廊中段

### 图生图参考

```text
keep the paper-cut corridor and palette,
remove any shop, storefront, room or window,
keep only the dark maze corridor, warm wall lamps, arches and mist,
add a small bat carrying a falling vinyl record on the right,
add a seal bicolor ragdoll cat at the lower left,
keep the center dark and empty for menu cards,
no text, no UI, no orange cat
```

## 8. 生成后处理

1. 裁切到 1920×1080
2. 中心回廊压暗 10–20%，保证卡片和文字可读
3. 四周轻微暗角
4. 不加文字/按钮/卡片，UI 在 Figma/Cocos 叠加
5. 导出 PNG，sRGB，控制在 2–4MB

## 9. 验收

- 16:9 横屏
- 只有回廊迷宫，没有店面/房间/窗户
- 回廊有纵深、拱门、壁灯、雾气
- 有蝙蝠叼唱片、唱片滑落的事件
- 猫是海豹双色布偶猫，不是橘猫
- 中心足够暗，能放三张难度卡
- 没有文字/UI/水印