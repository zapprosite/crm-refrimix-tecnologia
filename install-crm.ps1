# install-crm.ps1
# Instalação automática do CRM Refrimix no Windows 11
# Instala em C:\crm-refrimix e cria atalho no Desktop

$ErrorActionPreference = "Stop"
$TargetDir = "C:\crm-refrimix"

Write-Host "== CRM Refrimix - Instalação automática (Windows 11) ==" -ForegroundColor Cyan
Write-Host "Alvo de instalação: $TargetDir" -ForegroundColor Cyan

# 1) Garantir que está como administrador
$currUser = New-Object Security.Principal.WindowsPrincipal(
    [Security.Principal.WindowsIdentity]::GetCurrent()
)

if (-not $currUser.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Reabrindo o script como Administrador..." -ForegroundColor Yellow
    Start-Process powershell `
        "-ExecutionPolicy Bypass -File `"$PSCommandPath`"" `
        -Verb RunAs
    exit
}

# 2) Definir diretório de origem (onde o script está)
$SourcePath = Split-Path -Parent $PSCommandPath
Write-Host "Pasta de origem (Source): $SourcePath" -ForegroundColor Cyan

# 3) Copiar arquivos para C:\crm-refrimix
Write-Host "Copiando arquivos para $TargetDir..." -ForegroundColor Cyan
if (Test-Path $TargetDir) {
    Write-Host "O diretório $TargetDir já existe. Atualizando arquivos..." -ForegroundColor Yellow
} else {
    New-Item -Path $TargetDir -ItemType Directory -Force | Out-Null
}

# Copia tudo, exceto node_modules e .git para evitar lentidão/erros
# Robocopy é mais eficiente para isso, mas Copy-Item é mais nativo do PS.
# Vamos usar Copy-Item com exclusões básicas
$exclude = @('node_modules', '.git', '.env', 'install-crm.ps1', 'install-crm.sh')
Get-ChildItem -Path $SourcePath -Exclude $exclude | Copy-Item -Destination $TargetDir -Recurse -Force

Set-Location $TargetDir

# 3.1) Restaurar .env se não existir, ou criar exemplo
if (-not (Test-Path ".env")) {
    if (Test-Path "$SourcePath\.env") {
        Copy-Item "$SourcePath\.env" "$TargetDir\.env"
    } elseif (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Arquivo .env criado a partir do exemplo. Configure-o se necessário." -ForegroundColor Yellow
    }
}

# 4) Ajustar ExecutionPolicy
Write-Host "Ajustando permissões do PowerShell..." -ForegroundColor Cyan
try {
    Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force -ErrorAction Stop
} catch {
    Write-Host "Aviso: Não foi possível alterar ExecutionPolicy. Continuando..." -ForegroundColor Yellow
}

# 5) Verificar Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js não encontrado. Tentando instalar via winget..." -ForegroundColor Yellow
    winget install --id OpenJS.NodeJS.LTS -e --source winget
    # Atualiza env vars
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
} else {
    Write-Host "Node.js já está instalado." -ForegroundColor Green
}

# 6) Instalar dependências no destino
Write-Host "Instalando dependências npm em $TargetDir..." -ForegroundColor Cyan
npm install --legacy-peer-deps

# 7) Gerar script de inicialização (start-crm.ps1) dentro de C:\crm-refrimix
$startScriptContent = @"
# start-crm.ps1
`$ErrorActionPreference = "Stop"
Set-Location "$TargetDir"

Write-Host "Iniciando CRM Refrimix..." -ForegroundColor Cyan
Start-Process "cmd.exe" "/k cd /d "$TargetDir" && npm run dev"
Start-Process "http://localhost:5173"
"@

$StartScriptPath = Join-Path $TargetDir "start-crm.ps1"
$startScriptContent | Set-Content -Path $StartScriptPath -Encoding UTF8

# 8) Criar atalho na Área de Trabalho
Write-Host "Criando atalho na Área de Trabalho..." -ForegroundColor Cyan
$DesktopPath = [Environment]::GetFolderPath('Desktop')
$ShortcutPath = Join-Path $DesktopPath "CRM Refrimix.lnk"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$StartScriptPath`""
$Shortcut.WorkingDirectory = $TargetDir
$Shortcut.Description = "Iniciar CRM Refrimix"

# Ícone
$IconPath = Join-Path $TargetDir "icone\00-logo.ico"
if (Test-Path $IconPath) {
    $Shortcut.IconLocation = $IconPath
}

$Shortcut.Save()

Write-Host ""
Write-Host "Instalação concluída com sucesso em $TargetDir!" -ForegroundColor Green
Write-Host "Atalho criado na Área de Trabalho." -ForegroundColor Green
pause
