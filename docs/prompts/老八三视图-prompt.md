# 老八三视图 Prompt（布偶猫参考）

> 用途：给支持参考图/图生图的模型使用。  
> 参考图：用户提供的海豹双色布偶猫照片。  
> 注意：不要纯文本硬抽；优先使用 reference image / image-to-image / IP-Adapter / character reference。

## 0. 先定义角色

参考图里的猫是：

```text
海豹双色布偶猫
奶油白/象牙白身体
深巧克力棕面罩，覆盖双眼和耳朵
深棕色蓬松尾巴
蓝色眼睛
粉色鼻子
白色口鼻、胸口、前爪
长毛、大耳朵、圆润口吻
```

游戏版老八额外加：

```text
暗红色项圈 + 小琥珀吊牌
```

如果模型对项圈反应过度，可以先去掉项圈生成三视图，后期在 Figma/Photoshop 加。

## 1. 推荐生成方式

优先级从高到低：

1. **参考图 + 图生图/角色参考**（最稳）
2. **参考图 + IP-Adapter**
3. **参考图 + Flux Kontext / Qwen Image Edit**
4. 纯文本多 seed（最不稳，只适合概念）

不要直接让模型生成“16 帧精灵表”。  
先出三视图，再切件/绑定做动画。

## 2. 主 Prompt（英文，三视图一张）

```text
Use the attached photo as the exact character reference for coat pattern and colors.
Do not copy its background, pose, or crop.

Create a professional 2D game character turnaround sheet of ONE feral quadruped Ragdoll cat named Laoba.
Three full-body views arranged left to right:
1) front view facing the camera
2) left side profile facing screen-left
3) rear view facing away from the camera

The same cat in all three views: same proportions, same scale, same ground line,
neutral standing pose on four legs, all four paws visible, long fluffy tail visible.

Seal bicolor Ragdoll markings:
ivory cream body, dark chocolate brown mask covering both eyes and ears,
dark chocolate brown bushy tail, white muzzle, white chest, white front paws,
bright blue eyes, pink nose, long fluffy coat, large ears, rounded muzzle.

Simple dark red collar with a small amber tag.

Stylized paper-cut storybook game art, layered construction paper, soft paper grain,
clean silhouette, subtle warm amber rim light, muted deep plum seamless studio background,
soft contact shadow under the paws.

Orthographic, no perspective, production character reference sheet,
high resolution, 3:2 landscape, no text, no labels, no watermark, no logo.
```

## 3. 负面 Prompt

```text
human, humanoid, anime girl, catgirl, kemonomimi, bipedal, standing upright,
human body, human torso, breasts, clothes, shoes, hands, fingers,
extra limbs, extra tails, deformed paws, missing tail, cropped ears, cropped paws,
three legs, five legs, perspective, 3D render, photorealistic, plastic, toy,
neon, cyberpunk, horror, gore, busy background, scenery, props,
text, letters, labels, watermark, logo, signature, frame, UI overlay,
blurry, low contrast, cluttered details
```

## 4. 单视角 Prompt（推荐）

如果模型一张三视图不稳定，就一次生成一个视角，再人工拼。

### 4.1 正视

```text
Use the attached photo as the exact coat pattern and color reference.
ONE full-body front view of a feral quadruped Ragdoll cat, facing the camera,
standing on four legs, neutral pose, all paws visible, tail visible behind,
seal bicolor Ragdoll: ivory cream body, dark chocolate brown mask over both eyes and ears,
white muzzle, white chest, white front paws, bright blue eyes, pink nose, long fluffy fur,
simple dark red collar with small amber tag,
stylized paper-cut storybook game art, layered paper, soft grain,
muted deep plum seamless studio background, warm amber rim light,
orthographic, centered, full body, no crop,
no human, no humanoid, no bipedal, no clothes, no text, no watermark
```

### 4.2 左侧视

```text
Use the attached photo as the exact coat pattern and color reference.
ONE full-body left side profile of a feral quadruped Ragdoll cat, facing screen-left,
standing on four legs, neutral pose, full tail visible, one blue eye visible,
seal bicolor Ragdoll: ivory cream body, dark chocolate brown mask and ear,
white muzzle, white chest, white paws, dark chocolate brown bushy tail,
long fluffy fur, simple dark red collar with small amber tag,
stylized paper-cut storybook game art, layered paper, soft grain,
muted deep plum seamless studio background, warm amber rim light,
orthographic, centered, full body, no crop,
no human, no humanoid, no bipedal, no clothes, no text, no watermark
```

