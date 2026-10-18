# 《喵音回廊》AI 美术生成工作流

> 版本：v1.0　|　日期：2026-10-18  
> 目标：用 AI 快速产出“纸雕绘本 + 旧唱片”风格的正式资源，并保证能接进 Cocos。

## 0. 先接受一个现实

AI 擅长：

- 风格探索
- 菜单主视觉
- 插画
- 图标/道具的初稿
- 材质/纹理

AI 不擅长：

- 精确 9-slice 边框
- 一套完全一致的按钮 4 态
- 16 帧逐帧动画
- 中文排版
- 严格透明背景/无缝平铺

所以正确流程是：

```text
AI 出风格稿/素材稿
→ 人工筛选、切图、修边
→ Figma 做 UI 组件
→ Spine/DragonBones 或逐帧做动画
→ Cocos 接入
```

不要期待“一句 prompt 直接出可用的整套 UI”。

## 1. 推荐工具链

| 环节 | 工具 |
|---|---|
| 风格探索/主视觉 | Midjourney、Flux、即梦、Seedream、通义万相 |
| 可控生成/一致性 | Stable Diffusion + ComfyUI、IP-Adapter、ControlNet、LoRA |
| UI 组件/切图 | Figma、Photoshop |
| 去背景 | Photoshop、remove.bg、rembg |
| 放大/修图 | Real-ESRGAN、Topaz、Photoshop |
| 角色动画 | Spine、DragonBones、Cocos 骨骼动画 |
| 图集/9-slice | Cocos Sprite Atlas、Figma |

如果只能选一个组合：

```text
即梦/Flux 出图
+ Photoshop 去背景/修边
+ Figma 做 UI
+ Spine 做猫动画
```

## 2. 先固定“风格 token”

每次生成都带同一段风格前缀，保证一致性。

### 英文前缀

```text
handmade paper-cut storybook game art, layered construction paper,
soft paper grain, muted aubergine and deep plum, warm amber cat,
cyan musical glow, cozy mysterious, high contrast, clean silhouette,
no text, no watermark, no logo
```

### 负面词

```text
text, letters, watermark, signature, UI overlay, frame,
photorealistic, 3D render, plastic, neon cyberpunk, horror gore,
extra limbs, deformed paws, blurry, low contrast, cluttered background,
cropped, cut off, busy details
```

### 中文简版

```text
纸雕绘本风格，分层纸张，纸张纹理，深紫黑回廊，琥珀色猫，
青蓝音乐微光，温暖神秘，高对比，清晰剪影，无文字，无水印
```

## 3. Prompt 公式

```text
[风格前缀]
+ [主体]
+ [动作/视角]
+ [材质/光照]
+ [构图/背景]
+ [技术规格]
```

示例：

```text
handmade paper-cut storybook game art, layered construction paper, soft paper grain,
muted aubergine and deep plum, warm amber cat, cyan musical glow,
a cute orange tabby cat with big head, short legs, cream muzzle, green eyes,
dark red collar with amber tag, standing front view, neutral pose,
full body, centered, transparent background, orthographic,
high contrast, clean silhouette, no text, no watermark
```

## 4. 资源逐个怎么生成

### 4.1 老八角色设定图

目标：先出**三视图/四方向参考**，不要直接出 16 帧动画。

```text
character turnaround sheet, same orange tabby cat, big head short legs,
cream muzzle, green eyes, dark red collar with amber tag,
front view, side view, back view, three-quarter view, neutral standing pose,
full body, orthographic, transparent background, consistent proportions,
handmade paper-cut storybook style, layered paper, soft grain,
muted aubergine background, warm amber rim light, no text
```

建议一次出 4 张，选最稳定的一张作为后续参考图。  
后续所有猫的图都带：

```text
same character as reference image, same proportions, same colors, same collar
```

### 4.2 猫的行走动画

不要直接让 AI 出“4×4 精灵表”，一致性通常不够。

推荐两种方案：

**方案 A：Spine/DragonBones 切件（推荐）**

- 生成猫的正面/侧面/背面设定图
- 在 Photoshop 里把头、身体、前腿、后腿、尾巴分开
- 导入 Spine 绑定骨骼
- 做 4 方向行走/待机/拾取/被抱起
- 优点：省帧、可复用、风格稳定

**方案 B：逐帧**

- AI 只生成 4 个关键姿势：站立、迈左、迈右、收脚
- 人工补中间帧/描线
- 不要指望 AI 自动保持 16 帧完全一致

### 4.3 菜单主视觉

```text
vertical 9:16 game menu key art, dark old record corridor,
layered paper diorama, hanging vinyl records, cyan musical notes floating,
warm amber lamp, deep aubergine shadows, empty center for title and three cards,
cat silhouette at the bottom, cinematic, soft vignette,
handmade paper-cut storybook style, no text, no logo
```

注意：

- 中间留空，不要生成文字
- 不要生成 UI 卡片，卡片在 Figma 里做
- 生成 2–3 张选构图，不要一张定稿

### 4.4 UI 面板/边框

```text
ornamental rectangular panel frame, empty center, symmetrical,
old paper and brass, subtle paper grain, straight edges,
9-slice friendly, border details only, transparent background,
game UI, no text, no icons
```

生成后：

- 在 Photoshop 里把中心拉平
- 在 Figma 里标 9-slice 边界（上/下/左/右）
- 导出 1024 左右图集

不要用 AI 直接生成“带文字的按钮”。

### 4.5 按钮四态

AI 一次出四态很难一致。建议：

- AI 只出“普通态”按钮底
- 在 Figma 里用同一底图做：
  - normal
  - pressed（压暗/内阴影）
  - disabled（降饱和）
  - highlight（琥珀描边）
