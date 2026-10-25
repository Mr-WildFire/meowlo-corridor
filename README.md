# 喵音回廊 · 玩法骨架 Demo

Cocos Creator **3.8.8** 的 2D 玩法骨架，对应开发文档的 **M0/M0.5（迷宫整体 + 可玩骨架补强）**。
当前美术是脚本生成的**扁平占位 PNG**（老八、地板、墙、碎片、道具、出口），HUD 仍用 `Graphics + Label`；音乐是脚本生成的 6 层占位 WAV（AudioSource），缺失时回退 WebAudio；音效由 WebAudio 合成。没有使用任何外部美术/音频素材。

## 运行

1. 用 Cocos Creator 3.8.8 打开本目录（`D:\Projects\MusicCat`）。
2. 打开场景 `assets/scenes/Main.scene`。
3. 点击编辑器顶部的 **预览**（浏览器预览即可）。
4. 启动后先在难度菜单选择 **轻松 / 标准 / 困难**（也可按 `1/2/3`）。
5. 推荐预览分辨率：**1920 × 1080 横屏**；游戏使用 `SHOW_ALL`，HUD 固定、迷宫相机跟随猫咪。

## 操作

| 输入 | 行为 |
|---|---|
| `WASD` / 方向键 / 屏幕滑动 / 鼠标拖动 | 移动一格 |
| 右上角 `≡` 菜单 | 暂停/继续、设置、静音、重开、难度 |
| 屏幕左上角 `Ⅱ` | 暂停 / 继续 |
| `P` | 暂停 / 继续 |
| `V` | 静音 / 恢复（HUD 右上角按钮同效） |
| `O` | 打开设置（音量 / 静音 / 语言 / 震动 / 重置记录） |
| `M` | 返回难度菜单（换难度） |
| `R` | 重开一局（当前难度/新种子） |
| `C` | 测试用：直接收集全部碎片（触发 1 秒静默 + 出口） |
| `T` | 测试用：剩余时间 -30 秒 |

## 已实现（M0/M0.5 + 占位美术 + M1 玩法）

- [x] 随机完美迷宫（DFS + 5% 环路），同种子可复现
- [x] 三档难度：轻松 11×13 / 3 碎片 / 5:00，标准 15×19 / 4 碎片 / 7:00，困难 19×23 / 5 碎片 / 9:00
- [x] 难度同时改变迷宫规模、环路比例（8%/5%/0%）、道具数量（6/8/12）与干扰密度
- [x] 碎片按四象限 + 最小 BFS 间距分散；出口距离 3–5 / 4–6 / 6–9 步
- [x] 2 格视野：全屏 Shader 柔边遮罩，跟随玩家平滑移动；加载失败自动回退格子遮罩
- [x] 按难度生成 3/4/5 块“音轨碎片”，集齐后播放 CD 拼合演出：碎片飞向中心 → CD 成型 → 1 秒静默 → 高潮 → 出口
- [x] 出口光柱穿透遮罩，终局可发现
- [x] 倒计时 5:00/7:00/9:00；60s/30s 提醒；超时主人抱走并强制结束
- [x] 难度选择菜单、时间星级结算（3/2/1 星）、M 键返回难度菜单
- [x] 最佳星级/用时按难度保存；菜单显示“最佳 ★★☆ · 03:12”；静音设置持久化
- [x] 设置页：主音量滑条、静音、语言（中文/English）、震动开关、清除最佳记录；设置持久化
- [x] 每种道具第一次拾取显示教学卡，重复拾取改为短提示
- [x] 超时 1.5 秒占位演出（主人推门 → 老八被抱起）后再弹出结算
- [x] 蝴蝶（10 步寻路）、萤火虫（4 格 10s）、鲜花酒（反向 10s）、猫条（2 格 10s）、下水道（随机传送）
- [x] 小鱼干（+20s）、毛线球（15s 路径记忆）
- [x] 占位美术：老八四方向 4 帧行走、地板、墙、碎片、8 种道具、出口；菜单背景、完整 CD、主人剪影；`ArtAssets` 加载失败时回退 Graphics
- [x] HUD：音轨进度、倒计时、步数、效果、种子、难度/时间上限
- [x] 键盘 + 滑动 + 鼠标拖动；右上角单按钮菜单、超时/通关结算
- [x] 6 层占位 WAV 音乐（AudioSource）：底轨 + 每块碎片解锁一层 + 1 秒静音 + 高潮；暂停/继续/切难度会停/恢复
- [x] WAV 加载失败时回退到 WebAudio 程序化音乐；文件式 SFX（AudioSource）：点击、拾取、通关、超时、脚步，原生 HAP 也可用
- [x] 正式 OGG 音频仍未接入，后续按同名资源替换 WAV 即可

## 尚未实现（后续阶段）

