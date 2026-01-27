# Architecture Decision Records (ADR)

## Overview

This document records the key architectural and design decisions made for the Castlery Furniture Planner project. Each decision includes the context, options considered, decision made, and consequences.

**Project**: Castlery Furniture Planner  
**Last Updated**: 2026-01-26

---

## Table of Contents

1. [ADR-001: Domain-Driven Design for Frontend Architecture](#adr-001-domain-driven-design-for-frontend-architecture)
2. [ADR-002: Aggregate Boundaries and Relationships](#adr-002-aggregate-boundaries-and-relationships)
3. [ADR-003: Value Objects vs Entities](#adr-003-value-objects-vs-entities)
4. [ADR-004: Storage Strategy for Frontend State](#adr-004-storage-strategy-for-frontend-state)
5. [ADR-005: Anti-Corruption Layer for External Services](#adr-005-anti-corruption-layer-for-external-services)
6. [ADR-006: Event-Driven Architecture for Domain Events](#adr-006-event-driven-architecture-for-domain-events)
7. [ADR-007: Empty Room vs Furnished Room Handling](#adr-007-empty-room-vs-furnished-room-handling)
8. [ADR-008: Budget Validation Strategy](#adr-008-budget-validation-strategy)
9. [ADR-009: Multi-Language Support Approach](#adr-009-multi-language-support-approach)
10. [ADR-010: Collision Detection Implementation](#adr-010-collision-detection-implementation)

---

## ADR-001: Domain-Driven Design for Frontend Architecture

**Status**: Accepted  
**Date**: 2026-01-26  
**Deciders**: Development Team

### Context

The Castlery Furniture Planner is a complex application with multiple workflows (room configuration, AI recommendations, furniture placement, visualization, shopping cart). We need to decide on an architectural approach that can handle this complexity while remaining maintainable.

### Decision Drivers

- Complex business logic (furniture placement, collision detection, budget validation)
- Multiple user workflows with different states
- Need for clear separation of concerns
- Future extensibility (new room types, features)
- Team understanding and maintainability

### Options Considered

1. **Traditional MVC/MVVM Pattern**
   - Pros: Familiar, simple for small apps
   - Cons: Business logic tends to leak into controllers/view models, hard to maintain as complexity grows

2. **Domain-Driven Design (DDD)**
   - Pros: Clear business logic encapsulation, rich domain model, scalable
   - Cons: Higher initial complexity, learning curve

3. **Transaction Script Pattern**
   - Pros: Simple, straightforward
   - Cons: Doesn't scale well with complexity, logic duplication

### Decision

We will use **Domain-Driven Design (DDD)** for the frontend architecture.

### Rationale

- The application has rich business logic that benefits from domain modeling
- Clear aggregate boundaries help manage complexity
- Value objects provide type safety and encapsulate business rules
- Domain events enable loose coupling between features
- Better alignment with backend architecture (if using DDD)

### Consequences

**Positive:**
- Clear separation between domain logic and infrastructure
- Business rules are explicit and testable
- Easier to reason about complex workflows
- Better code organization and maintainability

**Negative:**
- Higher initial development time
- Team needs to understand DDD concepts
- More boilerplate code compared to simple patterns

**Mitigation:**
- Provide DDD training and documentation
- Create clear examples and templates
- Use TypeScript for type safety

---

## ADR-002: Aggregate Boundaries and Relationships

**Status**: Accepted  
**Date**: 2026-01-26  
**Deciders**: Development Team

### Context

We need to define clear boundaries for our aggregates to ensure consistency and manage complexity. The main entities are PlanningSession, RoomDesign, and ShoppingCart.

### Decision Drivers

- Transaction boundaries
- Consistency requirements
- Performance (loading and saving)
- Concurrent access patterns

### Options Considered

1. **Single Large Aggregate**
   - Everything in one PlanningSession aggregate
   - Pros: Simple, all data together
   - Cons: Large object graph, performance issues, concurrency conflicts

2. **Three Separate Aggregates**
   - PlanningSession, RoomDesign, ShoppingCart as separate aggregates
   - Pros: Clear boundaries, independent transactions, better performance
   - Cons: Need to manage references between aggregates

3. **Two Aggregates**
   - Combine PlanningSession and RoomDesign
   - Pros: Simpler than three, related data together
   - Cons: Still large, design can be shared/reused independently

### Decision

We will use **three separate aggregates**: PlanningSession, RoomDesign, and ShoppingCart, with ID references between them.

### Rationale

- **PlanningSession**: Manages session lifecycle, preferences, chat history
- **RoomDesign**: Manages room configuration and furniture placements
- **ShoppingCart**: Manages cart items independently

Each aggregate has clear responsibilities and can be modified independently.

### Consequences

**Positive:**
- Clear transaction boundaries
- Better performance (load only what's needed)
- Reduced concurrency conflicts
- Design can be saved/shared independently of session

**Negative:**
- Need to manage references (IDs) between aggregates
- Slightly more complex to load related data

**Implementation:**
```typescript
class PlanningSession {
  roomDesignId: string  // ID reference, not object
}

class ShoppingCart {
  sessionId: string  // ID reference
}
```

---

## ADR-003: Value Objects vs Entities

**Status**: Accepted  
**Date**: 2026-01-26  
**Deciders**: Development Team

### Context

We need to decide which domain concepts should be entities (with identity) and which should be value objects (immutable, no identity).

### Decision

**Value Objects:**
- UserPreferences (embedded in PlanningSession)
- UserSettings
- Money
- RoomDimensions
- FurnitureDimensions
- Position3D, Position2D
- ViewState, CameraAngle
- ChatMessage
- All enums (RoomType, SessionStatus, etc.)

**Entities:**
- FurniturePlacement (within RoomDesign)
- CartItem (within ShoppingCart)
- RoomImage (within RoomDesign)

### Rationale

**UserPreferences as Value Object:**
- No independent lifecycle (always part of session)
- No need to track identity
- Immutability prevents accidental modifications
- Simpler to reason about

**Money, Dimensions, Positions as Value Objects:**
- Represent measurements/values, not things
- Immutability ensures correctness
- Can be freely copied and compared

**FurniturePlacement as Entity:**
- Needs identity to track specific placement
- Can be moved, rotated (mutable operations)
- Referenced by events and operations

### Consequences

**Positive:**
- Type safety through value objects
- Immutability prevents bugs
- Clear distinction between things (entities) and values
- Easier to test and reason about

**Negative:**
- More classes to manage
- Need to create new instances for "updates" to value objects

---

## ADR-004: Storage Strategy for Frontend State

**Status**: Accepted  
**Date**: 2026-01-26  
**Deciders**: Development Team

### Context

We need to decide how to persist frontend state across browser sessions and tabs.

### Decision

**Storage Strategy:**

| Data Type | Storage | Reason |
|-----------|---------|--------|
| Current Session | sessionStorage | Temporary, cleared on tab close |
| User Settings | localStorage | Persist unit preference, language |
| Saved Designs | localStorage | Persist across browser sessions |
| Shopping Cart | localStorage | Persist across sessions |
| Shareable Links | Backend API | Cross-device access |
| Room Images | Temporary/Backend | Original: temporary, Processed: backend |

### Rationale

- **sessionStorage** for temporary session data prevents clutter
- **localStorage** for user preferences improves UX
- **Backend API** for shareable links enables cross-device sharing
- Hybrid approach balances offline capability with data persistence

### Consequences

**Positive:**
- Works offline for most features
- User preferences persist
- Shareable links work across devices
- No login required for basic functionality

**Negative:**
- localStorage has size limits (~5-10MB)
- Need to handle storage quota exceeded errors
- Data not synced across devices (except shareable links)

**Implementation Notes:**
- Implement storage quota monitoring
- Provide clear error messages when storage is full
- Consider compression for large designs

---

## ADR-005: Anti-Corruption Layer for External Services

**Status**: Accepted  
**Date**: 2026-01-26  
**Deciders**: Development Team

### Context

The frontend needs to integrate with external services (Product Service, AI Service, Castlery Website Cart). We need to protect our domain model from external API changes.

### Decision

Implement **Anti-Corruption Layer (ACL)** using adapter pattern for all external services:
- ProductServiceAdapter
- AIServiceAdapter
- CastleryCartAdapter

### Rationale

- External APIs may change independently
- Domain model should not depend on external data structures
- Easier to mock for testing
- Can switch implementations without affecting domain

### Consequences

**Positive:**
- Domain model remains clean and focused
- External API changes isolated to adapters
- Easier to test domain logic
- Can add caching, retry logic in adapters

**Negative:**
- Additional layer of abstraction
- More code to maintain
- Mapping between DTOs and domain objects

**Implementation:**
```typescript
class ProductServiceAdapter {
  toFurniturePlacement(productDTO: ProductDTO): FurniturePlacement {
    // Transform external DTO to domain entity
  }
}
```

---

## ADR-006: Event-Driven Architecture for Domain Events

**Status**: Accepted  
**Date**: 2026-01-26  
**Deciders**: Development Team

### Context

We need a way to communicate between different parts of the application without tight coupling.

### Decision

Use **Domain Events** with an event bus for cross-cutting concerns:
- Analytics tracking
- UI updates
- State synchronization
- Audit logging

### Rationale

- Loose coupling between components
- Easy to add new event handlers
- Clear audit trail of user actions
- Supports event sourcing if needed in future

### Consequences

**Positive:**
- Decoupled components
- Easy to add analytics, logging
- Clear history of what happened
- Supports undo/redo functionality

**Negative:**
- Harder to trace execution flow
- Need to manage event ordering
- Potential for event storms

**Implementation:**
```typescript
// Publish event
eventBus.publish(new FurniturePlaced(designId, placement));

// Subscribe to event
eventBus.on('FurniturePlaced', (event) => {
  analytics.track('furniture_placed', event);
});
```

---

## ADR-007: Empty Room vs Furnished Room Handling

**Status**: Accepted  
**Date**: 2026-01-26  
**Deciders**: Development Team

### Context

Users can upload room photos that are either empty or contain existing furniture. These require different workflows.

### Decision

Use a **single RoomImage entity** with an `isEmpty` flag to handle both cases:
- `isEmpty = false`: Furniture detection → Replacement workflow
- `isEmpty = true`: Direct placement workflow

### Rationale

- Single entity simplifies the model
- Flag clearly indicates the mode
- Can share common image processing logic
- Easier to switch between modes if needed

### Consequences

**Positive:**
- Simpler domain model
- Shared image processing infrastructure
- Clear distinction in business logic

**Negative:**
- Need to validate operations based on isEmpty flag
- Some properties only relevant for one mode

**Implementation:**
```typescript
class RoomImage {
  isEmpty: boolean;
  detectedFurniture: DetectedFurnitureItem[];  // Only for furnished rooms
  appliedPlacements: ImageFurniturePlacement[];  // Only for empty rooms
}
```

---

## ADR-008: Budget Validation Strategy

**Status**: Accepted  
**Date**: 2026-01-26  
**Deciders**: Development Team

### Context

Users can set a budget, and we need to validate that furniture selections don't exceed it. The question is when and how to validate.

### Decision

Use a **dedicated BudgetValidationService** with multiple validation points:
1. **Before AI recommendations**: Ensure recommendations fit budget
2. **After user adds furniture**: Check if total exceeds budget
3. **Before adding to cart**: Final validation

Emit `BudgetExceeded` event when budget is exceeded, but allow user to proceed with warning.

### Rationale

- Soft validation (warning, not blocking) provides better UX
- Multiple validation points catch issues early
- Dedicated service encapsulates budget logic
- Event allows UI to show warnings

### Consequences

**Positive:**
- Flexible UX (users can exceed budget if they choose)
- Clear feedback when budget is exceeded
- Centralized budget logic

**Negative:**
- Need to handle budget exceeded state in UI
- Users might ignore warnings

**Implementation:**
```typescript
class BudgetValidationService {
  validateBudget(budget: Budget, selections: FurniturePlacement[]): ValidationResult {
    const total = this.calculateTotal(selections);
    if (budget.isExceededBy(total)) {
      return {
        isValid: false,
        exceededAmount: budget.getExceededAmount(total)
      };
    }
    return { isValid: true };
  }
}
```

---

## ADR-009: Multi-Language Support Approach

**Status**: Accepted  
**Date**: 2026-01-26  
**Deciders**: Development Team

### Context

The application needs to support multiple languages (English, Chinese, etc.) for both UI and AI chat interactions.

### Decision

Store language preference in **UserSettings** value object and pass to all relevant services:
- UI translations handled by i18n library
- AI chat requests include language parameter
- Language persists in localStorage

### Rationale

- Language is a user setting, not session-specific
- Consistent language across all features
- AI can respond in user's preferred language

### Consequences

**Positive:**
- Consistent language experience
- Easy to add new languages
- Language preference persists

**Negative:**
- Need to translate all UI strings
- AI service must support multiple languages
- More complex chat request formatting

**Implementation:**
```typescript
class UserSettings {
  language: string;  // 'en', 'zh', etc.
}

class ChatService {
  sendMessage(session: PlanningSession, message: string) {
    const request = {
      message,
      language: session.userSettings.language,
      conversationHistory: session.chatHistory
    };
    // Send to AI service
  }
}
```

---

## ADR-010: Collision Detection Implementation

**Status**: Accepted  
**Date**: 2026-01-26  
**Deciders**: Development Team

### Context

We need to prevent furniture from overlapping in the room design. This requires collision detection logic.

### Decision

Implement **CollisionDetectionService** as a domain service using 3D bounding box intersection:
- Calculate bounding box for each furniture placement
- Check for intersections when placing new furniture
- Emit `FurnitureCollisionDetected` event when collision occurs
- Block placement if collision detected

### Rationale

- Collision detection is domain logic (business rule)
- Doesn't belong to any single aggregate
- Domain service is appropriate for multi-aggregate operations
- Bounding box approach is simple and performant

### Consequences

**Positive:**
- Prevents invalid furniture arrangements
- Clear error feedback to users
- Reusable collision detection logic

**Negative:**
- Bounding box is approximate (not pixel-perfect)
- Performance impact for many furniture items
- Complex for rotated furniture

**Implementation:**
```typescript
class CollisionDetectionService {
  checkCollision(placement1: FurniturePlacement, placement2: FurniturePlacement): boolean {
    const box1 = this.calculateBoundingBox(placement1);
    const box2 = this.calculateBoundingBox(placement2);
    return this.boxesIntersect(box1, box2);
  }
  
  validatePlacement(design: RoomDesign, furniture: FurniturePlacement, position: Position3D): boolean {
    // Check against all existing placements
    for (const existing of design.furniturePlacements) {
      if (this.checkCollision(furniture, existing)) {
        return false;
      }
    }
    return true;
  }
}
```

**Future Improvements:**
- Use more accurate collision detection (polygon intersection)
- Optimize with spatial indexing for many items
- Visual feedback showing collision areas

---

## Decision Log

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| 001 | Domain-Driven Design for Frontend Architecture | Accepted | 2026-01-26 |
| 002 | Aggregate Boundaries and Relationships | Accepted | 2026-01-26 |
| 003 | Value Objects vs Entities | Accepted | 2026-01-26 |
| 004 | Storage Strategy for Frontend State | Accepted | 2026-01-26 |
| 005 | Anti-Corruption Layer for External Services | Accepted | 2026-01-26 |
| 006 | Event-Driven Architecture for Domain Events | Accepted | 2026-01-26 |
| 007 | Empty Room vs Furnished Room Handling | Accepted | 2026-01-26 |
| 008 | Budget Validation Strategy | Accepted | 2026-01-26 |
| 009 | Multi-Language Support Approach | Accepted | 2026-01-26 |
| 010 | Collision Detection Implementation | Accepted | 2026-01-26 |

---

## How to Use This Document

### Adding New ADRs

When making a significant architectural decision:

1. Create a new ADR section with the next number
2. Fill in all sections (Context, Decision Drivers, Options, Decision, Consequences)
3. Update the Decision Log table
4. Get team review and approval
5. Update status to "Accepted" or "Rejected"

### ADR Template

```markdown
## ADR-XXX: [Title]

**Status**: Proposed | Accepted | Rejected | Superseded  
**Date**: YYYY-MM-DD  
**Deciders**: [Names]

### Context
[What is the issue we're facing?]

### Decision Drivers
[What factors influence this decision?]

### Options Considered
1. **Option 1**
   - Pros: ...
   - Cons: ...

### Decision
[What did we decide?]

### Rationale
[Why did we make this decision?]

### Consequences
**Positive:**
- ...

**Negative:**
- ...

**Mitigation:**
- ...
```

---

## References

- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Implementing Domain-Driven Design by Vaughn Vernon](https://vaughnvernon.com/)
- [ADR GitHub Organization](https://adr.github.io/)
- [User Stories Document](../inception/user_stories.md)
- [Domain Model Document](../construction/unit_1_frontend_application/domain_model.md)