### 4.3 后视

```text
Use the attached photo as the exact coat pattern and color reference.
ONE full-body rear view of a feral quadruped Ragdoll cat, facing away from the camera,
standing on four legs, neutral pose, back of head, back, hind legs and full bushy tail visible,
no face, no eyes,
seal bicolor Ragdoll: ivory cream body, dark chocolate brown ears and tail,
white hind paws, long fluffy fur, simple dark red collar with small amber tag,
stylized paper-cut storybook game art, layered paper, soft grain,
muted deep plum seamless studio background, warm amber rim light,
orthographic, centered, full body, no crop,
no human, no humanoid, no bipedal, no clothes, no text, no watermark
```

## 5. 中文版 Prompt（即梦/通义/可灵等）

```text
参考图是一只海豹双色布偶猫，请严格保留它的花色和颜色：
奶油白身体、深巧克力棕面罩（覆盖双眼和耳朵）、深棕色蓬松尾巴、
蓝眼睛、粉鼻子、白色口鼻/胸口/前爪、长毛、大耳朵。

生成一张 2D 游戏角色三视图，从左到右：
正面、左侧面、背面。
同一只猫，四足站立，自然猫比例，不要拟人，不要人形，不要双足站立。
全身完整，四只爪子可见，尾巴完整，三视图比例一致、脚底在同一水平线。
游戏版可加一条暗红色项圈和小琥珀吊牌。

纸雕绘本风格，分层纸张，轻微纸张纹理，清晰剪影，
深紫黑色纯色背景，暖琥珀色边缘光，脚下柔和接触阴影。
正交视角，不要透视，3:2 横图，不要文字、标签、水印、logo。
```

## 6. 不同模型的参数建议

### Midjourney

- 用 `--cref <参考图URL>` 做角色参考
- `--cw 100` 尽量保留脸和花色
- `--ar 3:2`
- `--style raw`
- `--no text, watermark, human, humanoid, bipedal, clothes`
- 三视图一张不稳定时，用单视角 prompt 分别生成

### Stable Diffusion / ComfyUI

- 模型：SDXL / Flux
- 参考图：IP-Adapter（角色/风格）
- 可选：ControlNet OpenPose（但不要用人类骨架，容易拟人）
- 分辨率：1536×1024
- Steps：28–35
- CFG：5–7
- 固定 seed
- 每个视角生成 4 张，选最一致的
- 负面 prompt 用上面的完整版

### Flux Kontext / Qwen Image Edit

```text
Using the attached cat photo as the exact character reference,
turn this cat into a three-view character sheet: front, left side, rear.
Keep the seal bicolor markings, blue eyes, dark brown mask/ears/tail,
cream body, long fur, and add a dark red collar with amber tag.
Orthographic, full body, four legs, no human, no text, no watermark.
```

### 即梦 / 通义万相 / 可灵

- 上传参考图，选择“参考图/角色参考”
- 参考强度调高（0.7–0.85）
- 用中文 prompt
- 一次只生成一个视角，别直接要“三视图”
- 生成 4 张选 1 张

## 7. 一致性检查表

生成后逐项检查：

- [ ] 三张图是同一只猫
- [ ] 面罩形状一致（覆盖双眼/耳朵）
- [ ] 耳朵颜色一致
- [ ] 尾巴颜色/蓬松度一致
- [ ] 蓝眼睛
- [ ] 白口鼻/白胸口/白前爪
- [ ] 四足站立，不是人形/双足
- [ ] 四只爪子完整
- [ ] 尾巴完整，没有断尾/多尾
- [ ] 项圈和吊牌一致
- [ ] 三视图比例/脚底线一致
- [ ] 没有文字/水印
- [ ] 背景干净，方便抠图

## 8. 后期处理

1. 选最一致的三张
2. 去背景/修边
3. 统一尺寸、脚底线、朝向
4. 在 Figma/Photoshop 拼成三视图
5. 标签用字体加，不要让 AI 生成
6. 需要游戏 sprite 时，再切件/绑定 Spine

## 9. 最重要的三句话

```text
1. 用参考图，不要纯文本。
2. 一次一个视角，不要直接要三视图。
3. 四足、动物、非拟人，写进正向和负向 prompt。
```