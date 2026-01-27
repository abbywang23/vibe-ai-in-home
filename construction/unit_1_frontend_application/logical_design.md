# Unit 1: Frontend Application - Logical Design

## Overview

The Frontend Application is a React-based web application that provides the user interface for the Castlery Furniture Planner. It manages user interactions, room configuration, 3D/2D visualization, and integrates with AI and Product services.

---

## Technology Stack

### Core Technologies
- **Framework**: React 18+ with TypeScript
- **State Management**: Redux Toolkit + RTK Query
- **Routing**: React Router v6
- **UI Components**: Material-UI (MUI) v5
- **3D Rendering**: Three.js + React Three Fiber
- **2D Canvas**: Konva.js + React Konva
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod validation
- **Internationalization**: i18next
- **Build Tool**: Vite

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint + Prettier
- **Testing**: Vitest + React Testing Library
- **Type Checking**: TypeScript 5+

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend Application                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Presentation Layer                       │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │  Pages   │  │Components│  │  Layouts │  │  Hooks   │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Application Layer                        │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │  Redux   │  │RTK Query │  │ Services │  │  Utils   │   │ │
│  │  │  Store   │  │   APIs   │  │          │  │          │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      Domain Layer                           │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │  Models  │  │  Types   │  │Validators│  │Constants │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Infrastructure Layer                       │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │HTTP Client│  │LocalStorage│ │Analytics│  │  Logger  │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  External APIs   │
                    │  - AI Service    │
                    │    (with Products)│
                    └──────────────────┘
```

---

## Component Architecture

### Page Components

#### 1. HomePage
- **Route**: `/`
- **Purpose**: Landing page with feature overview
- **Components**: Hero, FeatureList, CTAButton

#### 2. PlannerPage
- **Route**: `/planner`
- **Purpose**: Main planning interface
- **Components**: 
  - RoomConfigPanel
  - PreferencesPanel
  - VisualizationCanvas
  - FurnitureList
  - ChatPanel
  - ShoppingCart

#### 3. DesignViewPage
- **Route**: `/design/:linkId`
- **Purpose**: View shared design from link
- **Components**: VisualizationCanvas (read-only)

---

### Feature Components

#### RoomConfigPanel
```typescript
interface RoomConfigPanelProps {
  onConfigComplete: (config: RoomConfiguration) => void;
}
```
- Room type selector
- Dimension inputs with unit toggle
- Room image upload
- Template selector

#### PreferencesPanel
```typescript
interface PreferencesPanelProps {
  onPreferencesChange: (prefs: UserPreferences) => void;
}
```
- Budget input
- Category multi-select
- Collection multi-select
- Product search and select

#### VisualizationCanvas
```typescript
interface VisualizationCanvasProps {
  mode: '2D' | '3D';
  design: RoomDesign;
  onFurnitureSelect: (id: string) => void;
  onFurnitureMove: (id: string, position: Position3D) => void;
  onFurnitureRotate: (id: string, rotation: number) => void;
}
```
- 2D view: Konva canvas with top-down layout
- 3D view: Three.js scene with camera controls
- Furniture drag-and-drop
- Dimension labels toggle
- Camera angle presets

#### FurnitureList
```typescript
interface FurnitureListProps {
  placements: FurniturePlacement[];
  onRemove: (id: string) => void;
  onAddToCart: (id: string) => void;
}
```
- List of placed furniture
- Product thumbnails and names
- Price display
- Remove and add-to-cart actions

#### ChatPanel
```typescript
interface ChatPanelProps {
  sessionId: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}
```
- Message history display
- Text input with send button
- Language toggle (EN/ZH)
- Loading indicator for AI responses

#### ShoppingCart
```typescript
interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}
```
- Cart item list
- Quantity controls
- Total price calculation
- Add all from design button
- Checkout button (demo: shows message)

---

## State Management

### Redux Store Structure

```typescript
interface RootState {
  session: SessionState;
  design: DesignState;
  cart: CartState;
  ui: UIState;
}

interface SessionState {
  sessionId: string | null;
  status: SessionStatus;
  preferences: UserPreferences;
  userSettings: UserSettings;
  chatHistory: ChatMessage[];
}

interface DesignState {
  designId: string | null;
  roomType: RoomType | null;
  roomDimensions: RoomDimensions | null;
  furniturePlacements: FurniturePlacement[];
  roomImage: RoomImage | null;
  viewState: ViewState;
}

