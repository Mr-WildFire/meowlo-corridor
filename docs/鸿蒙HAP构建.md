# 喵音回廊 · HarmonyOS HAP/APP 构建记录

> 记录日期：2026-10-18　|　Cocos Creator 3.8.8　|　HarmonyOS Command Line Tools 26.0.0.821（API 26）

## 1. 当前结果

| 项目 | 结果 |
|---|---|
| Cocos `harmonyos-next` 工程 | 成功生成 `native/engine/harmonyos-next` |
| Native 编译（CMake + OHOS NDK） | 成功，产出 `libcocos.so` |
| ArkTS 编译 | 成功（API 26 仅有 `globalThis`/弃用 API 警告） |
| HAP 打包 | 成功 |
| HAP 签名 | ✅ **Release signed**（AGC 发布证书 + `app_gallery` Release Profile） |
| 当前通用产物 | `build-harmony/MeowloCorridor-1.0.0-release-signed.hap`（25,780,491 字节，约 24.6 MB） |
| Release SHA-256 | `FBC186FEDDEC4A51C68C1A01119ECB16D1BB5FE82F933B85B915DF2309CDC891` |
| 应用名 | `喵音回廊`（已修复之前的乱码） |
| 长屏适配 | `FIXED_WIDTH` + `sys.getSafeAreaRect()`；HUD 四边安全区、暂停/静音/设置内收、D-pad 底部预留 260 |
| AGC 上架包 | `build-harmony/MeowloCorridor-1.0.0-release-signed.app`（10,520,455 字节，签名验证通过） |
| 调试 unsigned 产物 | `build-harmony/MeowloCorridor-1.0.0-unsigned.hap`（45,324,360 字节，保留作对比） |
| 真机安装 | 未执行（当前没有连接 HarmonyOS 设备） |

> **通用包已产出**：Release Profile 不绑定单台设备 UDID；但 Profile 的 `app-distribution-type` 是 `app_gallery`，安装方式需要走 AGC 内测/应用市场，或先在目标设备验证能否直接 `hdc install`。签名材料路径在 `D:\Projects\MusicCat\cer`。

> **2026-10-19 图标更新**：应用图标替换为「唱片环 + 布偶猫 + 碎 CD 裂光」版本，`tools/icon/icon-512.png` 为唯一源文件（512×512 RGBA；`tools/harmony_icon.png` 为兼容副本），构建脚本会把它复制到 `AppScope/.../app_icon.png` 与 `entry/.../icon.png`。本次 `-SkipCocos -Release` 增量重打，`@SignHap` 成功；HAP 内两张图标与源文件 SHA-256 一致（`0DEEBA78…D6E8544`），`resources.index` 仍含 `喵音回廊`。体积因此从 25,055,494 增至 25,780,491 字节；随后又合入长屏 `FIXED_WIDTH` + SafeArea 适配。

## 1.1 上架包 `.app`（AGC 上传用）

`.hap` 是**模块包**，可以 `hdc install` 到设备；AGC / 应用市场侧要求的是 **App Pack `.app`**（内含一个或多个 HAP）。把 HAP 直接上传会报：`您所上传的软件包不是HarmonyOS应用后缀.app，请重新上传。`

现在 `scripts/build-harmony.ps1` **每次打包都会自动同时产出 HAP + APP**：

```powershell
# release 同时出 HAP 和 APP
.\scripts\build-harmony.ps1 -SkipCocos -Release -CltPath '<CLT目录>'

# debug 同时出 HAP 和 APP
.\scripts\build-harmony.ps1 -SkipCocos -CltPath '<CLT目录>'
```

脚本内部在 HAP 之后执行：

```powershell
hvigorw assembleApp --mode project -p product=default -p buildMode=release --no-daemon
```

| 项目 | 结果 |
|---|---|
| 原始输出 | `native/engine/harmonyos-next/build/outputs/default/harmonyos-next-default-signed.app` |
| 归档副本 | `build-harmony/MeowloCorridor-1.0.0-release-signed.app`（10,520,455 字节，约 10.0 MB） |
| SHA-256 | `DDB9DD2A3CF87FF56F766E8EB93F75761EE35A8BC4FC67666ADDBB6A2C64E243` |
| 内容 | `pac.json`、`pack.info`、`entry-default.hap`（25,586,193 字节） |
| 用途 | **AGC 上传 / 应用市场 / 内测**；HAP 用于 `hdc install` |

debug 构建输出：

```text
build-harmony/MeowloCorridor-1.0.0-debug-signed.app
```