- 正式 6 层 OGG 音乐、高潮/音效（当前是占位 WAV / 文件式 SFX）
- 正式 2D 美术（替换当前扁平占位图）、正式 UI、主人/结局正式演出
- 道具的正式音效（当前是文件式占位 SFX）
- 鸿蒙 **签名 HAP** 与真机安装/触摸/音频验证（unsigned HAP 已构建，见下）
- 正式存档、演示模式

## 已验证

- TypeScript 以 Cocos 3.8.8 类型声明编译通过（`skipLibCheck`，无业务代码错误）。
- 1000 个种子的迷宫连通性/路径测试通过。
- Cocos Creator 3.8.8 `web-desktop` 构建成功，场景 `Main` 正确注册并运行 `DemoGame`。
- 浏览器实测：场景加载无异常；走一步、集齐 3/4/5 碎片、1 秒终局、出口生成、进入出口通关、超时结算均可触发。
- 遮罩 Shader 已实际加载并出图（柔边圆形视野）；萤火虫 4 格半径切换、滑动/键盘输入已验证。
- 占位美术已实际加载：老八 16 帧、地板/墙、碎片、8 种道具、出口、菜单背景、CD、主人剪影均正常显示；老八移动时切换方向与行走帧。
- 三档难度、难度菜单、3/4/5 碎片、5/7/9 分钟、60s/30s 提醒、3/2/1 星结算均已实际验证。
- 困难 19×23 地板完整覆盖棋盘，墙体/碎片/道具随格子尺寸正确缩放。
- 困难碎片不再扎堆：12 个种子中任意两块最小 BFS 距离 48–79，四象限均有分布；出口 6–9 步。
- 首次道具教学卡、超时 1.5 秒演出与延迟结算已实际验证。
- CD 拼合终局：最后一块碎片后碎片飞向中心、CD 成型、1 秒静音、高潮、出口生成，全流程实际跑通。
- `FogView / GuideView / InputRouter` 拆分后，遮罩、蝴蝶路径、移动与菜单流程回归通过。
- 6 个 WAV 音轨成功加载为 AudioSource；用户手势后同时播放，6 路时间差 < 1ms；1 秒静音→高潮流程实际跑通。
- 5 个 SFX WAV 成功加载到 `SfxDirector`；菜单选择/拾取/通关/超时会触发对应 AudioSource 音效；通关 CD、超时主人插画显示正常。
- WAV 缺失时回退程序化音乐；原生端无 WebAudio 时静音但不影响玩法。
- 最佳成绩/静音/音量写入 localStorage，刷新页面后仍保留；菜单、设置页与 HUD 静音按钮状态同步。
- 设置页滑条实际改变主音量并同步 AudioSource 音量；关闭设置后继续游戏。
- 语言切换后菜单/HUD/教学/结算全部切换为 English；震动开关在浏览器触发 `navigator.vibrate`；重置记录二次确认后清空最佳成绩。
- 构建产物在 `build-demo/web-desktop`（本地打开需 HTTP 服务；日常开发直接使用 Cocos 预览即可）。
- **HarmonyOS Release HAP + APP 已产出**：`build-harmony/MeowloCorridor-1.0.0-release-signed.hap`（29,810,136 字节，约 28.4 MB，SHA-256 `DE3D2197FFB2CBF9030039C0B3C4DE56D9F118456AF3C09749E2EA7643F5E2BC`）与 `build-harmony/MeowloCorridor-1.0.0-release-signed.app`（14,504,915 字节，约 13.8 MB，SHA-256 `B62B035B3D2322789951FFFCE07A3CEF2B11FF4B6100CE1DFC16DBCAFA06E6F6`）。两者均使用 AGC 发布证书 + `app_gallery` Release Profile 签名，不绑定单台设备 UDID；HAP 用于 `hdc install`，APP 用于 AGC 上传/内测。应用名已修复为 **喵音回廊**，并已改为 1920×1080 横屏、固定 128px 格子 + 相机跟随、顶部单行 HUD + 单按钮菜单；未连接真机，安装方式与 AGC 内测流程见 [docs/鸿蒙HAP构建.md](docs/鸿蒙HAP构建.md)。
- **官方模拟器限制**：HarmonyOS 6.0.1 模拟器为 x86_64，而当前 Cocos HAP 的 native 库是 arm64-v8a，安装会报 `9568347` ABI 不匹配；没有鸿蒙手机时优先用 AGC 云真机或借比赛手机，详见构建文档 §9。

## 代码结构

