# Room Planner System Implementation Plan

## Project Overview
Implement a highly scalable, event-driven furniture room planner system based on Domain Driven Design principles. The system consists of two main units:
- **Unit 1**: Frontend Application (React + TypeScript)
- **Unit 2**: AI Service (Node.js + TypeScript)

**Note**: Unit 3 (Product Service) is not included in this implementation as we focus on the room planner system with local product configuration.

---

## Prerequisites & Clarifications

### [Question] 1. Implementation Scope
Which unit(s) should I implement first, or should I implement both in parallel?
- Option A: Implement Unit 2 (AI Service) first, then Unit 1 (Frontend)
- Option B: Implement both units in parallel
- Option C: Implement Unit 1 (Frontend) first with mock AI responses

[Answer]: 

### [Question] 2. External API Keys
Do you have API keys for the external services, or should I use placeholder/mock implementations?
- OpenAI API Key (for GPT-4 and GPT-4V)
- Replicate API Token (for Stable Diffusion XL)

[Answer]: 

### [Question] 3. Product Catalog
Should I use the existing `product/products.yaml` file for the product catalog, or create a simplified version?

[Answer]: 

### [Question] 4. Image Processing Features
Which image processing features should be prioritized?
- [ ] Furniture detection in images (requires GPT-4V)
- [ ] Furniture replacement (requires Replicate)
- [ ] Furniture placement in empty rooms (requires Replicate)
- [ ] Basic image upload only

[Answer]: 

### [Question] 5. 3D Visualization
Should I implement full 3D visualization with Three.js, or start with 2D canvas only?
- Option A: Both 2D and 3D
- Option B: 2D only (simpler, faster)
- Option C: 3D only

[Answer]: 

---

## Implementation Steps

### Phase 1: Project Setup & Infrastructure

#### Unit 2: AI Service Setup
- [x] 1.1 Initialize Node.js/TypeScript project structure
  - [x] Create directory: `construction/unit_2_ai_service/src/`
  - [x] Setup package.json with dependencies
  - [x] Configure TypeScript (tsconfig.json)
  - [x] Setup ESLint and Prettier
  - [x] Create basic folder structure

- [x] 1.2 Setup environment configuration
  - [x] Create .env.example file
  - [x] Setup dotenv configuration
  - [x] Add environment variable validation

- [x] 1.3 Setup Express server
  - [x] Create Express app with basic middleware
  - [x] Add CORS configuration
  - [x] Add error handling middleware
  - [x] Add request logging
  - [x] Create health check endpoint

#### Unit 1: Frontend Setup
- [ ] 1.4 Initialize React/TypeScript project with Vite
  - [ ] Create directory: `construction/unit_1_frontend_application/src/`
  - [ ] Setup package.json with dependencies
  - [ ] Configure TypeScript
  - [ ] Setup ESLint and Prettier
  - [ ] Create basic folder structure

- [ ] 1.5 Setup Redux store
  - [ ] Configure Redux Toolkit
  - [ ] Setup RTK Query for API calls
  - [ ] Create store configuration

---

### Phase 2: Domain Models & Types

#### Unit 2: AI Service Domain
- [x] 2.1 Create domain types
  - [x] `src/models/types.ts`: Core domain types (RoomType, Dimensions, Product, etc.)
  - [x] `src/models/schemas.ts`: Zod validation schemas

- [x] 2.2 Create value objects
  - [x] Money, Position3D, RoomDimensions
  - [x] Validation logic for value objects

#### Unit 1: Frontend Domain
- [ ] 2.3 Create domain types
  - [ ] `src/types/domain.ts`: Core domain types matching backend
  - [ ] `src/types/api.ts`: API request/response types

- [ ] 2.4 Create Redux state types
  - [ ] SessionState, DesignState, CartState, UIState
  - [ ] Value objects and entities

---

### Phase 3: Infrastructure Layer

#### Unit 2: AI Service Infrastructure
- [x] 3.1 Implement Product Service Client (Local Configuration)
  - [x] `src/clients/ProductServiceClient.ts`
  - [x] Load products from YAML file
  - [x] Parse and transform product data
  - [x] Implement search and filter methods
  - [x] Add caching for performance

