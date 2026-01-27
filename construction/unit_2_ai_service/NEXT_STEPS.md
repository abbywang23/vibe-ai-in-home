# Next Steps - Running Your Demo

## 🎯 You're Almost There!

The AI Service is fully implemented and ready to run. Here's what you need to do:

## Step 1: Install Node.js (If Not Already Installed)

### Check if Node.js is installed:
```bash
node --version
npm --version
```

### If not installed:
1. Go to https://nodejs.org/
2. Download the **LTS version** (18.x or 20.x)
3. Install it
4. Verify installation:
   ```bash
   node --version  # Should show v18.x.x or v20.x.x
   npm --version   # Should show 9.x.x or 10.x.x
   ```

## Step 2: Install Dependencies

```bash
cd construction/unit_2_ai_service
npm install
```

This will install all required packages. It may take 1-2 minutes.

## Step 3: Start the Service

```bash
npm run dev
```

You should see:
```
==================================================
🚀 AI Service Started
==================================================
Server running on: http://localhost:3001
Health check: http://localhost:3001/health
Environment: development
==================================================
Loading products from: /path/to/products.yaml
Loaded X products successfully
```

**Keep this terminal open!** The service needs to keep running.

## Step 4: Run the Demo

Open a **NEW terminal** (keep the first one running) and run:

```bash
cd construction/unit_2_ai_service
npm run demo
```

You should see colorful output with test results:
```
████████████████████████████████████████████████████████████
  AI SERVICE DEMO
████████████████████████████████████████████████████████████

==================================================
Test 1: Health Check
==================================================
✓ Health check passed
ℹ Status: ok

... (more tests)

==================================================
Demo Summary
==================================================
✓ Health Check
✓ Get Categories
✓ Search Products
✓ Get Recommendations
✓ Chat (English)
✓ Chat (Chinese)
✓ Get Product by ID

✓ All tests passed (7/7)
```

## 🎉 Success!

If you see "All tests passed (7/7)", congratulations! The demo is working perfectly.

## 🔍 What Just Happened?

The demo tested:

1. **Health Check** - Verified the service is running
2. **Product Categories** - Listed all furniture categories
3. **Product Search** - Searched for sofas
4. **Recommendations** - Generated a furniture layout for a living room
5. **Chat (English)** - Had a conversation in English
6. **Chat (Chinese)** - Had a conversation in Chinese
7. **Product Details** - Retrieved specific product information

## 🧪 Try It Yourself

### Test with curl:

```bash
# Health check
curl http://localhost:3001/health

# Search for sofas
curl "http://localhost:3001/api/ai/products/search?q=sofa&limit=5"

# Get recommendations
curl -X POST http://localhost:3001/api/ai/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "roomType": "living_room",
    "dimensions": {
      "length": 5,
      "width": 4,
      "height": 3,
      "unit": "meters"
    },
    "budget": {
      "amount": 5000,
      "currency": "SGD"
    }
  }'

# Chat
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "123e4567-e89b-12d3-a456-426614174000",
    "message": "I need a sofa",
    "language": "en",
    "context": {}
  }'
```

### Test with Postman or Thunder Client:

1. Import the endpoints from README.md
2. Try different room types: `living_room`, `bedroom`, `dining_room`, `home_office`
3. Try different budgets
4. Try different search queries

## 📚 Learn More

- **README.md** - Full documentation
- **QUICKSTART.md** - Quick start guide
- **IMPLEMENTATION_SUMMARY.md** - Technical details
- **TROUBLESHOOTING.md** - Common issues

## 🐛 Troubleshooting

### Service won't start?
- Check if Node.js is installed: `node --version`
- Check if port 3001 is available
- See TROUBLESHOOTING.md for more help

### Demo fails?
- Make sure service is running first
- Check if you're in the right directory
- See TROUBLESHOOTING.md for more help

### Products not loading?
- Check if `../../product/products.yaml` exists
- Verify the path in `.env` file
- See TROUBLESHOOTING.md for more help

## 🎓 Understanding the Code

### Key Files to Explore:

1. **src/index.ts** - Entry point, starts the server
2. **src/app.ts** - Express app configuration
3. **src/routes/index.ts** - API endpoints
4. **src/services/RecommendationService.ts** - Recommendation logic
5. **src/clients/ProductServiceClient.ts** - Product data loader

### Architecture:

```
HTTP Request
    ↓
Controller (validates request)
    ↓
Service (business logic)
    ↓
Client (data access)
    ↓
HTTP Response
```

## 🚀 What's Next?

### Option 1: Explore the API
- Try different room configurations
- Test with different budgets
- Experiment with chat messages

### Option 2: Modify the Code
- Change recommendation logic in `RecommendationService.ts`
- Add new chat responses in `ChatService.ts`
- Customize placement algorithm

### Option 3: Build the Frontend
- Implement Unit 1 (Frontend Application)
- Connect to this backend
- Create visual interface

### Option 4: Add Real AI
- Integrate OpenAI GPT-4
- Add Replicate for images
- Enhance recommendations

## 💡 Tips

1. **Keep the service running** while testing
2. **Check the logs** in the service terminal for debugging
3. **Use the demo script** to verify everything works
4. **Read the documentation** for detailed information
5. **Experiment** with different inputs

## 🎯 Your Mission

1. ✅ Install Node.js
2. ✅ Install dependencies (`npm install`)
3. ✅ Start the service (`npm run dev`)
4. ✅ Run the demo (`npm run demo`)
5. ✅ See all tests pass
6. 🎉 Celebrate!

## 📞 Need Help?

1. Check **TROUBLESHOOTING.md** for common issues
2. Review **README.md** for detailed documentation
3. Look at the error messages in the terminal
4. Check if the service is running on port 3001

## 🎊 You Did It!

You now have a fully functional AI Service for furniture recommendations. The service can:

- Generate intelligent furniture layouts
- Search and filter products
- Chat in multiple languages
- Respect budget constraints
- Provide detailed product information

**Enjoy exploring your demo!** 🚀
