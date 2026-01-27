# Installing Node.js 20 LTS on macOS (Apple Silicon)

You're running macOS on Apple Silicon (ARM64). Here are the best ways to install Node.js:

## ⚠️ Important Note

I cannot install Node.js automatically because it requires system administrator privileges. You'll need to install it manually using one of the methods below.

---

## Method 1: Official Installer (Recommended - Easiest)

### Steps:

1. **Download the installer**
   - Go to: https://nodejs.org/
   - Click the **"20.x.x LTS"** button (green button on the left)
   - This will download a `.pkg` file for macOS ARM64

2. **Run the installer**
   - Double-click the downloaded `.pkg` file
   - Follow the installation wizard
   - Enter your password when prompted
   - Click "Install"

3. **Verify installation**
   ```bash
   node --version   # Should show v20.x.x
   npm --version    # Should show 10.x.x
   ```

4. **Run the demo**
   ```bash
   cd construction/unit_2_ai_service
   npm install
   npm run dev
   ```

**Time required**: 5 minutes

---

## Method 2: Homebrew (Recommended for Developers)

If you use Homebrew (a package manager for macOS):

### Install Homebrew first (if not installed):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Then install Node.js:
```bash
brew install node@20
```

### Verify:
```bash
node --version
npm --version
```

**Time required**: 10-15 minutes (including Homebrew installation)

---

## Method 3: NVM (Node Version Manager)

For managing multiple Node.js versions:

### Install NVM:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

### Restart your terminal, then:
```bash
nvm install 20
nvm use 20
nvm alias default 20
```

### Verify:
```bash
node --version
npm --version
```

**Time required**: 10 minutes

---

## After Installation

Once Node.js is installed, run these commands:

```bash
# Navigate to the project
cd construction/unit_2_ai_service

# Install dependencies
npm install

# Start the service
npm run dev
```

In a **new terminal**:
```bash
# Navigate to the project
cd construction/unit_2_ai_service

# Run the demo
npm run demo
```

You should see:
```
✓ All tests passed (7/7)
```

---

## Quick Test

After installing Node.js, test it immediately:

```bash
# Check versions
node --version
npm --version

# Test Node.js
node -e "console.log('Node.js is working!')"

# Test npm
npm --version
```

---

## Troubleshooting

### "command not found: node"

**Solution**: Restart your terminal after installation

### "permission denied"

**Solution**: Use the official installer (Method 1) instead of command-line methods

### Still having issues?

1. Make sure you downloaded the **ARM64** version (not x64)
2. Restart your computer after installation
3. Check if Node.js is in your PATH:
   ```bash
   echo $PATH
   ```

---

## Which Method Should I Use?

- **New to development?** → Use Method 1 (Official Installer)
- **Already use Homebrew?** → Use Method 2 (Homebrew)
- **Need multiple Node versions?** → Use Method 3 (NVM)

---

## Next Steps After Installation

1. ✅ Install Node.js (using one of the methods above)
2. ✅ Verify installation: `node --version`
3. ✅ Navigate to project: `cd construction/unit_2_ai_service`
4. ✅ Install dependencies: `npm install`
5. ✅ Start service: `npm run dev`
6. ✅ Run demo: `npm run demo` (in new terminal)
7. 🎉 See all tests pass!

---

## Download Links

- **Official Node.js**: https://nodejs.org/
- **Homebrew**: https://brew.sh/
- **NVM**: https://github.com/nvm-sh/nvm

---

## Need Help?

After installing Node.js, if you encounter any issues:

1. Check `construction/unit_2_ai_service/TROUBLESHOOTING.md`
2. Verify Node.js version: `node --version` (should be 20.x.x)
3. Make sure you're in the right directory
4. Try restarting your terminal

---

**Estimated total time**: 5-15 minutes depending on method chosen