- [ ] 3.2 Implement Image Storage Service (Local)
  - [ ] `src/services/ImageStorageService.ts`
  - [ ] Setup local uploads directory
  - [ ] Implement image upload with Sharp optimization
  - [ ] Implement image retrieval and deletion
  - [ ] Add image metadata extraction

- [ ] 3.3 Implement OpenAI Client (if API key available)
  - [ ] `src/clients/OpenAIClient.ts`
  - [ ] Chat completion method
  - [ ] Vision API method
  - [ ] Error handling and retry logic
  - [ ] OR: Create mock implementation if no API key

- [ ] 3.4 Implement Replicate Client (if API token available)
  - [ ] `src/clients/ReplicateClient.ts`
  - [ ] Inpainting method
  - [ ] Image-to-image method
  - [ ] Text-to-image method
  - [ ] OR: Create mock implementation if no API token

---

### Phase 4: Application Services

#### Unit 2: AI Service Application Layer
- [x] 4.1 Implement Recommendation Service
  - [x] `src/services/RecommendationService.ts`
  - [x] Generate recommendations using AI or rule-based logic
  - [x] Load products from local configuration
  - [x] Apply budget constraints
  - [x] Optimize furniture placement
  - [x] Calculate positions and rotations

- [x] 4.2 Implement Chat Service
  - [x] `src/services/ChatService.ts`
  - [x] Process chat messages
  - [x] Build conversation context
  - [x] Parse design actions from responses
  - [x] Support multi-language (EN/ZH)

- [ ] 4.3 Implement Image Service
  - [ ] `src/services/ImageService.ts`
  - [ ] Detect furniture in images
  - [ ] Determine if room is empty
  - [ ] Apply furniture replacements
  - [ ] Place furniture in empty rooms

---

### Phase 5: API Controllers & Routes

#### Unit 2: AI Service API Layer
- [x] 5.1 Implement Recommendation Controller
  - [x] `src/controllers/recommendationController.ts`
  - [x] POST /api/ai/recommend endpoint
  - [x] Request validation
  - [x] Response formatting

- [x] 5.2 Implement Chat Controller
  - [x] `src/controllers/chatController.ts`
  - [x] POST /api/ai/chat endpoint
  - [x] Request validation
  - [x] Response formatting

- [ ] 5.3 Implement Image Controller
  - [ ] `src/controllers/imageController.ts`
  - [ ] POST /api/ai/detect endpoint
  - [ ] POST /api/ai/replace endpoint
  - [ ] POST /api/ai/place endpoint

- [ ] 5.4 Implement Upload Controller
  - [ ] `src/controllers/uploadController.ts`
  - [ ] POST /api/upload endpoint
  - [ ] Multer configuration
  - [ ] File validation

- [x] 5.5 Implement Product Controller
  - [x] `src/controllers/productController.ts`
  - [x] GET /api/ai/products/search endpoint
  - [x] GET /api/ai/products/categories endpoint
  - [x] GET /api/ai/products/:id endpoint

- [x] 5.6 Setup routes
  - [x] `src/routes/index.ts`: Main router
  - [x] `src/routes/aiRoutes.ts`: AI endpoints
  - [x] `src/routes/productRoutes.ts`: Product endpoints
  - [x] Apply middleware (validation, rate limiting)

---

### Phase 6: Frontend State Management

#### Unit 1: Frontend Redux Implementation
- [ ] 6.1 Implement Session Slice
  - [ ] `src/store/slices/sessionSlice.ts`
  - [ ] Actions: startSession, configureRoom, updatePreferences, etc.
  - [ ] Thunks: requestRecommendations, sendChatMessage
  - [ ] State management for planning session

- [ ] 6.2 Implement Design Slice
  - [ ] `src/store/slices/designSlice.ts`
  - [ ] Actions: placeFurniture, moveFurniture, rotateFurniture, etc.
  - [ ] Thunks: uploadRoomImage, detectFurniture, etc.
  - [ ] State management for room design

