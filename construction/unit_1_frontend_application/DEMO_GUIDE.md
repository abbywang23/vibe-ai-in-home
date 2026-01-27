# Frontend Application - Demo Guide

## Overview

This is a React-based furniture planning application that integrates with an AI service to provide intelligent furniture recommendations.

## Prerequisites

Before running the demo, ensure:

1. **Node.js** v18.12.0 is installed
2. **Backend AI Service** is running at `http://localhost:3001`
3. **Dependencies** are installed: `npm install`

## Starting the Application

```bash
cd vibe-ai-in-home/construction/unit_1_frontend_application
npm run dev
```

The application will start at: **http://localhost:5173**

## Demo Walkthrough

### Step 1: Configure Room

1. Open the application in your browser
2. You'll see three tabs: **Configure**, **Preferences**, and **Chat**
3. In the **Configure** tab:
   - Select a **Room Type** (Living Room, Bedroom, Dining Room, or Home Office)
   - Choose your preferred **Unit** (Meters or Feet)
   - Enter room dimensions:
     - Length (e.g., 5 meters)
     - Width (e.g., 4 meters)
     - Height (e.g., 3 meters)
   - Click **Continue**

### Step 2: Set Preferences

1. Switch to the **Preferences** tab
2. Set your preferences:
   - **Budget**: Enter your total budget in USD (optional)
   - **Categories**: Click on furniture categories you're interested in (e.g., Sofas, Tables, Chairs)
   - **Collections**: Select Castlery collections you prefer
3. Click **Get Recommendations**

### Step 3: View Recommendations

1. The right panel will display AI-generated furniture recommendations
2. Each furniture item shows:
   - Product name
   - Whether it's AI-recommended or manually added
   - **Add to Cart** button
   - **Remove** button

### Step 4: Chat with AI

1. Switch to the **Chat** tab
2. Type a message to the AI assistant, such as:
   - "Can you suggest a sofa for my living room?"
   - "I need a desk for my home office"
   - "What's the total price of my design?"
3. The AI will respond with helpful suggestions

### Step 5: Manage Cart

1. Click **Add to Cart** on any furniture item
2. The cart count in the top-right corner will update
3. The status bar at the bottom shows:
   - Current session status
   - Room type
   - Number of furniture items
   - Number of items in cart

## Features Demonstrated

### ✅ Implemented
- Room configuration with type and dimensions
- Unit conversion (Meters/Feet)
- User preferences (budget, categories, collections)
- AI chat interface
- Furniture recommendations display
- Shopping cart integration
- Redux state management
- Real-time status updates

### 🚧 Coming Soon
- 3D room visualization
- 2D floor plan view
- Room image upload
- Furniture detection in images
- Drag-and-drop furniture placement
- Export design as image
- Shareable design links

## Testing Without Backend

If the backend AI service is not running, you can still:
- Configure the room
- Set preferences
- View the UI components
- Test the chat interface (will show errors in console)

The application will display error messages if the backend is unavailable.

## Sample Data

### Room Configurations
- **Living Room**: 5m × 4m × 3m
- **Bedroom**: 4m × 3.5m × 2.8m
- **Dining Room**: 4.5m × 3m × 3m
- **Home Office**: 3m × 2.5m × 2.8m

### Budget Examples
- Small budget: $1,000 - $2,000
- Medium budget: $3,000 - $5,000
- Large budget: $7,000 - $10,000

## Troubleshooting

### Port Already in Use
If port 5173 is occupied:
```bash
# Kill the process using port 5173
lsof -ti:5173 | xargs kill -9
# Or change the port in vite.config.ts
```

### Backend Connection Error
Ensure the AI service is running:
```bash
cd vibe-ai-in-home/construction/unit_2_ai_service
npm run dev
```

### Dependencies Issues
Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Architecture Highlights

### State Management
- **Redux Toolkit** for centralized state
- **RTK Query** for API calls and caching
- Type-safe actions and reducers

### Component Structure
- **Functional components** with hooks
- **Material-UI** for consistent design
- **Responsive layout** with Grid system

### Domain-Driven Design
- Clear separation of concerns
- Aggregates: PlanningSession, RoomDesign, ShoppingCart
- Value Objects: Money, RoomDimensions, UserPreferences
- Entities: FurniturePlacement, CartItem

## Next Demo Features

In the next iteration, you'll be able to:
1. **Upload room photos** and detect existing furniture
2. **View 3D visualization** of your room design
3. **Drag and drop** furniture in 2D/3D views
4. **Export designs** as images with Castlery watermark
5. **Share designs** via unique links
6. **Switch languages** between English and Chinese

## Feedback

For issues or suggestions, please check:
- `IMPLEMENTATION_STATUS.md` - Current implementation status
- `QUICKSTART.md` - Quick start guide
- `domain_model.md` - Domain model documentation
- `logical_design.md` - Logical design documentation
