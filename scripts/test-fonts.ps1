# Quick Font Testing Script
# Tests subsetted fonts after subsetting

Write-Host "🔤 Font Testing" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host ""

# Check font file sizes
Write-Host "📊 Font File Sizes:" -ForegroundColor Yellow
Write-Host ""

Write-Host "Orbitron Fonts:" -ForegroundColor White
Get-ChildItem -Path "assets/fonts/Orbitron/woff2/*subset*.woff2" | 
    Select-Object Name, @{Name="SizeKB";Expression={[math]::Round($_.Length/1KB,2)}} | 
    Format-Table -AutoSize

Write-Host "Rajdhani Fonts:" -ForegroundColor White
Get-ChildItem -Path "assets/fonts/Rajdhani/woff2/*subset*.woff2" | 
    Select-Object Name, @{Name="SizeKB";Expression={[math]::Round($_.Length/1KB,2)}} | 
    Format-Table -AutoSize

# Calculate total reduction
$orbitronOriginal = (Get-ChildItem -Path "assets/fonts/Orbitron/woff2/*.woff2" | Where-Object { $_.Name -notlike "*subset*" } | Measure-Object -Property Length -Sum).Sum
$orbitronSubset = (Get-ChildItem -Path "assets/fonts/Orbitron/woff2/*subset*.woff2" | Measure-Object -Property Length -Sum).Sum
$orbitronReduction = [math]::Round((1 - ($orbitronSubset / $orbitronOriginal)) * 100, 1)

$rajdhaniOriginal = (Get-ChildItem -Path "assets/fonts/Rajdhani/woff2/*.woff2" | Where-Object { $_.Name -notlike "*subset*" } | Measure-Object -Property Length -Sum).Sum
$rajdhaniSubset = (Get-ChildItem -Path "assets/fonts/Rajdhani/woff2/*subset*.woff2" | Measure-Object -Property Length -Sum).Sum
$rajdhaniReduction = [math]::Round((1 - ($rajdhaniSubset / $rajdhaniOriginal)) * 100, 1)

Write-Host "📈 Size Reduction Summary:" -ForegroundColor Yellow
Write-Host "   Orbitron: $([math]::Round($orbitronOriginal/1KB, 2)) KB → $([math]::Round($orbitronSubset/1KB, 2)) KB ($orbitronReduction% reduction)" -ForegroundColor Green
Write-Host "   Rajdhani: $([math]::Round($rajdhaniOriginal/1KB, 2)) KB → $([math]::Round($rajdhaniSubset/1KB, 2)) KB ($rajdhaniReduction% reduction)" -ForegroundColor Green
Write-Host ""

# Check if CSS is updated
Write-Host "🔍 Checking CSS Configuration:" -ForegroundColor Yellow
$fontsCSS = Get-Content "css/fonts.css" -Raw
if ($fontsCSS -match "subset") {
    Write-Host "   ✅ CSS updated to use subsetted fonts" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  CSS may not be using subsetted fonts" -ForegroundColor Yellow
    Write-Host "      Check css/fonts.css for '-subset' suffix" -ForegroundColor Yellow
}
Write-Host ""

# Check if test page exists
if (Test-Path "test-fonts.html") {
    Write-Host "✅ Test page exists: test-fonts.html" -ForegroundColor Green
    Write-Host "   Open in browser to test fonts" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  Test page not found" -ForegroundColor Yellow
    Write-Host "   Create test-fonts.html to test fonts" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Start dev server: npm run dev" -ForegroundColor White
Write-Host "   2. Open test-fonts.html in browser" -ForegroundColor White
Write-Host "   3. Open index.html and check all pages" -ForegroundColor White
Write-Host "   4. Check DevTools Network tab for font loading" -ForegroundColor White
Write-Host "   5. Verify all characters display correctly" -ForegroundColor White
Write-Host "   6. Check console for any errors" -ForegroundColor White
Write-Host ""

