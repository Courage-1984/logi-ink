#!/bin/bash
# Font Subsetting Script using glyphhanger
# This script subsets fonts using glyphhanger with proper escaping

# Characters to include (from analysis)
CHARS=' !"#$%&'\''()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^`abcdefghijklmnopqrstuvwxyz{|}~–—•…→'

echo "🔤 Font Subsetting with glyphhanger"
echo "===================================="
echo ""

# Check if glyphhanger is installed
if ! command -v glyphhanger &> /dev/null; then
    echo "❌ Error: glyphhanger is not installed"
    echo "   Install it with: npm install -g glyphhanger"
    exit 1
fi

echo "📦 Subsetting Orbitron fonts..."
glyphhanger --subset=./assets/fonts/Orbitron/woff2/*.woff2 --formats=woff2 --US_ASCII --whitelist="$CHARS"

if [ $? -eq 0 ]; then
    echo "   ✅ Orbitron fonts subsetted successfully"
else
    echo "   ❌ Error subsetting Orbitron fonts"
fi

echo ""
echo "📦 Subsetting Rajdhani fonts..."
glyphhanger --subset=./assets/fonts/Rajdhani/woff2/*.woff2 --formats=woff2 --US_ASCII --whitelist="$CHARS"

if [ $? -eq 0 ]; then
    echo "   ✅ Rajdhani fonts subsetted successfully"
else
    echo "   ❌ Error subsetting Rajdhani fonts"
fi

echo ""
echo "✅ Font subsetting complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. Verify font files are smaller"
echo "   2. Test fonts in browser"
echo "   3. Verify all characters display correctly"

