# 横屏菜单背景 Prompt

> 用途：1920×1080 横屏难度菜单背景  
> 场景：**阳光音乐房间/店铺**，窗外是**独立的幽暗回廊迷宫**  
> 关键：回廊不在房间里，不在店铺内部  
> 事件：**蝙蝠从店铺飞出，叼走唱片，唱片掉进外面的回廊**  
> 老八：**海豹双色布偶猫**，不是橘猫

## 1. 空间关系

```text
室内：阳光音乐房间/店铺
边界：一扇打开的大窗/后门
室外：独立的幽暗回廊迷宫，露天、无天花板
动作：蝙蝠从室内飞出窗外，唱片滑落进回廊
猫：在窗台/门槛，朝外面的回廊看
```

必须避免：

```text
回廊在房间里面
房间内部有一条黑暗走廊
店铺深处有一扇门通向回廊
废弃旧房 / 废弃唱片店
```

## 2. 构图

```text
16:9 横屏，1920×1080
左侧 30%：阳光店铺、窗框、柜台、绿植、猫
右侧 70%：窗外独立的幽暗回廊、夜空、雾气
上方 0–22%：夜空/屋檐，干净，放标题
中间 30–78%：幽暗回廊，放三张难度卡
下方 8%：暗，放提示
```

- 窗框是室内/室外的分界线
- 猫在窗台或门槛，身体朝外
- 蝙蝠在窗框附近，正飞向外面
- 唱片已经离开店铺，落在回廊里
- 中心是室外回廊，不是室内走廊

## 3. 主 Prompt（英文）

```text
16:9 landscape game menu background, 1920x1080,
handmade paper-cut storybook diorama, flat layered construction paper,
slight depth, soft paper grain, clean cut edges,
on the left a bright sunlit cozy music shop interior,
warm morning sunlight through a large open window, sheer curtain, wooden counter,
shelves of vinyl records, small potted plants, cream and amber tones,
through the open window, outside the shop, a separate dark exterior maze corridor,
freestanding tall maze walls under a deep night sky, no ceiling, no room,
cold blue mist, deep aubergine and plum shadows, thin cyan musical glow,
a small black bat silhouette flying out of the sunlit shop through the window,
carrying a shiny vinyl record in its claws, the record slipping and falling outside,
a thin cyan glint on the falling record, subtle motion, not scary,
a small fluffy seal bicolor ragdoll cat on the windowsill at the lower left,
ivory cream body, dark chocolate brown mask and ears, dark brown bushy tail,
bright blue eyes, dark red collar with a small amber tag,
looking out into the dark exterior maze, back three-quarter view, curious and brave,
the shop is warm and sunny, the outside corridor is dark and mysterious,
empty calm center for a title and three difficulty cards,
low contrast dark center, visual interest on the left and right edges,
soft vignette, cinematic composition, high contrast silhouette,
muted colors, not neon, not photorealistic,
no text, no letters, no UI, no buttons, no cards, no frames,
no logo, no watermark, no signature,
the corridor is outside the shop, not inside the room,
no interior hallway, no corridor inside a room, no abandoned house,
no orange tabby, no orange cat
```

## 4. 负面 Prompt

```text
text, letters, typography, words, logo, watermark, signature,
UI, menu, buttons, cards, panels, frames, borders,
corridor inside the room, interior hallway, indoor corridor, room with a dark hallway,
door inside the shop leading to a corridor, abandoned house, abandoned record store,
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
左侧是一间阳光照进来的温暖音乐房间/店铺，
大窗户打开，薄窗帘，木柜台，唱片架，小绿植，奶油色和琥珀色，
窗外、店铺外面，是一条独立的幽暗回廊迷宫，
高大的迷宫墙，露天，没有天花板，不是室内走廊，
深蓝雾气，深紫黑阴影，青蓝色微弱音乐光，
一只小黑蝙蝠剪影从阳光店铺里飞出窗户，
爪子里抓着一张发亮的黑胶唱片，唱片在窗外滑落，
唱片边缘有一道青蓝反光，轻微运动感，不恐怖，
左下角窗台上蹲着一只海豹双色布偶猫，
奶油白身体，深巧克力棕面罩和耳朵，深棕蓬松尾巴，
蓝色眼睛，暗红色项圈和小琥珀吊牌，
朝窗外幽暗回廊看，身体略背对镜头，好奇又勇敢，
店铺温暖明亮，外面回廊黑暗神秘，
画面中间留空，低对比，用于标题和三张难度卡，
左右两侧有视觉重点，中心安静，
柔和暗角，电影感构图，剪影清晰，
低饱和，不要霓虹，不要写实，
不要文字、字母、UI、按钮、卡片、边框、logo、水印，
回廊在店铺外面，不在房间里，不要室内走廊，
不要废弃旧房，不要废弃唱片店，不要橘猫，不要橘色猫
```

## 6. 备选构图

### A. 猫在窗台，蝙蝠刚飞出（推荐）

```text
same as main prompt, cat on the windowsill at lower left,
bat crossing the window frame, record already falling into the exterior maze
```

### B. 猫在窗台右侧

```text
same as main prompt, cat on the right side of the window,
bat and falling record on the right, left side darker for the title
```

### C. 无猫，只保留事件

```text
same as main prompt, no characters, no cat,
sunlit shop on the left, bat flying out of the window with a falling record,
empty dark exterior maze center for menu cards
```

## 7. 模型参数

### Midjourney

```text
--ar 16:9 --style raw --stylize 80
--no text, letters, UI, buttons, cards, watermark, human, catgirl,
orange tabby, interior hallway, abandoned house
```

### Flux / SDXL

- 分辨率：1536×864 或 1920×1080
- Steps：28–35
- CFG：4–6
- 固定 seed
- 如果模型总把回廊画进房间，用 img2img 加强“窗外/室外”构图
- 中心不够暗时，后期把回廊区域压暗

### 图生图参考

```text
keep the sunlit shop interior on the left and the paper-cut palette,
make the large window open to a separate exterior dark maze corridor,
the corridor must be outside the shop, under the night sky, no ceiling,
add a small bat flying out with a falling vinyl record,
add a seal bicolor ragdoll cat on the windowsill,
keep the center dark for menu cards,
no text, no UI, no interior hallway, no orange cat
```

## 8. 生成后处理

1. 裁切到 1920×1080
2. 中心回廊压暗 10–20%，保证卡片和文字可读
3. 阳光只保留在店铺内部，不照进回廊
4. 四周轻微暗角
5. UI 在 Figma/Cocos 叠加，不要烘进图
6. 导出 PNG，sRGB，控制在 2–4MB

## 9. 验收

- 16:9 横屏
- 左侧是阳光音乐房间/店铺
- 回廊在**窗外/室外**，不是室内走廊
- 回廊是独立迷宫，露天，无天花板
- 有蝙蝠飞出、唱片掉进回廊的事件
- 猫是海豹双色布偶猫，不是橘猫
- 中心足够暗，能放三张难度卡
- 没有文字/UI/水印