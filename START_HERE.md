# 🚀 START HERE - Quick Setup Guide

## Current Status

✅ **AI Service Code**: Fully implemented and ready  
❌ **Node.js**: Not installed yet (required to run the demo)

---

## What You Need to Do

### Step 1: Install Node.js (5 minutes)

You have **3 options**:

#### Option A: Official Installer (Easiest) ⭐ RECOMMENDED
1. Open your browser
2. Go to: **https://nodejs.org/**
3. Click the green **"20.x.x LTS"** button
4. Download and run the installer
5. Follow the installation wizard
6. Done!

#### Option B: Using Homebrew (If you have it)
```bash
brew install node@20
```

#### Option C: Using NVM (For multiple versions)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# Restart terminal, then:
nvm install 20
nvm use 20
```

**See `INSTALL_NODEJS.md` for detailed instructions**

---

### Step 2: Verify Installation

After installing Node.js, run this script:

```bash
./check-nodejs.sh
```

You should see:
```
✓ Node.js is installed
  Version: v20.x.x
  ✓ Version is 20 or higher (Good!)

✓ npm is installed
  Version: 10.x.x

✓ Your system is ready for Node.js development!
```

---

### Step 3: Run the Demo (2 minutes)

Once Node.js is installed:

```bash
# Navigate to the project
cd construction/unit_2_ai_service

# Install dependencies (first time only)
npm install

# Start the service
npm run dev
```

**Keep this terminal open!**

Then open a **NEW terminal** and run:

```bash
cd construction/unit_2_ai_service
npm run demo
```

You should see:
```
████████████████████████████████████████████████████████████
  AI SERVICE DEMO
████████████████████████████████████████████████████████████

✓ All tests passed (7/7)
```

---

## 🎉 That's It!

Once you see "All tests passed", your demo is working perfectly!

---

## 📚 Documentation

- **INSTALL_NODEJS.md** - Detailed Node.js installation guide
- **construction/unit_2_ai_service/README.md** - Full API documentation
- **construction/unit_2_ai_service/QUICKSTART.md** - Quick start guide
- **construction/unit_2_ai_service/NEXT_STEPS.md** - What to do after demo
- **construction/DEMO_STATUS.md** - Implementation status

---

## 🆘 Need Help?

### Node.js won't install?
- Make sure you download the **ARM64** version (for Apple Silicon)
- Try restarting your computer after installation
- See `INSTALL_NODEJS.md` for alternative methods

### Demo won't run?
- Make sure Node.js is installed: `node --version`
- Make sure you're in the right directory
- See `construction/unit_2_ai_service/TROUBLESHOOTING.md`

### Still stuck?
- Check if the service is running on port 3001
- Look at the error messages in the terminal
- Review the troubleshooting guide

---

## 🎯 Quick Checklist

- [ ] Install Node.js 20+ LTS
- [ ] Run `./check-nodejs.sh` to verify
- [ ] Navigate to `construction/unit_2_ai_service`
- [ ] Run `npm install`
- [ ] Run `npm run dev` (keep terminal open)
- [ ] Open new terminal
- [ ] Run `npm run demo`
- [ ] See all tests pass ✓

---

## 💡 What You'll Get

A fully functional AI Service that can:
- Generate furniture recommendations for any room
- Search and filter products
- Chat in English and Chinese
- Respect budget constraints
- Provide detailed product information

All without requiring external API keys!

---

**Ready? Start with Step 1: Install Node.js** 👆
