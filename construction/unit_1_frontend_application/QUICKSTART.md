# Frontend Application - Quick Start Guide

## Prerequisites

- Node.js v18.12.0 or higher
- npm 8.19.2 or higher

## Installation

```bash
# Install dependencies
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update environment variables in `.env`:
```
VITE_AI_SERVICE_URL=http://localhost:3001/api/ai
```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

Build for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── RoomConfigPanel.tsx
│   ├── PreferencesPanel.tsx
│   ├── RecommendationsDisplay.tsx
│   └── ChatPanel.tsx
├── store/              # Redux store
│   ├── index.ts
│   └── slices/
│       ├── sessionSlice.ts
│       ├── designSlice.ts
│       ├── cartSlice.ts
│       └── uiSlice.ts
├── services/           # API services
│   ├── api.ts
│   └── aiApi.ts
├── types/              # TypeScript types
│   ├── domain.ts
│   └── index.ts
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Features Implemented

### Core Features
- ✅ Room configuration (type, dimensions, unit selection)
- ✅ User preferences (budget, categories, collections)
- ✅ AI chat interface
- ✅ Furniture recommendations display
- ✅ Shopping cart integration
- ✅ Redux state management
- ✅ RTK Query for API calls

### Domain Model
- ✅ PlanningSession aggregate
- ✅ RoomDesign aggregate
- ✅ ShoppingCart aggregate
- ✅ Value objects (Money, RoomDimensions, etc.)
- ✅ Entities (FurniturePlacement, CartItem, etc.)

## API Integration

The frontend integrates with the AI Service backend at `http://localhost:3001/api/ai`.

### Available Endpoints

- `POST /recommend` - Get AI furniture recommendations
- `POST /chat` - Send chat message to AI
- `POST /upload` - Upload room image
- `POST /detect` - Detect furniture in image
- `GET /products/search` - Search products
- `GET /products/:id` - Get product details
- `GET /products/categories` - Get categories
- `GET /products/collections` - Get collections

## Next Steps

1. **3D Visualization**: Integrate Three.js for 3D room visualization
2. **2D Canvas**: Implement Konva.js for 2D floor plan view
3. **Image Upload**: Add room image upload and furniture detection
4. **Internationalization**: Add i18next for multi-language support
5. **Testing**: Add unit tests with Vitest
6. **Styling**: Enhance UI/UX with custom themes

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, you can change it in `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    port: 3000, // Change to your preferred port
  },
});
```

### API Connection Issues

Make sure the AI Service backend is running at `http://localhost:3001` before starting the frontend.

## Notes

- The application uses Material-UI (MUI) for UI components
- Redux Toolkit is used for state management
- RTK Query handles API calls and caching
- TypeScript provides type safety throughout the application
