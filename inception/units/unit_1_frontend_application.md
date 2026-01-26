# Unit 1: Frontend Application

## Overview
The main frontend application that provides the user interface for the Castlery Furniture Planner. This unit handles all user interactions, room configuration, visualization, export, and purchase demo features.

**Team Size:** 2-3 developers  
**Dependencies:** Unit 2 (AI Service), Unit 3 (Product Service)

---

## User Stories

### Entry & Onboarding

#### US-1.1: Access Furniture Planner
**As a** user  
**I want to** access the furniture planner directly from the Castlery website  
**So that** I can start planning my room without any barriers

**Acceptance Criteria:**
- Furniture planner is accessible without login
- Clear entry point from the main Castlery website
- Works for both customers and showroom staff using the same interface

#### US-1.2: Welcome & Onboarding
**As a** user  
**I want to** see a brief introduction to the furniture planner features  
**So that** I understand how to use the tool effectively

**Acceptance Criteria:**
- Display welcome message explaining the planner's capabilities
- Option to skip onboarding for returning users
- Clear call-to-action to start planning

---

### Room Configuration

#### US-2.1: Select Room Type
**As a** user  
**I want to** select the type of room I'm planning  
**So that** AI can provide relevant furniture suggestions

**Acceptance Criteria:**
- Support room types: Living Room, Bedroom, Dining Room, Home Office
- Visual icons/images for each room type
- Single selection allowed

#### US-2.2: Choose Room Template
**As a** user  
**I want to** choose from preset room templates  
**So that** I can quickly start with a standard room layout

**Acceptance Criteria:**
- Provide preset templates for each room type
- Templates include common room shapes and sizes
- Preview thumbnail for each template

#### US-2.3: Enter Custom Room Dimensions
**As a** user  
**I want to** enter custom room dimensions  
**So that** I can plan for my specific room size

**Acceptance Criteria:**
- Input fields for length, width, and height
- Support both Imperial (feet/inches) and Metric (meters/cm) units
- Unit toggle/selector clearly visible
- Validation for reasonable dimension ranges

#### US-2.4: Switch Dimension Units
**As a** user  
**I want to** switch between Imperial and Metric units  
**So that** I can use my preferred measurement system

**Acceptance Criteria:**
- Toggle between feet/inches and meters/cm
- Automatic conversion when switching units
- Persist unit preference during session

#### US-2.5: Upload Room Photo
**As a** user  
**I want to** upload a photo of my room  
**So that** I can use it for furniture visualization and replacement

**Acceptance Criteria:**
- Support JPEG and PNG image upload
- File size limit with clear messaging
- Image preview after upload
- Room dimensions from US-2.3 used for accurate furniture scaling

---

### Room Visualization

#### US-5.1: View Room in 2D
**As a** user  
**I want to** view my room design in a 2D front view  
**So that** I can see the overall furniture layout

**Acceptance Criteria:**
- Clear 2D front view representation
- Furniture items shown with accurate proportions
- Labels for each furniture piece

#### US-5.2: View Room in 3D
**As a** user  
**I want to** view my room design in 3D  
**So that** I can see a realistic representation of the space

**Acceptance Criteria:**
- 3D rendered view of the room with furniture
- Realistic textures and lighting
- Toggle button to switch between 2D and 3D views

#### US-5.3: Rotate 3D View 360°
**As a** user  
**I want to** freely rotate the 3D view in any direction  
**So that** I can see the room from all angles

**Acceptance Criteria:**
- 360° horizontal rotation
- Vertical angle adjustment (tilt up/down)
- Smooth rotation with mouse drag or touch gestures
- Zoom in/out capability

#### US-5.4: Toggle Dimension Display
**As a** user  
**I want to** toggle dimension labels on/off in the room view  
**So that** I can see exact measurements when needed

**Acceptance Criteria:**
- Button to turn dimensions on/off
- Display room dimensions (length, width, height)
- Display furniture dimensions
- Dimensions shown in user's selected unit (Imperial/Metric)

#### US-5.5: View Different Room Angles
**As a** user  
**I want to** quickly switch between preset viewing angles  
**So that** I can efficiently review the design from key perspectives

**Acceptance Criteria:**
- Preset angle buttons (front, side, corner, top-down)
- Smooth transition between angles
- Works in both 2D and 3D modes

---

### Export & Sharing

#### US-6.1: Export Room Design as Image
**As a** user  
**I want to** export my room design as an image (with Castlery watermark)  
**So that** I can save it locally or share via other channels

**Acceptance Criteria:**
- Export button clearly visible
- High-resolution image output
- Include room view with furniture
- Option to include/exclude dimension labels
- Castlery watermark automatically added to exported image

#### US-6.2: Generate Shareable Link
**As a** user  
**I want to** generate a shareable link for my room design  
**So that** I can share it with family, friends, or designers

**Acceptance Criteria:**
- One-click link generation
- Link opens the same room design view
- Link remains valid permanently
- Copy to clipboard functionality

---

### Product Display & Purchase (Demo)

#### US-7.1: View Product Details
**As a** user  
**I want to** view details of any furniture item in my design  
**So that** I can learn more about the product

**Acceptance Criteria:**
- Click on furniture item to see details
- Display product name, description, dimensions
- Show product image from Castlery catalog
- Link to full product page on Castlery website

#### US-7.2: View Product Pricing
**As a** user  
**I want to** see the price of each furniture item  
**So that** I can understand the cost breakdown

**Acceptance Criteria:**
- Display current price from Castlery database
- Show total cost of all items in design
- Price updates if items are changed

#### US-7.3: Add Items to Cart (Demo)
**As a** user  
**I want to** add furniture items directly to my shopping cart  
**So that** I can purchase them without leaving the planner

**Acceptance Criteria:**
- "Add to Cart" button for individual items
- "Add All to Cart" button for entire design
- Mock cart integration for demo purposes
- Confirmation message after adding to cart
- Cart icon shows updated item count
- Display warning if product is out of stock when adding to cart

---

### Error Handling

#### US-8.1: Image Upload Error Handling
**As a** user  
**I want to** receive clear error messages when image upload fails  
**So that** I understand what went wrong and how to fix it

**Acceptance Criteria:**
- Display user-friendly error message on upload failure
- Indicate possible causes (file too large, unsupported format, network issue)
- Provide guidance on how to resolve the issue
- Allow user to retry upload

---

## API Dependencies

### From Unit 2 (AI Service)
- `POST /api/ai/recommend` - Get furniture recommendations
- `POST /api/ai/chat` - Chat with AI for refinements
- `POST /api/ai/detect` - Detect furniture in uploaded image
- `POST /api/ai/replace` - Apply furniture replacement
- `POST /api/ai/place` - Place furniture in empty room

### From Unit 3 (Product Service)
- `GET /api/products/search` - Search products by name
- `GET /api/products/categories` - Get product categories
- `GET /api/products/collections` - Get product collections
- `GET /api/products/{id}` - Get product details
- `GET /api/products/{id}/price` - Get product pricing
