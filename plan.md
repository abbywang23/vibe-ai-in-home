# Furniture Planner - Planning Document

## Phase 1: User Stories (Completed)
- [x] Created user stories in /inception/user_stories.md
- [x] Added US-4.5: Add Furniture to Empty Room functionality

## Phase 2: Unit Grouping & Integration Contract (Completed)
- [x] Created unit files in /inception/units/
- [x] Updated integration contract with new empty room placement API

---

## Phase 3: Domain Driven Design - Domain Model (Completed)

### Scope
Design DDD domain models for all 3 units:
- Unit 1: Frontend Application (Room Planning Context)
- Unit 2: AI Service (AI Recommendation Context)  
- Unit 3: Product Service (Product Catalog Context)

### Recent Updates for US-4.5

#### New Functionality Added:
- **Empty Room Detection**: AI automatically detects when uploaded room images contain no existing furniture
- **Furniture Placement Mode**: System switches to placement mode for empty rooms
- **Direct Furniture Addition**: Users can add and position furniture directly in empty room photos
- **Realistic Rendering**: Furniture is rendered with proper scale and perspective in empty rooms

#### Updated Components:

**Unit 1 (Frontend Application):**
- Added `isEmpty` flag to RoomImage entity
- Added `appliedPlacements` tracking for empty room furniture
- New domain events: `EmptyRoomDetected`, `FurniturePlacedInEmptyRoom`
- Updated AIServiceAdapter with placement result conversion

**Unit 2 (AI Service):**
- Enhanced ImageAnalysis aggregate for empty room detection
- New PlacementResult entity for tracking furniture placements
- Updated FurnitureReplacementService to handle both replacement and placement
- New domain events: `EmptyRoomDetected`, `PlacementRequested`, `PlacementRendered`
- Added `POST /api/ai/place` endpoint for empty room furniture placement

**Unit 3 (Product Service):**
- No changes required - existing product APIs support the new functionality

**Integration Contract:**
- Added `POST /api/ai/place` API specification
- Updated integration flow examples

### Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend Domain Model | Yes | 前端需要领域模型管理房间配置、可视化状态等 |
| AI Model Selection | External APIs | 推荐: OpenAI GPT-4V (图像理解), Stability AI (图像生成) |
| Product Service Architecture | Repository Pattern | Demo 用内存实现，生产环境可切换到真实数据库 |
| Empty Room Detection | AI-based | 使用 GPT-4V 自动检测空房间，无需用户手动选择模式 |
| Furniture Placement | Image Generation | 使用 Stability AI 在空房间中渲染家具，保持真实感 |

---

## Execution Plan

- [x] Step 1: Create `/construction/` directory structure
- [x] Step 2: Design Unit 1 (Frontend Application) Domain Model
- [x] Step 3: Design Unit 2 (AI Service) Domain Model
- [x] Step 4: Design Unit 3 (Product Service) Domain Model
- [x] Step 5: Review and finalize domain models
- [x] Step 6: Update all models for US-4.5 empty room functionality

---

---

## Phase 4: Logical Design for Event-Driven Architecture (In Progress)

### Scope
Create logical design documents for scalable, event-driven system architecture for all 3 units:
- Unit 1: Frontend Application
- Unit 2: AI Service
- Unit 3: Product Service

### Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Communication Pattern | REST APIs | Simple, stateless, easy to implement for demo |
| Frontend Framework | React | Modern, component-based, large ecosystem |
| Backend Language | Node.js/TypeScript | Unified language stack, async-friendly |
| Deployment | Monorepo with separate services | Easy local development, can split later |
| Database (Production) | PostgreSQL | Relational data, ACID compliance |
| Image Storage | Local filesystem (demo) / S3 (production) | Cost-effective, scalable |
| Caching | None (demo) / Redis (production) | Performance optimization for production |
| API Gateway | None (demo) / Optional (production) | Direct service calls for simplicity |
| API Security | API keys for external services | Simple authentication for demo |
| Monitoring | Console logs (demo) / CloudWatch (production) | Progressive enhancement |

---

## Execution Plan

- [x] Step 1: Create `/construction/` directory structure
- [x] Step 2: Design Unit 1 (Frontend Application) Domain Model
- [x] Step 3: Design Unit 2 (AI Service) Domain Model
- [x] Step 4: Design Unit 3 (Product Service) Domain Model
- [x] Step 5: Review and finalize domain models
- [x] Step 6: Update all models for US-4.5 empty room functionality
- [x] Step 7: Create logical design for Unit 1 (Frontend Application)
- [x] Step 8: Create logical design for Unit 2 (AI Service)
- [x] Step 9: Create logical design for Unit 3 (Product Service)
- [x] Step 10: Review and finalize logical designs

---

## Next Phase: Implementation

The domain models are complete. Logical design documents will define the technical architecture, component structure, and deployment strategy for each unit.