- [ ] 6.3 Implement Cart Slice
  - [ ] `src/store/slices/cartSlice.ts`
  - [ ] Actions: addItem, removeItem, updateQuantity, clearCart
  - [ ] Thunks: addAllFromDesign, validateStock
  - [ ] State management for shopping cart

- [ ] 6.4 Implement UI Slice
  - [ ] `src/store/slices/uiSlice.ts`
  - [ ] Actions: setActivePanel, setLoading, setError, addNotification
  - [ ] State management for UI state

- [ ] 6.5 Setup RTK Query API
  - [ ] `src/services/aiApi.ts`
  - [ ] Define all API endpoints
  - [ ] Export hooks for components

---

### Phase 7: Frontend Services & Utilities

#### Unit 1: Frontend Domain Services
- [ ] 7.1 Implement Collision Detection Service
  - [ ] `src/services/CollisionDetectionService.ts`
  - [ ] Check furniture collisions
  - [ ] Validate placement within room bounds
  - [ ] Calculate bounding boxes

- [ ] 7.2 Implement Budget Validation Service
  - [ ] `src/services/BudgetValidationService.ts`
  - [ ] Validate budget constraints
  - [ ] Calculate total prices
  - [ ] Suggest budget adjustments

- [ ] 7.3 Implement Room Configuration Service
  - [ ] `src/services/RoomConfigurationService.ts`
  - [ ] Validate room dimensions
  - [ ] Get room templates
  - [ ] Convert dimension units

- [ ] 7.4 Implement Image Processing Service
  - [ ] `src/services/ImageProcessingService.ts`
  - [ ] Validate uploaded images
  - [ ] Prepare images for upload
  - [ ] Apply watermarks (optional)

- [ ] 7.5 Implement Storage Service
  - [ ] `src/services/StorageService.ts`
  - [ ] LocalStorage utilities
  - [ ] SessionStorage utilities
  - [ ] Save/load user settings, cart, designs

---

### Phase 8: Frontend Components

#### Unit 1: Core Components
- [ ] 8.1 Create Layout Components
  - [ ] `src/components/layouts/RootLayout.tsx`
  - [ ] `src/components/layouts/PlannerLayout.tsx`
  - [ ] Navigation and header

- [ ] 8.2 Create Page Components
  - [ ] `src/pages/HomePage.tsx`
  - [ ] `src/pages/PlannerPage.tsx`
  - [ ] `src/pages/DesignViewPage.tsx`
  - [ ] `src/pages/NotFoundPage.tsx`

- [ ] 8.3 Create Feature Components - Room Configuration
  - [ ] `src/components/features/RoomConfigPanel.tsx`
  - [ ] Room type selector
  - [ ] Dimension inputs
  - [ ] Unit toggle
  - [ ] Template selector

- [ ] 8.4 Create Feature Components - Preferences
  - [ ] `src/components/features/PreferencesPanel.tsx`
  - [ ] Budget input
  - [ ] Category multi-select
  - [ ] Collection multi-select
  - [ ] Product search and select

- [ ] 8.5 Create Feature Components - Visualization
  - [ ] `src/components/features/VisualizationCanvas.tsx`
  - [ ] 2D canvas with Konva (if selected)
  - [ ] 3D scene with Three.js (if selected)
  - [ ] Furniture drag-and-drop
  - [ ] Camera controls

- [ ] 8.6 Create Feature Components - Furniture List
  - [ ] `src/components/features/FurnitureList.tsx`
  - [ ] List of placed furniture
  - [ ] Product thumbnails
  - [ ] Remove and add-to-cart actions

- [ ] 8.7 Create Feature Components - Chat
  - [ ] `src/components/features/ChatPanel.tsx`
  - [ ] Message history display
  - [ ] Text input
  - [ ] Language toggle
  - [ ] Loading indicator

- [ ] 8.8 Create Feature Components - Shopping Cart
  - [ ] `src/components/features/ShoppingCart.tsx`
  - [ ] Cart item list
  - [ ] Quantity controls
  - [ ] Total price calculation
  - [ ] Checkout button

