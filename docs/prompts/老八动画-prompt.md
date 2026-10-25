# 老八动画 Prompt

> 目标：把当前三张静态图升级为可播放的 4 方向行走 / 待机 / 拾取
> 当前问题：正面是坐姿，侧/背面是站姿，直接做行走会突然站起来
> 原则：先统一站姿，再做动画；不要直接拿三张图硬切

## 0. 角色固定设定

每一帧都必须保持一致：

```text
海豹双色布偶猫
奶油白身体
深巧克力色面罩 / 耳朵 / 尾巴
白色口鼻、胸毛、爪子
亮蓝色眼睛
暗红色项圈
小黑胶唱片吊牌
粗深紫黑轮廓
2D 卡通平涂
```

不要出现：

```text
橘猫
狸花猫
写实猫
3D 猫
不同花纹
不同项圈
不同眼睛颜色
多一条腿/少一条腿
```

## 1. 先补：正面站姿

当前 `laoba_front` 是坐姿，不能直接做行走。

### 规格

```text
512×512
透明背景
正面站姿
脚底线一致
```

### Prompt

```text
2D cartoon game character, seal bicolor Ragdoll cat,
cream white body, dark chocolate mask, ears and tail,
white muzzle, chest and paws, bright blue eyes,
dark red collar with a small black vinyl-record charm,
clean bold dark-plum outline, flat colors, subtle paper grain,
standing neutral pose, front view, all four paws on the ground,
centered, full body visible, transparent background,
no text, no watermark, no shadow, no background scenery,
512x512, game sprite reference
```

## 2. 行走动画统一前缀

每个方向都先加：

```text
2D cartoon game sprite strip, seal bicolor Ragdoll cat,
cream white body, dark chocolate mask, ears and tail,
white muzzle, chest and paws, bright blue eyes,
dark red collar with a small black vinyl-record charm,
clean bold dark-plum outline, flat colors, subtle paper grain,
8 equal frames in one horizontal row, left to right,
each frame 256x256, character centered in every cell,
identical scale, identical ground line, identical markings,
transparent background, no grid lines, no frame numbers,
no text, no labels, no shadow, no motion blur, no background scenery,
2048x256 sprite strip
```

## 3. 正面行走

周期：

```text
接触 → 下沉 → 通过 → 抬起
换腿重复一次
```

```text
2D cartoon game sprite strip, seal bicolor Ragdoll cat,
cream white body, dark chocolate mask, ears and tail,
white muzzle, chest and paws, bright blue eyes,
dark red collar with a small black vinyl-record charm,
clean bold dark-plum outline, flat colors, subtle paper grain,
8 equal frames in one horizontal row, left to right,
each frame 256x256, character centered in every cell,
identical scale, identical ground line, identical markings,
transparent background, no grid lines, no frame numbers,
no text, no labels, no shadow, no motion blur, no background scenery,
2048x256 sprite strip,

front view walking cycle, standing on four legs,
alternating forelegs, slight vertical body bob,
tail sways gently left and right,
collar tag swings slightly, ears stay upright,
frame 1 contact, 2 down, 3 passing, 4 up,
5 contact with opposite legs, 6 down, 7 passing, 8 up,
clean readable silhouette, game walk cycle
```

## 4. 背面行走

```text
2D cartoon game sprite strip, seal bicolor Ragdoll cat,
cream white body, dark chocolate mask, ears and tail,
white muzzle, chest and paws, bright blue eyes,
dark red collar with a small black vinyl-record charm,
clean bold dark-plum outline, flat colors, subtle paper grain,
8 equal frames in one horizontal row, left to right,
each frame 256x256, character centered in every cell,
identical scale, identical ground line, identical markings,
transparent background, no grid lines, no frame numbers,
no text, no labels, no shadow, no motion blur, no background scenery,
2048x256 sprite strip,

back view walking cycle, standing on four legs,
alternating hind legs, visible shoulder movement,
large dark chocolate tail sways side to side,
small body bob, ears stable,
frame 1 contact, 2 down, 3 passing, 4 up,
5 contact with opposite legs, 6 down, 7 passing, 8 up,
clean readable silhouette, game walk cycle
```

## 5. 侧面行走

左向；右向用镜像，不要重新生成。

