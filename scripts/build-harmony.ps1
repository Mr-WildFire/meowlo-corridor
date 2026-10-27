[CmdletBinding()]
param(
    [string]$Project = (Split-Path -Parent $PSScriptRoot),
    [string]$CocosCreator = 'D:\Tools\CocosCreator\Creator\CocosCreator-v3.8.8-win-121518\CocosCreator.exe',
    [string]$CltPath = $env:DEVECO_CLI_CLT_PATH,
    [string]$DevecoCli = '',
    [switch]$SkipCocos,
    [switch]$Sign,
    [switch]$Release
)

$ErrorActionPreference = 'Stop'

function Write-Utf8NoBom([string]$Path, [string]$Text) {
    [System.IO.File]::WriteAllText($Path, $Text, (New-Object System.Text.UTF8Encoding($false)))
}

$native = Join-Path $Project 'native\engine\harmonyos-next'
$hapUnsigned = Join-Path $native 'entry\build\default\outputs\default\entry-default-unsigned.hap'
$hapSigned = Join-Path $native 'entry\build\default\outputs\default\entry-default-signed.hap'
$outDir = Join-Path $Project 'build-harmony'
$outUnsigned = Join-Path $outDir 'MeowloCorridor-2.8.0-unsigned.hap'
$outSigned = Join-Path $outDir $(if ($Release) { 'MeowloCorridor-2.8.0-release-signed.hap' } else { 'MeowloCorridor-2.8.0-signed.hap' })
$appDir = Join-Path $native 'build\outputs\default'
$appUnsigned = Join-Path $appDir 'harmonyos-next-default-unsigned.app'
$appSigned = Join-Path $appDir 'harmonyos-next-default-signed.app'
$outAppUnsigned = Join-Path $outDir 'MeowloCorridor-2.8.0-unsigned.app'
$outAppSigned = Join-Path $outDir $(if ($Release) { 'MeowloCorridor-2.8.0-release-signed.app' } else { 'MeowloCorridor-2.8.0-debug-signed.app' })
$buildMode = if ($Release) { 'release' } else { 'debug' }
$appVersion = '2.8.0'
$appVersionCode = 2800000
$signingBackup = Join-Path $Project 'temp\harmony-signing-backup.json5'

if (-not $CltPath) { $CltPath = 'C:\command-line-tools' }
$hvigor = Join-Path $CltPath 'bin\hvigorw.bat'
if (-not (Test-Path $hvigor)) {
    throw "HarmonyOS Command Line Tools not found at '$CltPath'. Set DEVECO_CLI_CLT_PATH or pass -CltPath."
}

$runCocos = -not $SkipCocos
if ($SkipCocos) {
    $assetRoot = Join-Path $Project 'assets'
    $buildData = Join-Path $Project 'build-harmony\harmonyos-next\data'
    if (-not (Test-Path $buildData)) {
        Write-Warning "-SkipCocos was requested, but no Cocos build output exists. Running Cocos build."
        $runCocos = $true
    } elseif (Test-Path $assetRoot) {
        $assetStamp = (Get-ChildItem $assetRoot -Recurse -File | Measure-Object -Property LastWriteTime -Maximum).Maximum
        $buildStamp = (Get-ChildItem $buildData -Recurse -File | Measure-Object -Property LastWriteTime -Maximum).Maximum
        if ($assetStamp -gt $buildStamp) {
            Write-Warning "-SkipCocos was requested, but assets/ is newer than the Cocos build. Running Cocos build to avoid packaging stale art."
            $runCocos = $true
        }
    }
}

if (Test-Path (Join-Path $native 'build-profile.json5')) {
    Copy-Item (Join-Path $native 'build-profile.json5') $signingBackup -Force
}

if ($runCocos) {
    if (-not (Test-Path $CocosCreator)) { throw "CocosCreator not found: $CocosCreator" }
    Write-Host '[1/5] Cocos harmonyos-next build...'
    $env:ELECTRON_RUN_AS_NODE = $null
    $buildArg = 'platform=harmonyos-next;debug=true;startScene=2f49f9e3-9684-4fe5-b3ad-af39aedccc7c;buildPath=project://build-harmony'
    # Cocos tries to replace build-harmony/harmonyos-next/assets with a symlink;
    # Windows fails if the old output is still present.
    Remove-Item (Join-Path $Project 'build-harmony\harmonyos-next') -Recurse -Force -ErrorAction SilentlyContinue
    $oldEap = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    & $CocosCreator --project $Project --build $buildArg 2>&1 | Out-Host
    $ErrorActionPreference = $oldEap
    $dataDir = Join-Path $Project 'build-harmony\harmonyos-next\data'
    if (-not (Test-Path $dataDir) -or -not (Test-Path (Join-Path $native 'build-profile.json5'))) {
        throw "Cocos harmonyos-next project was not generated. Close the Cocos editor (it may lock temp\logs\project.log) and retry."
    }
}

