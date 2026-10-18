[CmdletBinding()]
param(
    [string]$Project = (Split-Path -Parent $PSScriptRoot),
    [string]$CocosCreator = 'D:\Tools\CocosCreator\Creator\CocosCreator-v3.8.8-win-121518\CocosCreator.exe',
    [string]$CltPath = $env:DEVECO_CLI_CLT_PATH,
    [switch]$SkipCocos
)

$ErrorActionPreference = 'Stop'
$native = Join-Path $Project 'native\engine\harmonyos-next'
$hap = Join-Path $native 'entry\build\default\outputs\default\entry-default-unsigned.hap'
$outDir = Join-Path $Project 'build-harmony'
$outHap = Join-Path $outDir 'MeowloCorridor-1.0.0-unsigned.hap'

if (-not $CltPath) { $CltPath = 'C:\command-line-tools' }
$hvigor = Join-Path $CltPath 'bin\hvigorw.bat'
if (-not (Test-Path $hvigor)) {
    throw "HarmonyOS Command Line Tools not found at '$CltPath'. Set DEVECO_CLI_CLT_PATH or pass -CltPath."
}

if (-not $SkipCocos) {
    if (-not (Test-Path $CocosCreator)) { throw "CocosCreator not found: $CocosCreator" }
    Write-Host '[1/4] Cocos harmonyos-next build...'
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

Write-Host '[2/4] Patch generated HarmonyOS project...'
$appFile = Join-Path $native 'AppScope\app.json5'
$app = Get-Content -LiteralPath $appFile -Raw -Encoding UTF8
$app = $app.Replace('com.cocos.test', 'com.meowlo.corridor').Replace('"vendor": "example"', '"vendor": "Meowlo"')
Set-Content -LiteralPath $appFile -Value $app -Encoding UTF8

$appString = Join-Path $native 'AppScope\resources\base\element\string.json'
$entryString = Join-Path $native 'entry\src\main\resources\base\element\string.json'
foreach ($f in @($appString, $entryString)) {
    if (Test-Path $f) {
        $text = Get-Content -LiteralPath $f -Raw -Encoding UTF8
        $text = $text.Replace('"value": "MusicCat"', '"value": "喵音回廊"')
        Set-Content -LiteralPath $f -Value $text -Encoding UTF8
    }
}

$moduleFile = Join-Path $native 'entry\src\main\module.json5'
$module = Get-Content -LiteralPath $moduleFile -Raw -Encoding UTF8
$module = $module.Replace('auto_rotation_landscape', 'portrait')
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
Set-Content -LiteralPath $moduleFile -Value $module -Encoding UTF8

# Cocos' Windows HarmonyOS template uses registry test deps + a local symlink
# dependency. Both trigger EBUSY with ohpm on this Windows setup.
$rootPkgFile = Join-Path $native 'oh-package.json5'
$rootPkg = Get-Content -LiteralPath $rootPkgFile -Raw -Encoding UTF8
$rootPkg = [regex]::Replace($rootPkg, 'devDependencies:\s*\{[\s\S]*?\},', 'devDependencies: {},')
Set-Content -LiteralPath $rootPkgFile -Value $rootPkg -Encoding UTF8

$entryPkgFile = Join-Path $native 'entry\oh-package.json5'
$entryPkg = Get-Content -LiteralPath $entryPkgFile -Raw -Encoding UTF8
$entryPkg = [regex]::Replace($entryPkg, '"dependencies":\s*\{[\s\S]*?\}', '"dependencies": {}')
Set-Content -LiteralPath $entryPkgFile -Value $entryPkg -Encoding UTF8

$libSrc = Join-Path $native 'entry\src\main\cpp\types\libcocos'
$libDst = Join-Path $native 'entry\oh_modules\libcocos.so'
New-Item -ItemType Directory -Force -Path $libDst | Out-Null
Copy-Item (Join-Path $libSrc '*') $libDst -Recurse -Force

$icon = Join-Path $Project 'tools\harmony_icon.png'
if (Test-Path $icon) {
    Copy-Item $icon (Join-Path $native 'AppScope\resources\base\media\app_icon.png') -Force
    Copy-Item $icon (Join-Path $native 'entry\src\main\resources\base\media\icon.png') -Force
}

Write-Host '[3/4] hvigor assembleHap...'
$env:DEVECO_CLI_CLT_PATH = $CltPath
$env:DEVECO_NODE_HOME = Join-Path $CltPath 'tool\node'
$env:PATH = "$(Join-Path $CltPath 'bin');$env:DEVECO_NODE_HOME;$env:PATH"
Remove-Item $hap -Force -ErrorAction SilentlyContinue
Push-Location $native
try {
    $oldEap = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    & $hvigor assembleHap --mode module -p product=default -p module=entry@default -p buildMode=debug --no-daemon 2>&1 | Out-Host
    $ErrorActionPreference = $oldEap
} finally {
    Pop-Location
}

if (-not (Test-Path $hap)) { throw "HAP was not produced: $hap" }

Write-Host '[4/4] Copy unsigned HAP...'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
Copy-Item $hap $outHap -Force
$size = [math]::Round((Get-Item $outHap).Length / 1MB, 1)
Write-Host "OK: $outHap ($size MB)"
Write-Host 'Unsigned artifact. Use DevEco automatic signing or devecocli auth login + signature generate, then rebuild the signed package.'