- 导出图集

### 4.6 图标

一次出 12 个图标容易风格漂移。建议：

```text
single game icon, centered, thick outline, flat colors,
paper-cut style, soft grain, dark plum background, no text, no watermark
```

逐个生成，统一：

- 视角
- 描边宽度
- 圆角
- 阴影方向
- 尺寸

最后在 Figma 里统一网格和线宽。

### 4.7 黑胶碎片

```text
single black vinyl shard, broken record piece, iridescent rainbow edge,
cyan musical glow, floating, centered, transparent background,
game item icon, paper-cut style, high contrast, no text
```

不要用“水晶/宝石”关键词，否则会变成通用奇幻素材。

### 4.8 完整 CD

```text
complete iridescent CD, top-down view, centered, black vinyl with rainbow grooves,
soft cyan glow, transparent background, game item, paper-cut storybook style,
no text, no watermark
```

### 4.9 主人剪影

```text
warm silhouette of a person opening a door, backlit amber light,
paper-cut style, layered paper, no facial details, transparent background,
cozy, not scary, no text
```

### 4.10 地板/墙

```text
seamless tileable dark old wooden floor texture, top-down view,
even lighting, no perspective, no objects, subtle grain,
handmade paper texture, muted plum brown, game background tile
```

生成后必须做无缝检查：

- Photoshop 的 Offset 滤镜
- 看接缝是否明显
- 必要时手动修接缝

墙：

```text
seamless old wallpaper and dark wood wall strip, side view,
even lighting, no perspective, no objects, subtle paper grain,
muted aubergine and brown, game tile
```

### 4.11 蝴蝶/萤火虫

```text
paper origami butterfly, cyan and cream, musical note patterns on wings,
spread wings, centered, transparent background, game sprite, no text
```

```text
tiny warm firefly, paper wings, amber glow, centered, transparent background,
game sprite, no text
```

## 5. 一致性技巧

1. **固定风格前缀**：每次 prompt 开头完全一样
2. **固定参考图**：角色/场景用同一张参考图做 image-to-image
3. **固定 seed**：能固定就固定，再微调
4. **IP-Adapter/ControlNet**：保持角色脸型、构图、线稿
5. **先做风格板**：选 1 张主视觉，再生成其他
6. **角色 LoRA**：如果猫的图超过 20–30 张，可训练一个轻量 LoRA
7. **不要让 AI 生成文字**：所有文字用字体

## 6. 透明背景与切图

AI 出图通常没有真正的 alpha。流程：

1. 生成纯色/深色背景
2. 用 remove.bg / Photoshop / rembg 去背景
3. 检查边缘白边/黑边
4. 用 1–2px 内缩修边
5. 导出 PNG-24/32
6. 在 Cocos 里加投影/描边，不要把阴影烘进图

## 7. 尺寸与导出

| 资源 | 生成尺寸 | 导出 |
|---|---:|---:|
| 菜单背景 | 2160×3840 | 1080×1920 |
| 角色单帧 | 1024×1024 | 256×256 |
| 道具图标 | 512×512 | 128×128 |
| 碎片/CD | 1024×1024 | 256/512 |
| UI 面板 | 2048×2048 | 1024 图集 |
| 图标 | 512×512 | 96/128 |
| 地板 | 1024×1024 | 512 可平铺 |

导出：

- PNG-24/32，sRGB
- 透明背景
- 不要带文字/水印
- UI 图集单张 ≤ 2MB
- 角色/道具留 4–8px padding

## 8. 代码接入注意

当前 UI 很多是 Graphics：

```text
MenuView / HudView / SettingsView
```

正式 UI 要改成：

- `Sprite` + `SpriteFrame`
- 9-slice 面板：`Sprite.Type.SLICED` + border
- 图集：Sprite Atlas
- 字体：Label.font
- 统一 `UiSkin` 换肤层

替换路径时不要改现有文件名，除非同步改代码。  
新 UI 建议放：

```text
assets/resources/art/ui/
assets/resources/fonts/
```

## 9. 法务与比赛注意事项

- 查清工具的商业使用条款
- 不要用“某位在世艺术家风格”作为 prompt
- 不要生成现有游戏/动漫角色
- 保留 prompt、seed、生成日期、人工修改记录
- AI 图只能作为初稿，最终要有人工统一和修图
- 比赛若要求原创，提前确认 AI 素材规则

## 10. 推荐的第一周流程

### Day 1：风格板

- 用同一段风格前缀生成 6 张菜单主视觉
- 选 1 张定色彩/材质/构图

### Day 2：角色

- 生成 4 张老八三视图
- 选 1 张做参考，切件/绑定
- 生成 4 方向关键姿势

### Day 3：UI

- 生成 1 张面板边框、1 张按钮底
- Figma 做 9-slice、四态、滑条、开关
- 图标逐个生成，统一线宽

### Day 4：局内

- 地板/墙无缝图
- 碎片/出口/8 道具
- 做一张 1080×1920 局内 mockup

### Day 5：插画

- CD
- 主人剪影
- 教学插画
- 结算面板

### Day 6：接入

- 按路径导出
- 加 `.meta`
- Cocos 里替换 Graphics
- 检查 1080×1920 和英文

### Day 7：验收

- 菜单/局内/结算三张截图
- 看是否像同一个世界
- 再批量补剩余资源

## 11. 一句话总结

> 用 AI 做“风格、插画、材质、图标初稿”，用 Figma 做“UI 精度”，用 Spine 做“角色一致性”，最后人工修边和接入 Cocos。  
> 不要指望 AI 直接交付一套能用的 9-slice UI 和 16 帧动画。