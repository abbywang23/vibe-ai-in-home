# Quick Start Guide

Get the AI Service running in 3 simple steps!

## Step 1: Install Dependencies

```bash
cd construction/unit_2_ai_service
npm install
```

This will install all required packages including Express, TypeScript, and other dependencies.

## Step 2: Start the Service

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
Loading products from: /path/to/product/products.yaml
Loaded X products successfully
```

## Step 3: Run the Demo

Open a **new terminal** (keep the service running) and run:

```bash
cd construction/unit_2_ai_service
npm run demo
```

You should see colorful output testing all features:
- ✓ Health check
- ✓ Get product categories
- ✓ Search products
- ✓ Get furniture recommendations
- ✓ Chat interaction (English)
- ✓ Chat interaction (Chinese)
- ✓ Get product by ID

## What's Next?

### Test Individual Endpoints

Use curl, Postman, or any HTTP client:

```bash
# Health check
curl http://localhost:3001/health

# Search products
curl "http://localhost:3001/api/ai/products/search?q=sofa&limit=5"

# Get recommendations
curl -X POST http://localhost:3001/api/ai/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "roomType": "living_room",
    "dimensions": {"length": 5, "width": 4, "height": 3, "unit": "meters"},
    "budget": {"amount": 5000, "currency": "SGD"}
  }'
```

### Integrate with Frontend

The service is ready to be consumed by the frontend application. All endpoints follow the API contract defined in the logical design.

## Troubleshooting

### "npm: command not found"
Install Node.js from https://nodejs.org/ (version 18+ or 20+ LTS recommended)

### "Port 3001 already in use"
Change the port in `.env`:
```
PORT=3002
```

### "Products file not found"
Verify the path in `.env` points to the correct location:
```
PRODUCTS_CONFIG_PATH=../../product/products.yaml
```

### Demo fails with connection error
Make sure the service is running on port 3001 before running the demo.

## Need Help?

Check the full README.md for detailed documentation.