interface CartState {
  cartId: string | null;
  items: CartItem[];
  totalPrice: number;
}

interface UIState {
  activePanel: 'config' | 'preferences' | 'chat' | 'cart';
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];
}
```

### Redux Slices

#### sessionSlice
- Actions: startSession, updatePreferences, addChatMessage, updateSettings
- Thunks: requestRecommendations, sendChatMessage

#### designSlice
- Actions: setRoomConfig, placeFurniture, moveFurniture, rotateFurniture, removeFurniture, switchViewMode, setCameraAngle
- Thunks: uploadRoomImage, detectFurniture, applyReplacement, placeFurnitureInEmptyRoom

#### cartSlice
- Actions: addItem, removeItem, updateQuantity, clearCart
- Thunks: addAllFromDesign, validateStock

#### uiSlice
- Actions: setActivePanel, setLoading, setError, addNotification, clearNotification

---

## API Integration (RTK Query)

### AI Service API (with integrated Products)

```typescript
const aiApi = createApi({
  reducerPath: 'aiApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/ai' }),
  endpoints: (builder) => ({
    getRecommendations: builder.mutation<RecommendationResponse, RecommendationRequest>({
      query: (data) => ({ url: '/recommend', method: 'POST', body: data }),
    }),
    sendChatMessage: builder.mutation<ChatResponse, ChatRequest>({
      query: (data) => ({ url: '/chat', method: 'POST', body: data }),
    }),
    detectFurniture: builder.mutation<DetectionResponse, DetectionRequest>({
      query: (data) => ({ url: '/detect', method: 'POST', body: data }),
    }),
    replaceFurniture: builder.mutation<ReplacementResponse, ReplacementRequest>({
      query: (data) => ({ url: '/replace', method: 'POST', body: data }),
    }),
    placeFurniture: builder.mutation<PlacementResponse, PlacementRequest>({
      query: (data) => ({ url: '/place', method: 'POST', body: data }),
    }),
    uploadImage: builder.mutation<UploadResponse, FormData>({
      query: (formData) => ({ url: '/upload', method: 'POST', body: formData }),
    }),
    // Product-related endpoints (now part of AI Service)
    searchProducts: builder.query<ProductListResponse, SearchParams>({
      query: (params) => ({ url: '/products/search', params }),
    }),
    getProductById: builder.query<ProductDetailResponse, string>({
      query: (id) => `/products/${id}`,
    }),
    getCategories: builder.query<CategoryListResponse, void>({
      query: () => '/products/categories',
    }),
  }),
});
```

---

## Routing Configuration

```typescript
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'planner', element: <PlannerPage /> },
      { path: 'design/:linkId', element: <DesignViewPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
```

---

## 3D Visualization (Three.js)

### Scene Setup

```typescript
// Scene components
- Scene: Container for all 3D objects
- Camera: PerspectiveCamera with OrbitControls
- Lights: AmbientLight + DirectionalLight
- Floor: PlaneGeometry with grid texture
- Walls: BoxGeometry for room boundaries
- Furniture: GLTFLoader for 3D models
```

### Camera Presets

```typescript
const CAMERA_PRESETS = {
  front: { position: [0, 5, 10], target: [0, 0, 0] },
  side: { position: [10, 5, 0], target: [0, 0, 0] },
  corner: { position: [7, 7, 7], target: [0, 0, 0] },
  topDown: { position: [0, 15, 0], target: [0, 0, 0] },
};
```

### Furniture Interaction

- Raycasting for click detection
- TransformControls for drag-and-drop
- Bounding box visualization for collision detection
- Rotation handles for orientation adjustment

---

## 2D Visualization (Konva)

### Canvas Layers

```typescript
- Stage: Root container
  - BackgroundLayer: Room outline and grid
  - FurnitureLayer: Furniture shapes (rectangles with images)
  - DimensionLayer: Measurement labels and lines
  - InteractionLayer: Drag handles and selection indicators
```

### Furniture Representation

- Rectangle shape with product thumbnail
- Rotation transformer
- Dimension labels (width × depth)
- Collision detection with other furniture

---

## Data Flow Examples

### Flow 1: Get AI Recommendations

```
User Input (Room Config + Preferences)
  ↓
sessionSlice.requestRecommendations (thunk)
  ↓
aiApi.getRecommendations (RTK Query)
  ↓
HTTP POST /api/ai/recommend
  ↓
Response: recommendations[]
  ↓
designSlice.setFurniturePlacements (action)
  ↓
VisualizationCanvas re-renders with new furniture
```

### Flow 2: Upload Room Image & Detect Furniture

```
User uploads image
  ↓
designSlice.uploadRoomImage (thunk)
  ↓
Upload to server (returns imageUrl)
  ↓
aiApi.detectFurniture (RTK Query)
  ↓
HTTP POST /api/ai/detect
  ↓
Response: detectedItems[] + isEmpty flag
  ↓
If isEmpty = true:
  - Show empty room placement mode
  - Suggest furniture placements
If isEmpty = false:
  - Show detected furniture list
  - Enable replacement mode
```

### Flow 3: Place Furniture in Empty Room

```
User selects furniture from catalog
  ↓
User clicks position in room image
  ↓
designSlice.placeFurnitureInEmptyRoom (thunk)
  ↓
aiApi.placeFurniture (RTK Query)
  ↓
HTTP POST /api/ai/place
  ↓
Response: resultImageUrl
  ↓
Update roomImage.processedUrl
  ↓
Display rendered image with furniture
```

---

## Local Storage

### Persisted Data

```typescript
interface LocalStorageData {
  sessionId: string;
  userSettings: UserSettings;
  recentDesigns: DesignSummary[];
}
```

### Storage Keys
- `planner_session_id`: Current session ID
- `planner_user_settings`: Unit preference, language
- `planner_recent_designs`: Last 5 designs (for quick access)

---

## Error Handling

### Error Boundaries

```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <PlannerPage />
</ErrorBoundary>
```

### API Error Handling

```typescript
try {
  const result = await dispatch(requestRecommendations(config)).unwrap();
} catch (error) {
  if (error.status === 503) {
    showNotification('AI service temporarily unavailable. Please try again.');
  } else {
    showNotification('An error occurred. Please try again.');
  }
}
```

### User-Friendly Error Messages

| Error Code | User Message |
|------------|--------------|
| `INVALID_REQUEST` | Please check your input and try again |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable. Please try again in a moment |
| `NOT_FOUND` | The requested item was not found |
| `NETWORK_ERROR` | Network connection issue. Please check your internet |

---

## Internationalization (i18n)

### Language Files

```
/src/locales/
  en/
    common.json
    planner.json
    errors.json
  zh/
    common.json
    planner.json
    errors.json
```

### Usage Example

```typescript
import { useTranslation } from 'react-i18next';

function RoomConfigPanel() {
  const { t } = useTranslation('planner');
  
  return (
    <div>
      <h2>{t('roomConfig.title')}</h2>
      <label>{t('roomConfig.roomType')}</label>
    </div>
  );
}
```

---

## Performance Optimization

### Code Splitting

```typescript
const PlannerPage = lazy(() => import('./pages/PlannerPage'));
const DesignViewPage = lazy(() => import('./pages/DesignViewPage'));
```

### Memoization

```typescript
const MemoizedVisualizationCanvas = memo(VisualizationCanvas);
const furniturePlacements = useMemo(() => 
  design.placements.filter(p => p.isVisible), 
  [design.placements]
);
```

### Virtual Scrolling

- Use `react-window` for long furniture lists
- Lazy load product images with `react-lazy-load-image-component`

---

## Testing Strategy

### Unit Tests (Vitest)

```typescript
describe('sessionSlice', () => {
  it('should start a new session', () => {
    const state = sessionReducer(undefined, startSession());
    expect(state.sessionId).toBeDefined();
    expect(state.status).toBe('STARTED');
  });
});
```

### Component Tests (React Testing Library)

```typescript
describe('RoomConfigPanel', () => {
  it('should call onConfigComplete when form is submitted', async () => {
    const onConfigComplete = vi.fn();
    render(<RoomConfigPanel onConfigComplete={onConfigComplete} />);
    
    // Fill form and submit
    await userEvent.selectOptions(screen.getByLabelText('Room Type'), 'living_room');
    await userEvent.type(screen.getByLabelText('Length'), '5');
    await userEvent.click(screen.getByText('Continue'));
    
    expect(onConfigComplete).toHaveBeenCalledWith({
      roomType: 'living_room',
      dimensions: { length: 5, width: 0, height: 0, unit: 'meters' },
    });
  });
});
```

### E2E Tests (Playwright - Optional)

```typescript
test('complete planning flow', async ({ page }) => {
  await page.goto('/planner');
  await page.selectOption('[name="roomType"]', 'living_room');
  await page.fill('[name="length"]', '5');
  await page.fill('[name="width"]', '4');
  await page.click('button:has-text("Get Recommendations")');
  await expect(page.locator('.furniture-item')).toHaveCount(5);
});
```

---

## Build & Deployment

### Development

```bash
npm install
npm run dev  # Starts Vite dev server on http://localhost:5173
```

### Production Build

```bash
npm run build  # Outputs to /dist
npm run preview  # Preview production build
```

### Environment Variables

```env
VITE_AI_SERVICE_URL=http://localhost:3001/api/ai
VITE_IMAGE_UPLOAD_URL=http://localhost:3001/api/upload
```

### Deployment Options

#### Demo Deployment
- **Platform**: Vercel / Netlify
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment**: Set API URLs to deployed backend services

#### Production Deployment
- **Platform**: AWS S3 + CloudFront
- **CI/CD**: GitHub Actions
- **CDN**: CloudFront for static assets
- **API Proxy**: CloudFront origin for backend APIs

---

## Security Considerations

### Input Validation

- Validate all user inputs with Zod schemas
- Sanitize file uploads (image type, size limits)
- Prevent XSS with React's built-in escaping

### API Security

- Use HTTPS for all API calls
- Implement CORS policies on backend
- Rate limiting on API endpoints

### Data Privacy

- No sensitive user data stored
- Session data in memory only
- Clear session on browser close

---

## Accessibility (a11y)

### WCAG 2.1 AA Compliance

- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus indicators
- Color contrast ratios ≥ 4.5:1
- Alt text for images
- Screen reader announcements for dynamic content

### Example

```typescript
<button
  aria-label="Add furniture to cart"
  onClick={handleAddToCart}
>
  <ShoppingCartIcon aria-hidden="true" />
  Add to Cart
</button>
```

---

## Monitoring & Analytics

### Error Tracking (Demo)

```typescript
console.error('Error:', error);
```

### Analytics Events (Demo)

```typescript
const trackEvent = (eventName: string, properties: object) => {
  console.log('Analytics:', eventName, properties);
};

// Usage
trackEvent('furniture_placed', { productId, roomType });
```

### Production Monitoring

- Sentry for error tracking
- Google Analytics for user behavior
- Performance monitoring with Web Vitals

---

## Future Enhancements

### Phase 2 Features
- User accounts and saved designs
- Collaborative design sharing
- Mobile responsive design
- Touch gestures for 3D navigation

### Phase 3 Features
- AR view (mobile)
- VR support (WebXR)
- Real-time collaboration
- Advanced lighting simulation

---

## Dependencies

### Core Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "@reduxjs/toolkit": "^2.0.0",
  "react-redux": "^9.0.0",
  "@mui/material": "^5.15.0",
  "@emotion/react": "^11.11.0",
  "@emotion/styled": "^11.11.0",
  "three": "^0.160.0",
  "@react-three/fiber": "^8.15.0",
  "@react-three/drei": "^9.92.0",
  "konva": "^9.3.0",
  "react-konva": "^18.2.0",
  "axios": "^1.6.0",
  "react-hook-form": "^7.49.0",
  "zod": "^3.22.0",
  "i18next": "^23.7.0",
  "react-i18next": "^14.0.0"
}
```

### Dev Dependencies

```json
{
  "typescript": "^5.3.0",
  "vite": "^5.0.0",
  "@vitejs/plugin-react": "^4.2.0",
  "vitest": "^1.1.0",
  "@testing-library/react": "^14.1.0",
  "@testing-library/user-event": "^14.5.0",
  "eslint": "^8.56.0",
  "prettier": "^3.1.0"
}
```

---

## Project Structure

```
/src
  /assets          # Images, fonts, icons
  /components      # Reusable UI components
    /common        # Button, Input, Modal, etc.
    /features      # RoomConfigPanel, ChatPanel, etc.
  /pages           # Page components
  /store           # Redux store and slices
  /services        # API services (RTK Query)
  /hooks           # Custom React hooks
  /utils           # Utility functions
  /types           # TypeScript type definitions
  /locales         # i18n translation files
  /constants       # App constants
  App.tsx          # Root component
  main.tsx         # Entry point
  router.tsx       # Route configuration
```

---

## Summary

The Frontend Application is built with modern React best practices, providing a responsive and intuitive user interface for furniture planning. It leverages Redux for state management, RTK Query for API integration, and Three.js/Konva for rich 2D/3D visualizations. The architecture is modular, testable, and ready for both demo and production deployment.
