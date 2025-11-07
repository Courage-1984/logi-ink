# Font Subsetting Script using glyphhanger (PowerShell version)
# This script subsets fonts using glyphhanger with proper escaping

# Characters to include (from analysis)
$CHARS = ' !"#$%&''()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^`abcdefghijklmnopqrstuvwxyz{|}~–—•…→'

Write-Host "🔤 Font Subsetting with glyphhanger" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if glyphhanger is installed
try {
    $null = Get-Command glyphhanger -ErrorAction Stop
} catch {
    Write-Host "❌ Error: glyphhanger is not installed" -ForegroundColor Red
    Write-Host "   Install it with: npm install -g glyphhanger" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Subsetting Orbitron fonts..." -ForegroundColor Yellow
$orbitronResult = & glyphhanger --subset=./assets/fonts/Orbitron/woff2/*.woff2 --formats=woff2 --US_ASCII --whitelist=$CHARS 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Orbitron fonts subsetted successfully" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error subsetting Orbitron fonts" -ForegroundColor Red
    Write-Host "   Error: $orbitronResult" -ForegroundColor Red
}

Write-Host ""
Write-Host "📦 Subsetting Rajdhani fonts..." -ForegroundColor Yellow
$rajdhaniResult = & glyphhanger --subset=./assets/fonts/Rajdhani/woff2/*.woff2 --formats=woff2 --US_ASCII --whitelist=$CHARS 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Rajdhani fonts subsetted successfully" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error subsetting Rajdhani fonts" -ForegroundColor Red
    Write-Host "   Error: $rajdhaniResult" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Font subsetting complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Verify font files are smaller"
Write-Host "   2. Test fonts in browser"
Write-Host "   3. Verify all characters display correctly"

