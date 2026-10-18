# 喵音回廊 · HarmonyOS HAP 构建记录

> 记录日期：2026-10-18　|　Cocos Creator 3.8.8　|　HarmonyOS Command Line Tools 26.0.0.821（API 26）

## 1. 当前结果

| 项目 | 结果 |
|---|---|
| Cocos `harmonyos-next` 工程 | 成功生成 `native/engine/harmonyos-next` |
| Native 编译（CMake + OHOS NDK） | 成功，产出 `libcocos.so` |
| ArkTS 编译 | 成功（API 26 仅有 `globalThis`/弃用 API 警告） |
| HAP 打包 | 成功 |
| HAP 签名 | **未完成**：当前环境没有登录华为开发者账号，无法生成 AGC 调试/发布签名 |
| 当前产物 | `build-harmony/MeowloCorridor-1.0.0-unsigned.hap`（45,324,360 字节，约 43.2 MB，unsigned） |
| SHA-256 | `7AA1E2E6739A9E9D6B99B2D128E0056D23D17C6B62B63BDA09214E86B031650B` |
| 真机安装 | 未执行（需签名 + HarmonyOS 设备/模拟器） |

> 这是一个**已成功构建的 unsigned HAP**，不是“可安装比赛包”。签名步骤见 §5；签名后才能 `hdc install`。

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

## 4. HAP 构建

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
- 未签名：HAP 可打包但不可正常安装。

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