Write-Host '[2/5] Patch generated HarmonyOS project...'
if (Test-Path $signingBackup) {
    Copy-Item $signingBackup (Join-Path $native 'build-profile.json5') -Force
}
$appFile = Join-Path $native 'AppScope\app.json5'
$app = Get-Content -LiteralPath $appFile -Raw -Encoding UTF8
$app = $app.Replace('com.cocos.test', 'com.meowlo.corridor').Replace('"vendor": "example"', '"vendor": "Meowlo"')
$app = [regex]::Replace($app, '("versionName"\s*:\s*")[^"]*(")', ('${1}' + $appVersion + '${2}'))
$app = [regex]::Replace($app, '("versionCode"\s*:\s*)\d+', ('${1}' + $appVersionCode))
Write-Utf8NoBom $appFile $app

$appString = Join-Path $native 'AppScope\resources\base\element\string.json'
$entryString = Join-Path $native 'entry\src\main\resources\base\element\string.json'
# Build from Unicode code points so Windows PowerShell 5.1 cannot turn the
# label into question marks while reading this UTF-8-BOM script.
$appName = [string]([char]0x55B5) + [char]0x97F3 + [char]0x56DE + [char]0x5ECA
foreach ($f in @($appString, $entryString)) {
    if (-not (Test-Path $f)) { continue }
    $text = Get-Content -LiteralPath $f -Raw -Encoding UTF8
    # Replace by key, not by the previous value: Cocos may introduce a new
    # mojibake string after each full build. Cover both the app label and the
    # ability label used by the launcher.
    $text = [regex]::Replace(
        $text,
        '("name"\s*:\s*"(?:app_name|MainAbility_label)"\s*,\s*"value"\s*:\s*")[^"]*(")',
        ('${1}' + $appName + '${2}')
    )
    Write-Utf8NoBom $f $text
}

# Cocos CLI defaults to 1280x720 landscape when project.json has no screen
# settings. Force portrait design resolution in the generated runtime settings
# so the first frame is portrait even before DemoGame.onLoad runs.
$settingsFiles = @(
    (Join-Path $Project 'build-harmony\harmonyos-next\data\src\settings.json'),
    (Join-Path $native 'entry\src\main\resources\rawfile\Resources\src\settings.json')
)
foreach ($f in $settingsFiles) {
    if (-not (Test-Path $f)) { continue }
    $s = Get-Content -LiteralPath $f -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($s.screen -and $s.screen.designResolution) {
        $s.screen.designResolution.width = 1920
        $s.screen.designResolution.height = 1080
        $s.screen.designResolution.policy = 2
        Write-Utf8NoBom $f ($s | ConvertTo-Json -Depth 100)
    }
}

# Cocos/DevEco can inject a debug signing block whose short password fails
# hvigor's >=32-character validation. Release builds must use the AGC release
# material, so drop only that block and point the product at default_release.
if ($Release) {
    $profileFile = Join-Path $native 'build-profile.json5'
    if (Test-Path $profileFile) {
        $profile = Get-Content -LiteralPath $profileFile -Raw -Encoding UTF8
        $profile = [regex]::Replace($profile, '(?s)\s*// @debug-signing-start.*?// @debug-signing-end', '')
        $profile = $profile.Replace("signingConfig: 'default_debug'", "signingConfig: 'default_release'")
        Write-Utf8NoBom $profileFile $profile
    }
}

$moduleFile = Join-Path $native 'entry\src\main\module.json5'
$module = Get-Content -LiteralPath $moduleFile -Raw -Encoding UTF8
$module = [regex]::Replace($module, '("orientation"\s*:\s*")[^"]+(")', '${1}landscape${2}')
$deviceOld = @'
    "deviceTypes": [
      "default"
    ],
'@
$deviceNew = @'
    "deviceTypes": [
      "phone"
    ],
'@
$module = $module.Replace($deviceOld, $deviceNew)
$permNew = @'
    "requestPermissions": [
      {
        "name": "ohos.permission.VIBRATE"
      }
    ],
'@
$module = [regex]::Replace($module, '(?s)"requestPermissions":\s*\[.*?\],', $permNew)
Write-Utf8NoBom $moduleFile $module

# Cocos' Windows HarmonyOS template uses registry test deps + a local symlink
# dependency. Both trigger EBUSY with ohpm on this Windows setup.
$rootPkgFile = Join-Path $native 'oh-package.json5'
$rootPkg = Get-Content -LiteralPath $rootPkgFile -Raw -Encoding UTF8
$rootPkg = [regex]::Replace($rootPkg, 'devDependencies:\s*\{[\s\S]*?\},', 'devDependencies: {},')
Write-Utf8NoBom $rootPkgFile $rootPkg

