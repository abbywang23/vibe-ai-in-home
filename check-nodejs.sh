#!/bin/bash

# Node.js Installation Checker
# Run this script after installing Node.js to verify everything is working

echo "=================================================="
echo "  Node.js Installation Checker"
echo "=================================================="
echo ""

# Check if node is installed
if command -v node &> /dev/null; then
    echo "✓ Node.js is installed"
    NODE_VERSION=$(node --version)
    echo "  Version: $NODE_VERSION"
    
    # Check if it's version 20+
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$MAJOR_VERSION" -ge 20 ]; then
        echo "  ✓ Version is 20 or higher (Good!)"
    else
        echo "  ⚠ Version is below 20 (Recommended: 20+)"
    fi
else
    echo "✗ Node.js is NOT installed"
    echo ""
    echo "Please install Node.js using one of these methods:"
    echo "1. Download from: https://nodejs.org/"
    echo "2. Use Homebrew: brew install node@20"
    echo "3. Use NVM: nvm install 20"
    echo ""
    echo "See INSTALL_NODEJS.md for detailed instructions"
    exit 1
fi

echo ""

# Check if npm is installed
if command -v npm &> /dev/null; then
    echo "✓ npm is installed"
    NPM_VERSION=$(npm --version)
    echo "  Version: $NPM_VERSION"
else
    echo "✗ npm is NOT installed"
    exit 1
fi

echo ""
echo "=================================================="
echo "  System Information"
echo "=================================================="
echo "OS: $(uname -s)"
echo "Architecture: $(uname -m)"
echo "Shell: $SHELL"

echo ""
echo "=================================================="
echo "  Next Steps"
echo "=================================================="
echo ""
echo "1. Navigate to the project:"
echo "   cd construction/unit_2_ai_service"
echo ""
echo "2. Install dependencies:"
echo "   npm install"
echo ""
echo "3. Start the service:"
echo "   npm run dev"
echo ""
echo "4. Run the demo (in a new terminal):"
echo "   npm run demo"
echo ""
echo "=================================================="
echo "✓ Your system is ready for Node.js development!"
echo "=================================================="
