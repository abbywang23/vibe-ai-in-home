# Castlery Furniture Planner - User Stories

## Overview
This document contains user stories for the Castlery Furniture Planner web application, enabling users to plan and visualize furniture arrangements with AI assistance.

**Data Source:** Castlery Test Database

---

## Epic 1: User Entry & Access

### US-1.1: Access Furniture Planner
**As a** user  
**I want to** access the furniture planner directly from the Castlery website  
**So that** I can start planning my room without any barriers

**Acceptance Criteria:**
- Furniture planner is accessible without login
- Clear entry point from the main Castlery website
- Works for both customers and showroom staff using the same interface

### US-1.2: Welcome & Onboarding
**As a** user  
**I want to** see a brief introduction to the furniture planner features  
**So that** I understand how to use the tool effectively

**Acceptance Criteria:**
- Display welcome message explaining the planner's capabilities
- Option to skip onboarding for returning users
- Clear call-to-action to start planning

---

## Epic 2: Room Preferences & Configuration

### US-2.1: Select Room Type
**As a** user  
**I want to** select the type of room I'm planning  
**So that** AI can provide relevant furniture suggestions

**Acceptance Criteria:**
- Support room types: Living Room, Bedroom, Dining Room, Home Office
- Visual icons/images for each room type
- Single selection allowed

### US-2.2: Choose Room Template
**As a** user  
**I want to** choose from preset room templates  
**So that** I can quickly start with a standard room layout

**Acceptance Criteria:**
- Provide preset templates for each room type
- Templates include common room shapes and sizes
- Preview thumbnail for each template

### US-2.3: Enter Custom Room Dimensions
**As a** user  
**I want to** enter custom room dimensions  
**So that** I can plan for my specific room size

**Acceptance Criteria:**
- Input fields for length, width, and height
- Support both Imperial (feet/inches) and Metric (meters/cm) units
- Unit toggle/selector clearly visible
- Validation for reasonable dimension ranges

### US-2.4: Switch Dimension Units
**As a** user  
**I want to** switch between Imperial and Metric units  
**So that** I can use my preferred measurement system

**Acceptance Criteria:**
- Toggle between feet/inches and meters/cm
- Automatic conversion when switching units
- Persist unit preference during session

### US-2.5: Upload Room Photo
**As a** user  
**I want to** upload a photo of my room  
**So that** I can use it for furniture visualization and replacement

**Acceptance Criteria:**
- Support JPEG and PNG image upload
- File size limit with clear messaging
- Image preview after upload
- Room dimensions from US-2.3 used for accurate furniture scaling

---

## Epic 3: AI Interaction & Product Recommendations

### US-3.1: Set Total Budget
**As a** user  
**I want to** specify my total budget for furniture  
**So that** AI suggests products within my price range

**Acceptance Criteria:**
- Input field for total budget amount
- Currency display based on user's region
- AI respects budget constraint in recommendations
- If recommendations exceed budget, AI auto-adjusts and notifies user of the exceeded amount

### US-3.2: Specify Product Preferences by Name
**As a** user  
**I want to** search and specify products by name  
**So that** I can include specific Castlery items I already like

**Acceptance Criteria:**
- Search functionality for product names
- Autocomplete suggestions from Castlery database
- Add multiple specific products to preferences

### US-3.3: Specify Product Preferences by Category
**As a** user  
**I want to** select furniture categories I'm interested in  
**So that** AI focuses on those types of furniture

**Acceptance Criteria:**
- Display available furniture categories (sofas, tables, chairs, beds, etc.)
- Multi-select capability
- Categories pulled from Castlery database

### US-3.4: Specify Product Preferences by Collection
**As a** user  
**I want to** select Castlery collections I prefer  
**So that** AI suggests cohesive furniture sets

**Acceptance Criteria:**
- Display available Castlery collections
- Collection preview images
- Multi-select capability

### US-3.5: Get AI-Generated Furniture Suggestions
**As a** user  
**I want to** receive AI-generated furniture suggestions based on my preferences  
**So that** I get a curated room design without manual selection

**Acceptance Criteria:**
- AI analyzes room type, dimensions, budget, and preferences
- Generates furniture grouping suggestions
- Displays suggested products with images and prices
- Products sourced from Castlery test database

### US-3.6: Chat with AI for Refinements
**As a** user  
**I want to** interact with AI through chat  
**So that** I can refine suggestions or ask questions

**Acceptance Criteria:**
- Chat interface for natural language interaction
- AI understands requests to change, add, or remove items
- Conversation history visible during session
- Multi-language support (English, Chinese, etc.)

---

## Epic 4: Room Image Upload & Furniture Replacement

### US-4.1: Upload Room Image
**As a** user  
**I want to** upload a photo of my actual room  
**So that** I can visualize Castlery furniture in my real space

**Acceptance Criteria:**
- Support JPEG and PNG formats
- File size limit with clear messaging
- Image preview after upload

### US-4.2: AI Furniture Detection
**As a** user  
**I want** AI to automatically detect existing furniture in my uploaded image  
**So that** I don't have to manually identify items to replace

**Acceptance Criteria:**
- AI identifies and highlights existing furniture pieces
- Labels detected furniture types (sofa, table, chair, etc.)
- Confidence indicator for detection accuracy

### US-4.3: View Replacement Suggestions
**As a** user  
**I want to** see Castlery furniture suggestions to replace detected items  
**So that** I can visualize upgrades for my room

