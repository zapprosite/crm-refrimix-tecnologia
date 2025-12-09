# install-crm.ps1
# Instalação automática do CRM Refrimix no Windows

$ErrorActionPreference = "Stop"

Write-Host "== CRM Refrimix - Instalação automática ==" -ForegroundColor Cyan

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

# 2) Caminho do projeto (pasta onde está este script)
$ProjectPath = Split-Path -Parent $PSCommandPath
Write-Host "Pasta do projeto: $ProjectPath" -ForegroundColor Cyan

Set-Location $ProjectPath

# 3) Ajustar ExecutionPolicy (se permitido)
Write-Host "Ajustando permissões do PowerShell para este usuário (se permitido)..." -ForegroundColor Cyan
try {
    Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force -ErrorAction Stop
}
catch {
    Write-Host "Não foi possível alterar a ExecutionPolicy. Mensagem:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor DarkYellow
    Write-Host "Continuando mesmo assim, pois a política efetiva já permite rodar este script." -ForegroundColor Yellow
}

# 4) Verificar / instalar Node.js LTS via winget
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js não encontrado. Instalando Node.js LTS via winget..." -ForegroundColor Yellow
    winget install --id OpenJS.NodeJS.LTS -e --source winget
} else {
    Write-Host "Node.js já está instalado." -ForegroundColor Green
}

# 5) Instalar dependências do projeto
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependências npm..." -ForegroundColor Cyan
    npm install --legacy-peer-deps
} else {
    Write-Host "Dependências já instaladas (node_modules existe)." -ForegroundColor Green
}

# 6) Gerar script start-crm.ps1
Write-Host "Gerando script start-crm.ps1..." -ForegroundColor Cyan

$startScript = @'
# start-crm.ps1
$ErrorActionPreference = "Stop"

$ProjectPath = Split-Path -Parent $PSCommandPath
Set-Location $ProjectPath

Write-Host "Iniciando CRM Refrimix..." -ForegroundColor Cyan

# Abre um terminal separado rodando o servidor
Start-Process "cmd.exe" "/k cd /d `"$ProjectPath`" && npm run dev"

# Abre o navegador padrão
Start-Process "http://localhost:5173"
'@

$startScriptPath = Join-Path $ProjectPath "start-crm.ps1"
$startScript | Set-Content -Path $startScriptPath -Encoding UTF8

# 7) Criar atalho na área de trabalho
Write-Host "Criando atalho na área de trabalho..." -ForegroundColor Cyan

$DesktopPath  = [Environment]::GetFolderPath('Desktop')
$ShortcutPath = Join-Path $DesktopPath "CRM Refrimix.lnk"

$WshShell   = New-Object -ComObject WScript.Shell
$Shortcut   = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath       = "powershell.exe"
$Shortcut.Arguments        = "-ExecutionPolicy Bypass -File `"$startScriptPath`""
$Shortcut.WorkingDirectory = $ProjectPath

# Usa o ícone da pasta icone (ajuste o nome se for diferente)
$IconPath = Join-Path $ProjectPath "icone\00-logo.ico"
if (Test-Path $IconPath) {
    $Shortcut.IconLocation = $IconPath
}

$Shortcut.Save()

Write-Host ""
Write-Host "Instalação concluída com sucesso!" -ForegroundColor Green
Write-Host "Use o atalho 'CRM Refrimix' na área de trabalho para abrir o sistema." -ForegroundColor Green
