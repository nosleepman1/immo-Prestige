# dev.ps1 — lance tout l'environnement de développement ImmoPrestige en un
# seul script : WSL (Postgres + Redis), puis le backend (API + queue + logs +
# Reverb) et les 3 frontends (admin, agency, mobile), chacun dans sa propre
# fenêtre PowerShell.
#
# Prérequis côté WSL (distro "Ubuntu") : PostgreSQL et Redis installés, avec
# un rôle Postgres "postgres" / mot de passe "root" et une base "immo_prestige".
# Ce script ne les installe pas — il se contente de démarrer les services et
# de vérifier qu'ils répondent.
#
# Usage : depuis la racine du repo →  ./dev.ps1
# Pour tout arrêter : fermez les fenêtres ouvertes, ou Ctrl+C dans chacune.

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$wslDistro = "Ubuntu"

function Write-Step($msg) {
    Write-Host ""
    Write-Host "==> $msg" -ForegroundColor Cyan
}

function Start-DevWindow($title, $workDir, $command) {
    $psCommand = "Set-Location -LiteralPath '$workDir'; `$Host.UI.RawUI.WindowTitle = '$title'; $command"
    Start-Process powershell -ArgumentList @("-NoExit", "-Command", $psCommand) | Out-Null
    Write-Host "  démarré : $title" -ForegroundColor Green
}

# ── 1. WSL : Postgres + Redis ────────────────────────────────────────────────

Write-Step "Démarrage de WSL ($wslDistro) et des services Postgres / Redis"

# Une commande "wsl -d <distro> -- ..." démarre automatiquement la distro si
# elle est arrêtée — pas besoin de la lancer séparément.
wsl -d $wslDistro -u root -- bash -c "service postgresql start; service redis-server start" 2>&1 | Out-Null

Start-Sleep -Seconds 2

$pgReady = wsl -d $wslDistro -- bash -c "pg_isready -h 127.0.0.1 -p 5432 -U postgres 2>&1"
if ($pgReady -match "accepting connections") {
    Write-Host "  Postgres : OK" -ForegroundColor Green
} else {
    Write-Host "  Postgres : injoignable ($pgReady) — vérifiez l'installation dans WSL" -ForegroundColor Yellow
}

$redisReady = wsl -d $wslDistro -- bash -c "redis-cli ping 2>&1"
if ($redisReady -match "PONG") {
    Write-Host "  Redis    : OK" -ForegroundColor Green
} else {
    Write-Host "  Redis    : injoignable ($redisReady) — vérifiez l'installation dans WSL" -ForegroundColor Yellow
}

# ── 2. Backend : vérifie/complète le .env pour pointer vers Postgres (WSL) ──

Write-Step "Vérification de backend/.env"

$backendDir = Join-Path $root "backend"
$envPath = Join-Path $backendDir ".env"

if (-not (Test-Path $envPath)) {
    Copy-Item (Join-Path $backendDir ".env.example") $envPath
    Write-Host "  .env créé depuis .env.example" -ForegroundColor Yellow
}

$envContent = Get-Content $envPath -Raw
$replacements = @{
    'DB_CONNECTION=.*'  = 'DB_CONNECTION=pgsql'
    'DB_HOST=.*'        = 'DB_HOST=127.0.0.1'
    'DB_PORT=.*'        = 'DB_PORT=5432'
    'DB_DATABASE=.*'    = 'DB_DATABASE=immo_prestige'
    'DB_USERNAME=.*'    = 'DB_USERNAME=postgres'
    'DB_PASSWORD=.*'    = 'DB_PASSWORD=root'
}
$changed = $false
foreach ($pattern in $replacements.Keys) {
    if ($envContent -match $pattern) {
        $newContent = $envContent -replace $pattern, $replacements[$pattern]
        if ($newContent -ne $envContent) { $changed = $true }
        $envContent = $newContent
    }
}
if ($changed) {
    Set-Content -Path $envPath -Value $envContent -NoNewline -Encoding utf8
    Write-Host "  Identifiants Postgres (postgres/root) appliqués dans .env" -ForegroundColor Green
} else {
    Write-Host "  .env déjà configuré" -ForegroundColor Green
}

if (-not (Test-Path (Join-Path $backendDir "vendor"))) {
    Write-Host "  vendor/ absent — installation des dépendances Composer..." -ForegroundColor Yellow
    Push-Location $backendDir
    composer install --no-interaction
    Pop-Location
}

# ── 3. Fenêtres de développement ─────────────────────────────────────────────

Write-Step "Lancement des serveurs"

# Backend : API (php artisan serve) + queue worker + logs (pail), via le
# script composer "dev" déjà défini dans backend/composer.json.
Start-DevWindow "Backend (API + Queue + Logs)" $backendDir "composer run dev"

# Reverb : serveur WebSocket pour la messagerie temps réel.
Start-DevWindow "Reverb (WebSockets)" $backendDir "php artisan reverb:start"

# Frontends.
Start-DevWindow "Admin (5173)"  (Join-Path $root "admin")  "npm run dev"
Start-DevWindow "Agency (5174)" (Join-Path $root "agency") "npm run dev -- --port 5174"
Start-DevWindow "Mobile (Expo)" (Join-Path $root "mobile")  "npm run start"

Write-Step "Terminé"
Write-Host "Backend  : http://localhost:8000"
Write-Host "Admin    : http://localhost:5173"
Write-Host "Agency   : http://localhost:5174"
Write-Host "Mobile   : QR code / http://localhost:8081 (appuyez sur 'w' dans la fenêtre Expo)"
Write-Host ""
Write-Host "Chaque service tourne dans sa propre fenêtre — fermez-les (ou Ctrl+C) pour l'arrêter." -ForegroundColor DarkGray