签名沿用 `build-profile.json5` 的 `default_release` 配置；如果没配置签名，则输出 `MeowloCorridor-1.0.0-unsigned.app`。


## 2. 工具链

本次验证使用的命令：

```powershell
$clt = 'C:\command-line-tools'
$env:DEVECO_CLI_CLT_PATH = $clt
$env:DEVECO_NODE_HOME = "$clt\tool\node"
$env:PATH = "$clt\bin;$env:DEVECO_NODE_HOME;$env:PATH"

hvigorw --version
# 6.26.4
ohpm --version
# 26.0.0.630
```

> **本机路径提醒**：这台机器上 CLT 实际解压在 `D:\Projects\MusicCat\temp\ohos-clt\extract\command-line-tools`，`C:\command-line-tools` 并不存在。`scripts/build-harmony.ps1` 的默认 `-CltPath` 是 `C:\command-line-tools`，直接跑会报 "Command Line Tools not found"，需显式传 `-CltPath 'D:\Projects\MusicCat\temp\ohos-clt\extract\command-line-tools'`。

工具链版本：

- Command Line Tools：`26.0.0.821`
- HarmonyOS SDK：`26.0.0.105`（API 26）
- hvigor：`6.26.4`
- ohpm：`26.0.0.630`
- Cocos Creator：`3.8.8`
- 模板 `compatibleSdkVersion`：`5.0.3(15)`

也可使用 DevEco Studio 6.x 自带的 hvigor/SDK；关键是 `DEVECO_CLI_CLT_PATH` 指向包含 `version.txt`、`sdk`、`bin` 的目录。

## 3. Cocos 构建

```powershell
$env:ELECTRON_RUN_AS_NODE = $null
& 'D:\Tools\CocosCreator\Creator\CocosCreator-v3.8.8-win-121518\CocosCreator.exe' `
  --project 'D:\Projects\MusicCat' `
  --build 'platform=harmonyos-next;debug=true;startScene=2f49f9e3-9684-4fe5-b3ad-af39aedccc7c;buildPath=project://build-harmony'
```

Cocos 会：

- 生成 `build-harmony/harmonyos-next/data`
- 生成 `native/engine/harmonyos-next`（HarmonyOS 原生工程）

> Cocos 命令可能因为引擎 `engine/native -> engine-native` 符号链接警告返回非 0；只要 `native/engine/harmonyos-next/build-profile.json5` 和 `build-harmony/harmonyos-next/data` 存在，构建就是成功的。

## 4. HAP + APP 构建

本次实际执行：

```powershell
cd native/engine/harmonyos-next
hvigorw assembleHap --mode module -p product=default -p module=entry@default -p buildMode=debug --no-daemon
```

输出：

```text
entry/build/default/outputs/default/entry-default-unsigned.hap
```

构建耗时：

- 首次 native 编译：约 4 分 13 秒
- 增量打包：约 14–25 秒

### 4.1 Windows 上的 ohpm 符号链接问题

Cocos 模板在 Windows 上直接跑 `devecocli build` / `ohpm install` 会失败：

```text
00625004 SymLink Dir Failed
EBUSY: resource busy or locked ... oh_modules\@ohos\hypium
```

原因是模板的测试依赖 `@ohos/hypium`、`@ohos/hamock` 和本地 `libcocos.so` 依赖会创建目录符号链接，当前 Windows 环境不允许/被占用。

采用的绕过方式（`scripts/build-harmony.ps1` 已自动执行）：

1. 清空根 `oh-package.json5` 的 `devDependencies`（测试依赖不参与游戏构建）。
2. 清空 `entry/oh-package.json5` 的 `dependencies`，不让 ohpm 创建 `libcocos.so` 符号链接。
3. 手动把 `entry/src/main/cpp/types/libcocos` 复制到 `entry/oh_modules/libcocos.so`。
4. 直接调用 `hvigorw assembleHap`，跳过 `devecocli` 的自动 `ohpm install`。

这是 Windows 构建环境的 workaround，不改变游戏代码；macOS/Linux 或正常的 DevEco 环境通常不需要。

## 5. 签名（下一步）

当前 HAP 未签名。两种方式：

### 5.1 DevEco Studio 自动签名（推荐）