```text
assets/
├─ scenes/Main.scene              # 只挂一个 DemoGame 组件
├─ resources/
│  ├─ effects/fog.effect          # 2 格柔边遮罩 Shader
│  ├─ audio/music/                # 6 层占位 WAV + climax
│  ├─ audio/sfx/                  # 点击/拾取/通关/超时/脚步
│  └─ art/                        # 脚本生成的占位 PNG
│     ├─ cat/                     # 老八 4 方向 × 4 帧
│     ├─ board/                   # floor.png / wall.png
│     ├─ ui/                      # menu_bg.png
│     └─ props/                   # 碎片/道具/CD/主人/出口
└─ scripts/
   ├─ core/
   │  ├─ Rng.ts                   # 确定性随机
   │  ├─ AudioDirector.ts         # 6 层 AudioSource 音乐 + 静音/高潮
   │  ├─ SfxDirector.ts           # 文件式 SFX：点击/拾取/通关/超时/脚步
   │  ├─ MusicDirector.ts         # WAV 加载失败时的程序化回退
   │  ├─ ProgressStore.ts         # 最佳记录 / 音量 / 静音 / 语言 / 震动
   │  ├─ Locale.ts                # 中文/English 文案与难度/道具名
   │  ├─ VibrationService.ts      # 浏览器震动（原生暂 no-op）
   │  └─ ToneSynth.ts             # 浏览器占位音效（非最终音频方案）
   └─ game/
      ├─ MazeGenerator.ts         # 纯逻辑：DFS、BFS、路径、死路
      ├─ MazeModel.ts             # 迷宫查询封装
      ├─ DemoTypes.ts             # 碎片/道具/状态类型
      ├─ UiKit.ts                 # 颜色、节点/Graphics/Label 工厂
      ├─ MazeRenderer.ts          # 棋盘、墙、碎片/道具/角色/出口视图
      ├─ FogView.ts               # 2 格 Shader 遮罩 + 格子回退
      ├─ GuideView.ts             # 毛线轨迹、出口光柱、蝴蝶路径
      ├─ InputRouter.ts           # 键盘/触摸/鼠标事件路由
      ├─ PlayerController.ts      # 逐格移动、Tween、步数、传送
      ├─ CatView.ts               # 老八四方向行走帧动画
      ├─ ArtAssets.ts             # resources 占位图异步加载 + 回退
      ├─ LevelConfig.ts           # 三档难度：尺寸/碎片/时间/道具数量
      ├─ MenuView.ts              # 难度选择菜单 + 最佳记录 + 设置入口
      ├─ SettingsView.ts          # 音量 / 静音 / 语言 / 震动 / 重置记录
      ├─ FinaleView.ts            # 碎片拼 CD、静音/高潮/出口三段式终局
      ├─ HudView.ts               # 顶部 HUD、单按钮菜单、Toast/结算层
      ├─ ItemSystem.ts            # 道具落点与效果分发
      └─ DemoGame.ts              # 编排：状态、计时、碎片、终局、输入
tools/                             # 占位资源生成、HarmonyOS 图标
scripts/build-harmony.ps1          # Cocos → patch → hvigor HAP + APP 双产物
docs/鸿蒙HAP构建.md                # 工具链、构建、签名与真机步骤
docs/资源需求清单.md               # 正式 UI/美术/音频/字体需求与验收标准
docs/横屏前端资源清单.md           # 1920×1080 横屏 UI/图标/字体/9-slice 清单
docs/美术风格建议.md               # 纸雕绘本 + 旧唱片 UI 的视觉方向
docs/AI美术生成工作流.md           # AI 出图、prompt、切图、动画与接入流程
docs/prompts/老八三视图-prompt.md   # 布偶猫参考的三视图/单视角 prompt
docs/prompts/横屏菜单背景-prompt.md # 1920×1080 纸雕回廊菜单背景 prompt
```

占位图由 `tools/gen_placeholder_art.py` 生成，占位音乐由 `tools/gen_placeholder_audio.py` 生成，占位音效由 `tools/gen_placeholder_sfx.py` 生成；正式资源到位后按同名路径替换即可。

## 说明

- `DemoGame` 现在是编排层；场景本身仍很轻，运行时生成全部节点。M1 后续替换为 Prefab/正式场景。
- 已从单文件拆出 `MazeRenderer / PlayerController / HudView / ItemSystem / FogView / GuideView / InputRouter`，并新增 `ArtAssets / CatView / LevelConfig / MenuView`；`DemoGame` 现在主要负责一局流程编排。
- 占位图不是最终美术，只用于把 Sprite/动画/资源加载管线跑通；正式图到位后按 `assets/resources/art/` 同名路径替换即可。
- 遮罩优先使用 `resources/effects/fog.effect` 的 Shader；如果设备/构建不支持自定义材质，会自动回退到格子遮罩，保证仍可玩。
- 音乐与 SFX 均走 `AudioSource`，HAP 内已打包；鸿蒙真机的 WAV 解码/延迟/音频焦点仍未验证。
- 场景通过脚本 UUID 绑定组件：`assets/scripts/game/DemoGame.ts.meta` 中的 UUID 与 `Main.scene` 里的压缩 UUID 必须保持一致；不要手动改其中一个。
