```text
2D cartoon game sprite strip, seal bicolor Ragdoll cat,
cream white body, dark chocolate mask, ears and tail,
white muzzle, chest and paws, bright blue eyes,
dark red collar with a small black vinyl-record charm,
clean bold dark-plum outline, flat colors, subtle paper grain,
8 equal frames in one horizontal row, left to right,
each frame 256x256, character centered in every cell,
identical scale, identical ground line, identical markings,
transparent background, no grid lines, no frame numbers,
no text, no labels, no shadow, no motion blur, no background scenery,
2048x256 sprite strip,

left-facing side view walking cycle, standing on four legs,
near and far legs alternate with clear phase offset,
tail counter-sways, slight body bob,
head stays level, ears upright,
frame 1 contact, 2 down, 3 passing, 4 up,
5 contact with opposite legs, 6 down, 7 passing, 8 up,
clean readable silhouette, game walk cycle
```

## 6. 待机

### 规格

```text
4 帧
1024×256
```

```text
2D cartoon game sprite strip, seal bicolor Ragdoll cat,
cream white body, dark chocolate mask, ears and tail,
white muzzle, chest and paws, bright blue eyes,
dark red collar with a small black vinyl-record charm,
clean bold dark-plum outline, flat colors, subtle paper grain,
4 equal frames in one horizontal row, left to right,
each frame 256x256, character centered, identical scale and ground line,
transparent background, no grid lines, no labels, no text,
no shadow, no background scenery,
1024x256 sprite strip,

front view idle animation, standing still,
very subtle breathing, chest rises 1-2 pixels,
one slow blink on frame 3, tail tip twitch on frame 4,
no walking, no head turn, calm expression,
game idle cycle
```

## 7. 拾取

```text
6 帧
1536×256
```

```text
2D cartoon game sprite strip, seal bicolor Ragdoll cat,
cream white body, dark chocolate mask, ears and tail,
white muzzle, chest and paws, bright blue eyes,
dark red collar with a small black vinyl-record charm,
clean bold dark-plum outline, flat colors, subtle paper grain,
6 equal frames in one horizontal row, left to right,
each frame 256x256, character centered, identical scale and ground line,
transparent background, no grid lines, no labels, no text,
no shadow, no background scenery,
1536x256 sprite strip,

side view pickup animation,
frame 1 neutral stand, 2 crouch, 3 reach forward with one paw,
4 paw touches a small glowing object, 5 lift the object,
6 return to neutral with the object near the chest,
gentle curious expression, tail balanced, game pickup cycle
```

## 8. 通用负面 Prompt

```text
orange tabby, ginger cat, calico, different cat, different markings,
brown mask missing, white muzzle missing, wrong eye color,
different collar, no collar, no record charm,
extra legs, missing legs, broken anatomy, twisted paws,
different body proportions, changing head size, changing scale,
realistic, 3D render, plastic, toy, CGI, clay,
text, numbers, labels, frame numbers, grid lines, watermark, logo,
background, room, floor, scenery, shadow, motion blur,
hard outline missing, blurry, low contrast, noisy, jpeg artifacts,
cropped, cut off ears, cut off tail, cut off paws
```

## 9. 生成顺序

```text
1. 正面站姿
2. 正面行走
3. 背面行走
4. 左侧行走
5. 右侧镜像
6. 待机
7. 拾取
```

不要一次生成四个方向。  
每个方向先生成 2–3 版，选步态和花纹最稳的一版。

## 10. 导出

```text
256×256 单帧
透明 PNG
8 帧行走
4 帧待机
6 帧拾取
```

路径：

```text
assets/resources/art/cat/
├─ cat_down_0.png ... cat_down_7.png
├─ cat_up_0.png ... cat_up_7.png
├─ cat_left_0.png ... cat_left_7.png
├─ cat_right_0.png ... cat_right_7.png
├─ cat_idle_0.png ... cat_idle_3.png
└─ cat_pickup_0.png ... cat_pickup_5.png
```

当前代码只加载 `cat_{dir}_0`，播放完整行走前需要把 `ArtAssets` 改回多帧加载，并让 `CatView` 使用 8 帧。

## 11. 验收

- 四个方向同一体型
- 脚底线一致
- 花纹和项圈不漂
- 8 帧循环首尾能接上
- 256px 下单帧可读
- 48px 下仍能看出是猫
- 没有文字、网格、水印、背景

## 12. 最稳的工作流

纯文生图很难保证 8 帧一致，建议：

```text
1. 用现有侧/正/背图做 image reference
2. 先生成一张标准站姿
3. 用图生图生成同一姿势的 8 个步态
4. 或生成 2 秒走路视频，再抽 8 帧
5. 最后统一裁到 256×256、对齐脚底线
```

不要直接让模型“画一张四方向八帧拼图”，角色会漂。