1. 先跑完 Cocos 构建（`build-harmony.ps1` 的步骤 1），再打开 `native/engine/harmonyos-next`。
2. 登录华为开发者账号（需要已完成开发者实名/团队）。
3. 连接比赛手机，开启开发者模式 + USB 调试，并在手机上允许调试。
4. `File > Project Structure > Signing Configs`，选择 `default` 产品，勾选 `Automatically generate signature`。
5. DevEco 会生成 `.p12/.cer/.p7b`，并把 `signingConfigs` 写入 `build-profile.json5`。
6. `Build > Build Hap(s)/APP(s) > Build Hap(s)`。

> **重要**：Cocos 重新构建会重新生成 `native/engine/harmonyos-next`，可能覆盖 DevEco 写入的签名配置。签名后如果要再改游戏，重新跑 Cocos 后要重新做自动签名；日常签名调试建议用 `-SkipCocos` 只重打 HAP。

### 5.2 命令行签名

```powershell
npm i -g @deveco/deveco-cli
devecocli auth login
hdc list targets   # 必须能看到比赛手机

# 当前工程已经把 Cocos 构建 + patch + hvigor 串好：
cd D:\Projects\MusicCat
.\scripts\build-harmony.ps1 -Sign -SkipCocos `
  -CltPath 'D:\Projects\MusicCat\temp\ohos-clt\extract\command-line-tools'
```

`-Sign` 会先执行：

```powershell
devecocli signature generate --product default --type debug
```

然后调用 `hvigorw assembleHap`。如果 `devecocli` 不在 PATH，可以显式指定：

```powershell
.\scripts\build-harmony.ps1 -Sign -SkipCocos `
  -DevecoCli 'D:\Projects\MusicCat\temp\deveco-cli\node_modules\@deveco\deveco-cli\cli.js' `
  -CltPath 'D:\Projects\MusicCat\temp\ohos-clt\extract\command-line-tools'
```

也可以手动执行：

```powershell
cd native/engine/harmonyos-next
devecocli signature generate --product default --type debug
hvigorw assembleHap --mode module -p product=default -p module=entry@default -p buildMode=debug --no-daemon
```

签名后通常在：

```text
entry/build/default/outputs/default/entry-default-signed.hap
```

安装：

```powershell
hdc install entry/build/default/outputs/default/entry-default-signed.hap
```

> 调试签名绑定设备 UDID；换手机需要重新签名。发布/评委自行安装需要 AGC 发布证书 + Profile。

### 5.3 通用 Release 包（其他人体验/打分）

**真正的“通用包”是 release profile 签名的 HAP，不绑定单台手机 UDID。**

但 release Profile 必须由 AGC 审核/签发，`devecocli signature generate --type release` 只能生成前半部分：

- `.p12` 私钥
- `.csr` 证书请求
- `.cer` 本地证书
- `build-profile.json5` 里的 `default_release` 配置

它**不能自动生成 `.p7b`**。当前环境已经生成到：

```text
C:\Users\m1523\.ohos\config\*_release=.csr
C:\Users\m1523\.ohos\config\*_release=.cer
C:\Users\m1523\.ohos\config\*_release=.p12
```

下一步在 AGC 完成：

1. 打开 AppGallery Connect → 我的应用。
2. 确认已创建应用，包名必须是：

```text
com.meowlo.corridor
```

3. 进入“证书、APP ID 和 Profile” → 证书 → 发布证书。
4. 上传刚生成的 `.csr`，申请发布证书，下载 `.cer`。
5. 进入 Profile → 发布 Profile，选择该应用和发布证书，下载 `.p7b`。
6. 把 `build-profile.json5` 的 `default_release.material` 改成：

```json5
certpath: "下载的发布证书.cer",
profile: "下载的发布Profile.p7b",
```

`storeFile` 仍指向生成的 `.p12`，密码不要改。

7. 打 release 包：

```powershell
cd D:\Projects\MusicCat

.\scripts\build-harmony.ps1 -SkipCocos -Release `
  -CltPath 'D:\Projects\MusicCat\temp\ohos-clt\extract\command-line-tools'
```

输出：

```text
build-harmony/MeowloCorridor-1.0.0-release-signed.hap
```

这个 HAP **不含单台设备 UDID 限制**，可以给多台兼容设备使用；但 release 包的实际安装方式取决于 Profile 的分发类型（AppGallery / 企业分发等），不一定能直接 `hdc install`。

> 如果只是几位评委用自己的手机现场体验，**更稳的折中方案**是：收集这些手机的 UDID，加入一个 debug Profile，重新签一次名；一个 debug HAP 可以同时装进 Profile 里的多台设备。缺点是每换一台新手机都要重签。

## 6. 应用配置（已写入）

