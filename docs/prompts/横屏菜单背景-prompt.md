# 横屏菜单背景 Prompt

> 用途：1920×1080 横屏难度菜单背景  
> 场景：**阳光音乐房间/店铺 → 幽暗回廊**，不是废弃旧房  
> 事件：**蝙蝠叼走唱片，唱片掉进幽暗回廊**  
> 老八：**海豹双色布偶猫**，不是橘猫  
> 重点：前景阳光、中心幽暗，给难度卡留空间

## 1. 画面叙事

```text
前景：阳光照进来的音乐房间/店铺
中景：一扇打开的暗门，通向幽暗回廊
动作：蝙蝠叼着唱片飞向暗门，唱片滑落
左下：布偶猫老八站在阳光与黑暗的交界处
中心：幽暗、低对比，留给标题和三张难度卡
```

不是“废弃唱片店”，而是：

- 有阳光、灰尘光柱、木柜台、唱片架、绿植
- 温暖、明亮、有人生活/经营的气息
- 暗门后面才是冷的、深紫黑的回廊
- 蝙蝠是小型剪影，不恐怖

## 2. 构图目标

```text
16:9 横屏，1920×1080
上方 0–22%：阳光房间的墙/窗，干净，放标题
中间 30–78%：暗门与幽暗回廊，放三张难度卡
下方 8%：暗，放提示
左侧：阳光、柜台、绿植、猫
右侧：唱片架、暖灯、蝙蝠飞向暗门
中心：暗门深处，低对比
```

推荐：

- 暗门放在画面中偏右，不要正中心堵住卡片
- 蝙蝠在暗门上方/右侧，叼着唱片
- 唱片可以有一道青蓝反光，正在滑落
- 猫在左下角，身体朝暗门看
- 阳光只照亮前景，不照进回廊深处

## 3. 主 Prompt（英文）

```text
16:9 landscape game menu background, 1920x1080,
handmade paper-cut storybook diorama, flat layered construction paper,
slight depth, soft paper grain, clean cut edges,
a bright sunlit cozy music shop in the foreground,
warm morning sunlight through a large window, visible sunbeams, floating dust motes,
wooden counter, shelves of vinyl records, small potted plants, cream and amber tones,
at the back right an open dark doorway leading into a narrow gloomy corridor,
deep aubergine and plum shadows inside the corridor, cold cyan musical glow,
a small black bat silhouette flying toward the dark doorway,
carrying a shiny vinyl record in its claws, the record slipping and falling,
a thin cyan glint on the falling record, subtle motion, not scary,
a small fluffy seal bicolor ragdoll cat at the lower left threshold,
ivory cream body, dark chocolate brown mask and ears, dark brown bushy tail,
bright blue eyes, dark red collar with a small amber tag,
looking toward the dark doorway, back three-quarter view, curious and brave,
the foreground is warm and sunny, the corridor is dark and mysterious,
empty calm center for a title and three difficulty cards,
low contrast dark center, visual interest on the left and right edges,
soft vignette, cinematic composition, high contrast silhouette,
muted colors, not neon, not photorealistic,
no text, no letters, no UI, no buttons, no cards, no frames,
no logo, no watermark, no signature,
no abandoned house, no abandoned record store, no orange tabby, no orange cat
```

## 4. 负面 Prompt

```text
text, letters, typography, words, logo, watermark, signature,
UI, menu, buttons, cards, panels, frames, borders,
photorealistic, 3D render, plastic, toy, clay, CGI,
neon cyberpunk, bright neon, saturated purple, rainbow,
horror, gore, scary, creepy, giant bat, bat monster, vampire,
human, humanoid, catgirl, anthropomorphic, bipedal,
orange tabby, orange cat, ginger cat,
abandoned house, abandoned record store, dusty ruin, dark shop,
extra limbs, extra tails, deformed paws, cropped cat,
busy center, cluttered center, bright center, high detail center,
low contrast, blurry, noisy, jpeg artifacts
```

## 5. 中文版 Prompt

```text
16:9 横屏游戏菜单背景，1920×1080，
纸雕绘本风格，分层纸张，扁平纸艺，轻微层叠深度，
纸张纹理，清晰剪裁边缘，
前景是一间阳光照进来的温暖音乐房间/店铺，
大窗户，清晨阳光，可见光柱，空气中有灰尘微粒，
木柜台，唱片架，小绿植，奶油色和琥珀色，
右后方一扇打开的暗门，通向狭窄幽暗的回廊，
回廊深处是深紫黑阴影和青蓝色冷光，
一只小黑蝙蝠剪影朝暗门飞去，
爪子里抓着一张发亮的黑胶唱片，唱片正在滑落，
唱片边缘有一道青蓝反光，轻微运动感，不恐怖，
左下角门槛边一只海豹双色布偶猫，
奶油白身体，深巧克力棕面罩和耳朵，深棕蓬松尾巴，
蓝色眼睛，暗红色项圈和小琥珀吊牌，
朝暗门方向看，身体略背对镜头，好奇又勇敢，
前景温暖明亮，回廊黑暗神秘，
画面中间留空，低对比，用于标题和三张难度卡，
左右两侧有视觉重点，中心安静，
柔和暗角，电影感构图，剪影清晰，
低饱和，不要霓虹，不要写实，
不要文字、字母、UI、按钮、卡片、边框、logo、水印，
不要废弃旧房、不要废弃唱片店、不要橘猫、不要橘色猫
```

## 6. 三个备选构图

### A. 猫在左下，蝙蝠在右上方（推荐）

```text
same as main prompt, cat at lower left, bat at upper right of the dark doorway,
record falling into the corridor, warm foreground, dark center
```

### B. 猫在右下

```text
same as main prompt, cat at lower right, bat and doorway on the right,
visual weight on the right, left side darker for the title
```

### C. 无猫，只保留事件

```text
same as main prompt, no characters, no cat,
sunlit music shop in the foreground, bat carrying a record into the dark doorway,
record falling, empty dark center for menu cards
```

## 7. 模型参数

### Midjourney

```text
--ar 16:9 --style raw --stylize 80
--no text, letters, UI, buttons, cards, watermark, human, catgirl,
orange tabby, abandoned house, horror bat
```

### Flux / SDXL

- 分辨率：1536×864 或 1920×1080
- Steps：28–35
- CFG：4–6
- 固定 seed
- 中心不够暗时，用 img2img 把暗门区域压暗

### 图生图参考

```text
keep the sunlit music-shop foreground and paper-cut palette,
keep the warm window light and wooden counter,
make the back-right doorway lead into a dark corridor,
add a small bat carrying a falling vinyl record,
add a seal bicolor ragdoll cat at the lower-left threshold,
keep the center dark for menu cards,
no text, no UI, no abandoned house, no orange cat
```

## 8. 生成后处理

1. 裁切到 1920×1080
2. 中心暗门区域压暗 10–20%，保证卡片和文字可读
3. 前景保留阳光，但不要把中心照亮
4. 四周轻微暗角
5. 不加文字/按钮/卡片，UI 在 Figma/Cocos 叠加
6. 导出 PNG，sRGB，控制在 2–4MB

## 9. 验收

- 16:9 横屏
- 前景是**阳光音乐房间/店铺**，不是废弃旧房
- 暗门后是幽暗回廊
- 有蝙蝠叼走/掉落唱片的事件
- 猫是海豹双色布偶猫，不是橘猫
- 中心足够暗，能放三张难度卡
- 没有文字/UI/水印
- 前景暖、回廊冷，对比清楚