- [ ] 8.9 Create Common Components
  - [ ] `src/components/common/Button.tsx`
  - [ ] `src/components/common/Input.tsx`
  - [ ] `src/components/common/Select.tsx`
  - [ ] `src/components/common/Modal.tsx`
  - [ ] `src/components/common/Notification.tsx`
  - [ ] `src/components/common/Loading.tsx`

---

### Phase 9: Routing & Navigation

#### Unit 1: Frontend Routing
- [ ] 9.1 Setup React Router
  - [ ] `src/router.tsx`
  - [ ] Define routes
  - [ ] Setup lazy loading for pages

- [ ] 9.2 Implement Navigation
  - [ ] Navigation component
  - [ ] Route guards (if needed)
  - [ ] 404 handling

---

### Phase 10: Integration & Testing

#### Backend Testing
- [x] 10.1 Create demo script for AI Service
  - [x] `construction/unit_2_ai_service/demo.ts`
  - [x] Test recommendation endpoint
  - [x] Test chat endpoint
  - [x] Test product search endpoint
  - [x] Test image upload endpoint
  - [x] Test detection/replacement/placement endpoints (if implemented)

- [ ] 10.2 Manual API testing
  - [ ] Test all endpoints with Postman/Thunder Client
  - [ ] Verify error handling
  - [ ] Verify validation

#### Frontend Testing
- [ ] 10.3 Create demo script for Frontend
  - [ ] `construction/unit_1_frontend_application/demo.md`
  - [ ] Document how to run the application
  - [ ] Document key features to test
  - [ ] Document expected behaviors

- [ ] 10.4 Integration testing
  - [ ] Test frontend-backend integration
  - [ ] Test complete user flows
  - [ ] Test error scenarios

---

### Phase 11: Documentation & Finalization

- [x] 11.1 Create README files
  - [x] `construction/unit_2_ai_service/README.md`
  - [ ] `construction/unit_1_frontend_application/README.md`
  - [x] Installation instructions
  - [x] Configuration guide
  - [x] API documentation

- [x] 11.2 Create demo documentation
  - [x] How to run the demo
  - [x] Sample test scenarios
  - [x] Expected outputs
  - [x] Troubleshooting guide

- [x] 11.3 Code cleanup
  - [x] Remove unused code
  - [x] Add comments where needed
  - [x] Format code consistently
  - [x] Update type definitions

---

## Implementation Notes

### Simplified Approach
- Use **in-memory storage** for all repositories (no database)
- Use **mock AI responses** if API keys are not available
- Focus on **core functionality** over advanced features
- Prioritize **working demo** over production-ready code

### File Organization
```
construction/
├── unit_1_frontend_application/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── README.md
│   └── demo.md
├── unit_2_ai_service/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── clients/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── index.ts
│   ├── config/
│   │   └── products.yaml
│   ├── uploads/
│   ├── package.json
│   ├── tsconfig.json
│   ├── README.md
│   └── demo.ts
```

---

## Success Criteria

- [ ] AI Service runs locally and responds to all API endpoints
- [ ] Frontend application runs locally and displays UI
- [ ] User can configure a room (type, dimensions)
- [ ] User can set preferences (budget, categories)
- [ ] User can request AI recommendations
- [ ] User can view furniture in 2D/3D visualization
- [ ] User can interact with chat (if implemented)
- [ ] User can add furniture to cart
- [ ] Demo scripts work and demonstrate key features
- [ ] Code is clean, well-organized, and documented

---

## Timeline Estimate

- Phase 1-2: Project Setup & Domain Models (2-3 hours)
- Phase 3-4: Infrastructure & Services (4-5 hours)
- Phase 5: API Controllers (2-3 hours)
- Phase 6-7: Frontend State & Services (3-4 hours)
- Phase 8-9: Frontend Components & Routing (5-6 hours)
- Phase 10-11: Testing & Documentation (2-3 hours)

**Total Estimated Time**: 18-24 hours

---

## Next Steps

1. Please answer the questions in the "Prerequisites & Clarifications" section
2. Review and approve this plan
3. I will proceed with implementation step by step
4. I will mark checkboxes as each step is completed