**Acceptance Criteria:**
- AI suggests matching Castlery products for each detected item
- Suggestions consider style, size, and user preferences
- Multiple alternatives offered per detected item

### US-4.4: Apply Furniture Replacement
**As a** user  
**I want to** apply suggested replacements to my room image  
**So that** I can see how Castlery furniture looks in my actual space

**Acceptance Criteria:**
- One-click replacement application
- Realistic rendering of new furniture in the image
- Option to undo/revert changes

### US-4.5: Add Furniture to Empty Room
**As a** user  
**I want to** add Castlery furniture directly to an empty room photo  
**So that** I can visualize how furniture would look in my unfurnished space

**Acceptance Criteria:**
- AI detects when uploaded room image contains no existing furniture
- System automatically switches to "furniture placement" mode for empty rooms
- User can select and place furniture items from AI suggestions or catalog
- Furniture is rendered with appropriate scale and perspective in the empty room
- Multiple furniture pieces can be added and positioned within the room
- Option to adjust furniture placement and orientation

---

## Epic 5: Room Visualization

### US-5.1: View Room in 2D
**As a** user  
**I want to** view my room design in a 2D front view  
**So that** I can see the overall furniture layout

**Acceptance Criteria:**
- Clear 2D front view representation
- Furniture items shown with accurate proportions
- Labels for each furniture piece

### US-5.2: View Room in 3D
**As a** user  
**I want to** view my room design in 3D  
**So that** I can see a realistic representation of the space

**Acceptance Criteria:**
- 3D rendered view of the room with furniture
- Realistic textures and lighting
- Toggle button to switch between 2D and 3D views

### US-5.3: Rotate 3D View 360°
**As a** user  
**I want to** freely rotate the 3D view in any direction  
**So that** I can see the room from all angles

**Acceptance Criteria:**
- 360° horizontal rotation
- Vertical angle adjustment (tilt up/down)
- Smooth rotation with mouse drag or touch gestures
- Zoom in/out capability

### US-5.4: Toggle Dimension Display
**As a** user  
**I want to** toggle dimension labels on/off in the room view  
**So that** I can see exact measurements when needed

**Acceptance Criteria:**
- Button to turn dimensions on/off
- Display room dimensions (length, width, height)
- Display furniture dimensions
- Dimensions shown in user's selected unit (Imperial/Metric)

### US-5.5: View Different Room Angles
**As a** user  
**I want to** quickly switch between preset viewing angles  
**So that** I can efficiently review the design from key perspectives

**Acceptance Criteria:**
- Preset angle buttons (front, side, corner, top-down)
- Smooth transition between angles
- Works in both 2D and 3D modes

---

## Epic 6: Export & Sharing

### US-6.1: Export Room Design as Image
**As a** user  
**I want to** export my room design as an image (with Castlery watermark)  
**So that** I can save it locally or share via other channels

**Acceptance Criteria:**
- Export button clearly visible
- High-resolution image output
- Include room view with furniture
- Option to include/exclude dimension labels
- Castlery watermark automatically added to exported image

### US-6.2: Generate Shareable Link
**As a** user  
**I want to** generate a shareable link for my room design  
**So that** I can share it with family, friends, or designers

**Acceptance Criteria:**
- One-click link generation
- Link opens the same room design view
- Link remains valid permanently
- Copy to clipboard functionality

---

## Epic 7: Purchase Integration

### US-7.1: View Product Details
**As a** user  
**I want to** view details of any furniture item in my design  
**So that** I can learn more about the product

**Acceptance Criteria:**
- Click on furniture item to see details
- Display product name, description, dimensions
- Show product image from Castlery catalog
- Link to full product page on Castlery website

### US-7.2: View Product Pricing
**As a** user  
**I want to** see the price of each furniture item  
**So that** I can understand the cost breakdown

**Acceptance Criteria:**
- Display current price from Castlery database
- Show total cost of all items in design
- Price updates if items are changed

### US-7.3: Add Items to Cart
**As a** user  
**I want to** add furniture items directly to my shopping cart  
**So that** I can purchase them without leaving the planner

**Acceptance Criteria:**
- "Add to Cart" button for individual items
- "Add All to Cart" button for entire design
- Integration with Castlery website shopping cart
- Confirmation message after adding to cart
- Cart icon shows updated item count
- Display warning if product is out of stock when adding to cart

---

## Epic 8: Error Handling

### US-8.1: Image Upload Error Handling
**As a** user  
**I want to** receive clear error messages when image upload fails  
**So that** I understand what went wrong and how to fix it

**Acceptance Criteria:**
- Display user-friendly error message on upload failure
- Indicate possible causes (file too large, unsupported format, network issue)
- Provide guidance on how to resolve the issue
- Allow user to retry upload

### US-8.2: AI Service Unavailable Handling
**As a** user  
**I want to** be notified when AI services are temporarily unavailable  
**So that** I know the system status and can try again later

**Acceptance Criteria:**
- Display friendly message when AI service is unavailable
- Suggest user to try again later
- Provide alternative actions if available (e.g., browse products manually)

---

## Appendix: Data Requirements

### Castlery Test Database Integration
- Product catalog (names, descriptions, images)
- Product categories and collections
- Pricing information
- Stock/availability status
- Product dimensions
- Product relationships (matching sets, collections)