$entryPkgFile = Join-Path $native 'entry\oh-package.json5'
$entryPkg = Get-Content -LiteralPath $entryPkgFile -Raw -Encoding UTF8
$entryPkg = [regex]::Replace($entryPkg, '"dependencies":\s*\{[\s\S]*?\}', '"dependencies": {}')
Write-Utf8NoBom $entryPkgFile $entryPkg

$libSrc = Join-Path $native 'entry\src\main\cpp\types\libcocos'
$libDst = Join-Path $native 'entry\oh_modules\libcocos.so'
New-Item -ItemType Directory -Force -Path $libDst | Out-Null
Copy-Item (Join-Path $libSrc '*') $libDst -Recurse -Force

$icon = Join-Path $Project 'tools\icon\icon-512.png'
if (-not (Test-Path $icon)) { $icon = Join-Path $Project 'tools\harmony_icon.png' }
if (Test-Path $icon) {
    Copy-Item $icon (Join-Path $native 'AppScope\resources\base\media\app_icon.png') -Force
    Copy-Item $icon (Join-Path $native 'entry\src\main\resources\base\media\icon.png') -Force
}

Write-Host '[3/5] hvigor assembleHap...'
$env:DEVECO_CLI_CLT_PATH = $CltPath
$env:DEVECO_NODE_HOME = Join-Path $CltPath 'tool\node'
$env:PATH = "$(Join-Path $CltPath 'bin');$env:DEVECO_NODE_HOME;$env:PATH"

if ($Sign) {
    if (-not $DevecoCli) {
        $cmd = Get-Command devecocli -ErrorAction SilentlyContinue
        if ($cmd) { $DevecoCli = $cmd.Source }
    }
    if (-not $DevecoCli -or -not (Test-Path $DevecoCli)) {
        throw 'Sign requested, but devecocli was not found. Install it with: npm i -g @deveco/deveco-cli, or pass -DevecoCli <cli.js>.'
    }
    Write-Host 'Generating signing materials with Huawei account...'
    $oldEap = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    $signType = if ($Release) { 'release' } else { 'debug' }
    if ($DevecoCli -like '*.js') {
        & (Join-Path $CltPath 'tool\node\node.exe') $DevecoCli signature generate --product default --type $signType 2>&1 | Out-Host
    } else {
        & $DevecoCli signature generate --product default --type $signType 2>&1 | Out-Host
    }
    $signExit = $LASTEXITCODE
    $ErrorActionPreference = $oldEap
    if ($signExit -ne 0) {
        throw 'devecocli signature generate failed. Run: devecocli auth login, connect a device, then retry.'
    }
}

Remove-Item $hapUnsigned,$hapSigned -Force -ErrorAction SilentlyContinue
Push-Location $native
try {
    $oldEap = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    & $hvigor assembleHap --mode module -p product=default -p module=entry@default -p "buildMode=$buildMode" --no-daemon 2>&1 | Out-Host
    $ErrorActionPreference = $oldEap
} finally {
    Pop-Location
}

$signed = Test-Path $hapSigned
$source = if ($signed) { $hapSigned } else { $hapUnsigned }
if (-not (Test-Path $source)) { throw "HAP was not produced: $source" }

Write-Host '[4/5] Copy HAP...'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$dest = if ($signed) { $outSigned } else { $outUnsigned }
Copy-Item $source $dest -Force
$size = [math]::Round((Get-Item $dest).Length / 1MB, 1)
Write-Host "OK: $dest ($size MB, $(if ($signed) { 'signed' } else { 'unsigned' }))"
if (-not $signed) {
    Write-Host 'Unsigned artifact. Use DevEco automatic signing, or run devecocli auth login then this script with -Sign.'
}

# Always produce the matching App Pack (.app) for AGC upload/testing.
Write-Host '[5/5] hvigor assembleApp...'
Remove-Item $appUnsigned,$appSigned -Force -ErrorAction SilentlyContinue
Push-Location $native
try {
    $oldEap = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    & $hvigor assembleApp --mode project -p product=default -p "buildMode=$buildMode" --no-daemon 2>&1 | Out-Host
    $ErrorActionPreference = $oldEap
} finally {
    Pop-Location
}

$appIsSigned = Test-Path $appSigned
$appSource = if ($appIsSigned) { $appSigned } else { $appUnsigned }
if (-not (Test-Path $appSource)) { throw "APP was not produced: $appSource" }
$appDest = if ($appIsSigned) { $outAppSigned } else { $outAppUnsigned }
Copy-Item $appSource $appDest -Force
$appSize = [math]::Round((Get-Item $appDest).Length / 1MB, 1)
Write-Host "OK: $appDest ($appSize MB, $(if ($appIsSigned) { 'signed' } else { 'unsigned' }))"