| 项 | 值 |
|---|---|
| bundleName | `com.meowlo.corridor` |
| 应用名 | `喵音回廊` |
| 版本 | `1.0.0`（versionCode 1000000） |
| 方向 | `portrait` |
| 设备 | `phone` |
| 权限 | 仅 `ohos.permission.VIBRATE` |
| 图标 | 猫头 + 声波环，`tools/harmony_icon.png` |
| 新增资源 | 菜单背景、CD/主人插画、5 个 SFX、CD 拼合终局已打入 HAP（v2.6） |

## 7. 已知警告（不阻塞）

- ArkTS `globalThis` 不支持：Cocos 原生模板自身用法，API 26 仅警告，编译通过。
- `px2vp` / `getContext` 已弃用：Cocos 模板 API 兼容层警告。
- `targetSdkVersion` 未显式设置：hvigor 建议补，当前不阻塞。
- Release 包已签名；unsigned 包仅保留作对比。

## 8. 复现脚本

```powershell
# 完整：Cocos 构建 + patch + hvigor 打包
.\scripts\build-harmony.ps1 -CltPath 'C:\command-line-tools'

# 已有 Cocos 原生工程，只重新打包
.\scripts\build-harmony.ps1 -SkipCocos -CltPath 'C:\command-line-tools'

# 登录华为账号、连接设备后，生成调试签名并打 signed HAP
.\scripts\build-harmony.ps1 -Sign -SkipCocos -CltPath 'C:\command-line-tools'
```

`-Sign` 需要 `devecocli` 已安装并执行过 `devecocli auth login`；脚本会输出 `build-harmony/MeowloCorridor-1.0.0-signed.hap`。

脚本只修改生成目录 `native/engine/harmonyos-next`，不会改 `assets/` 业务代码；`native/` 与 `build-harmony/` 都在 `.gitignore` 中。

## 9. 官方模拟器实测（2026-10-18）

本机用 CLT 自带模拟器验证过：

```powershell
$clt = 'D:\Projects\MusicCat\temp\ohos-clt\extract\command-line-tools'

# 已下载并创建
Emulator.bat -install -deviceType phone -osVersion 'HarmonyOS 6.0.1(21)'
Emulator.bat -create MeowloTest -deviceType phone -osVersion 'HarmonyOS 6.0.1(21)'
Emulator.bat -start MeowloTest -noWindow

hdc list targets
# 127.0.0.1:5555
```

安装 arm64 release HAP：

```text
hdc install MeowloCorridor-1.0.0-release-signed.hap
→ 9568347 install parse native so failed
→ Abi type supported by the device does not match the C++ project
```

原因：

- 官方 Windows 模拟器镜像是 **x86_64**
- 当前 HAP 的 native 库是 **arm64-v8a**
- Cocos 3.8.8 的 OpenHarmony 预编译库只带 `arm64-v8a / armeabi-v7a`
- 尝试切 x86_64 构建时，缺少 `libmbedtls.a` 等 x86_64 预编译库，无法直接编译

结论：**官方模拟器不能直接跑这个 Cocos 原生 HAP**，除非移植/重编 Cocos 的 OHOS 依赖。当前没有鸿蒙手机时，优先用：

1. **AGC 云测试/云真机**（真实 arm64 设备）
2. 借一台比赛用 HarmonyOS 手机
3. 浏览器 Web 版做玩法预览（不能验证 HAP/原生音频）

## 10. 应用名乱码修复

现象：桌面/安装界面显示 `鍠甸煶鍥炲粖`，而不是 `喵音回廊`。

根因：

- `scripts/build-harmony.ps1` 原先保存为 **UTF-8 无 BOM**
- 本机实际执行的是 **Windows PowerShell 5.1**
- PowerShell 5.1 把无 BOM 脚本按 ANSI/GBK 读取，中文字面量 `喵音回廊` 被错误解码
- 脚本再把错误字符串写进 `AppScope/.../string.json`，HAP 资源索引里就是乱码

修复：

1. 脚本改为 **UTF-8 with BOM**，PowerShell 5.1 能正确读取中文。
2. 所有生成的 JSON 用 `.NET UTF8Encoding(false)` 写入，避免 BOM/编码二次转换。
3. 兼容替换旧的 `鍠甸煶鍥炲粖`，`-SkipCocos` 也能修复。
4. 重新打 release HAP，并检查 HAP 内 `resources.index` 包含 UTF-8 的 `喵音回廊`。

当前产物已修复，桌面名应为 **喵音回廊**。





