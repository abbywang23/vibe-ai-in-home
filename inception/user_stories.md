# Castlery Furniture Planner - User Stories (Optimized)

## Overview
This document contains user stories organized following the optimized user flow. Stories are sequenced to reduce cognitive load and align with AI-driven capabilities.

**Data Source:** Castlery Test Database

---

## Epic 1: Landing & Introduction

### US-1.1: Access Furniture Planner
**As a** user  
**I want to** access the furniture planner directly from the Castlery website  
**So that** I can start planning my room without any barriers

**Why:** Reduce friction and allow immediate access  
**What:** User clicks "Furniture Planner" link

**Acceptance Criteria:**
- Accessible without login
- Clear entry point from main website
- Works for customers and showroom staff

### US-1.2: View Landing Page Introduction
**As a** user  
**I want to** see a clear introduction to the planner's capabilities  
**So that** I understand what the tool can do

**Why:** Build confidence and set expectations  
**What:** User reads introduction and clicks "Get Started"

**Acceptance Criteria:**
- Hero section with value proposition
- Key features displayed with visuals
- Clear "Get Started" CTA
- Option to skip for returning users

---

## Epic 2: Room Setup & Context

### US-2.1: Upload Room Photo (First Step)
**As a** user  
**I want to** upload a photo of my room as the first step  
**So that** AI can understand my space and provide contextual recommendations

**Why:** Establish visual context early; enables better AI recommendations  
**What:** User uploads room photo via drag-and-drop or file picker

**Acceptance Criteria:**
- Prominent upload area with drag-and-drop support
- Support JPEG/PNG formats (max 10MB)
- Image preview after upload
- Clear guidance on photo quality
- Progress indicator during upload

### US-2.2: Select Room Type
**As a** user  
**I want to** select the type of room I'm planning  
**So that** AI can provide relevant furniture suggestions

**Why:** Helps AI understand furniture requirements  
**What:** User selects room type from visual options

**Acceptance Criteria:**
- Room types: Living Room, Bedroom, Dining Room, Home Office
- Visual icons for each type
- AI may suggest type based on uploaded image
- Single selection required

### US-2.3: Enter Room Dimensions
**As a** user  
**I want to** enter my room dimensions  
**So that** AI can recommend appropriately sized furniture

**Why:** Ensures furniture fits the actual space  
**What:** User enters dimensions or confirms AI estimates

**Acceptance Criteria:**
- Input fields for length, width, height
- Support Imperial and Metric units
- Unit toggle clearly visible
- Validation for reasonable ranges
- Optional AI dimension estimation from photo
### US-2.4: Switch Dimension Units
**As a** user  
**I want to** switch between Imperial and Metric units  
**So that** I can use my preferred measurement system

**Why:** Accommodate users from different regions  
**What:** User toggles unit preference

**Acceptance Criteria:**
- Toggle between feet/inches and meters/cm
- Automatic conversion when switching
- Persist preference during session
- Real-time value updates

### US-2.5: Choose Furnishing Mode
**As a** user  
**I want to** choose between replacing existing furniture or furnishing an empty room  
**So that** the tool adapts to my specific needs

**Why:** Bifurcate user journey based on room state  
**What:** User selects furnishing mode

**Acceptance Criteria:**
- Two clear mode options:
  - "Replace Existing Furniture"
  - "Furnish Empty Room"
- Visual explanation of each mode
- AI may suggest mode based on image analysis
- Mode selection determines next steps

---

## Epic 3A: Path A - Replace Existing Furniture

### US-3A.1: AI Furniture Detection
**As a** user  
**I want** AI to automatically detect existing furniture in my uploaded image  
**So that** I can easily identify what can be replaced

**Why:** Automate manual identification; build trust in AI  
**What:** System detects furniture; user reviews and confirms

**Acceptance Criteria:**
- AI analyzes uploaded room image automatically
- Detects and highlights existing furniture
- Labels furniture types with confidence indicators
- User can confirm, adjust, or remove detections
- Loading indicator during processing

### US-3A.2: Select Furniture to Replace
**As a** user  
**I want to** select which detected furniture items I want to replace  
**So that** I can focus on specific pieces

**Why:** Give user control over what to replace  
**What:** User selects furniture items to replace

**Acceptance Criteria:**
- Display detected furniture as selectable cards
- Multi-select with checkboxes
- Show furniture type, size, position
- Visual feedback on selected items

### US-3A.3: Set Budget for Replacement
**As a** user  
**I want to** specify my total budget for furniture replacement  
**So that** AI suggests products within my price range

**Why:** Ensure recommendations are financially feasible  
**What:** User enters total budget

**Acceptance Criteria:**
- Input field for total budget
- Currency based on region
- AI respects budget constraint
- Warning if budget too low

### US-3A.4: Select Preferred Collections (Optional)
**As a** user  
**I want to** optionally select Castlery collections I prefer  
**So that** AI suggests cohesive furniture sets

**Why:** Allow style customization while keeping optional  
**What:** User selects collections or skips

**Acceptance Criteria:**
- Display collections with preview images
- Multi-select capability
- Option to skip
- Collections filter recommendations

### US-3A.5: Confirm and Trigger AI Rendering
**As a** user  
**I want to** review my selections and trigger AI rendering  
**So that** I can see Castlery furniture in my room

**Why:** Give final review before processing  
**What:** User reviews and clicks "Generate Design"

**Acceptance Criteria:**
- Summary screen showing selections
- Clear "Generate Design" button
- Estimated processing time displayed
- Loading animation during processing

### US-3A.6: View AI Furniture Replacement Results
**As a** user  
**I want to** see my room with Castlery furniture replacing selected items  
**So that** I can visualize the transformation

**Why:** Show AI results clearly; enable comparison  
**What:** User views rendered room and recommendations

**Acceptance Criteria:**
- Display rendered image with replaced furniture
- Before/after slider for comparison
- List of recommended products with details
- Total cost vs budget comparison
- Option to regenerate

### US-3A.7: Refine Replacement via AI Chat
**As a** user  
**I want to** interact with AI through chat to refine the replacement  
**So that** I can adjust specific items or styles

**Why:** Enable natural language refinement  
**What:** User chats with AI to make adjustments

**Acceptance Criteria:**
- Chat interface from results screen
- AI understands refinement requests
- Conversation history visible
- AI regenerates based on chat input
- Multi-language support

---

## Epic 3B: Path B - Furnish Empty Room

### US-3B.1: AI Empty Room Detection
**As a** user  
**I want** AI to confirm my room is empty  
**So that** the system uses the appropriate furnishing approach

**Why:** Ensure correct path selection  
**What:** System confirms empty room; user verifies

**Acceptance Criteria:**
- AI analyzes image for furniture presence
- Display confidence level
- User can confirm or override
- Suggest Path A if furniture detected

### US-3B.2: Set Furnishing Budget
**As a** user  
**I want to** specify my total budget for furnishing  
**So that** AI suggests a complete set within budget

**Why:** Establish financial constraints early  
**What:** User enters total budget

**Acceptance Criteria:**
- Input field for total budget
- Currency based on region
- Suggested budget ranges by room type
- Optional budget breakdown by category

### US-3B.3: Select Style and Collections
**As a** user  
**I want to** select my preferred style and collections  
**So that** AI creates a cohesive design

**Why:** Capture aesthetic preferences  
**What:** User selects style and collections

**Acceptance Criteria:**
- Style options: Modern, Scandinavian, Industrial, etc.
- Collection options with previews
- Multi-select for collections
- Single select for overall style
- Visual examples for each

### US-3B.4: Specify Furniture Preferences (Optional)
**As a** user  
**I want to** optionally specify which furniture categories I need  
**So that** AI focuses on essential items

**Why:** Allow customization while keeping optional  
**What:** User selects categories or lets AI decide

**Acceptance Criteria:**
- Display categories relevant to room type
- Multi-select capability
- Option to let AI decide (recommended)
- Categories: Sofa, Table, Chairs, Storage, etc.

### US-3B.5: Confirm and Trigger AI Furnishing
**As a** user  
**I want to** review preferences and trigger AI furnishing  
**So that** I can see a complete room design

**Why:** Final review before processing  
**What:** User reviews and clicks "Generate Design"

**Acceptance Criteria:**
- Summary showing budget, style, collections
- Clear "Generate Design" button
- Estimated processing time
- Loading animation with progress

### US-3B.6: View AI Furnished Room
**As a** user  
**I want to** see my empty room furnished with Castlery products  
**So that** I can visualize a complete design

**Why:** Show complete transformation  
**What:** User views fully furnished room

**Acceptance Criteria:**
- Display rendered image with all furniture
- Furniture scaled to room dimensions
- Realistic lighting and shadows
- Additional elements: plants, decor, human figure
- Product list with images, names, prices
- Total cost vs budget comparison

### US-3B.7: Refine Design via AI Chat
**As a** user  
**I want to** interact with AI through chat to refine the design  
**So that** I can adjust furniture selection or layout

**Why:** Enable iterative refinement  
**What:** User chats with AI to make adjustments

**Acceptance Criteria:**
- Chat interface from results screen
- AI understands design modification requests
- Conversation history visible
- AI regenerates based on input
- Multi-language support

---

## Epic 4: Visualization & Exploration

### US-4.1: View Room in 2D Layout
**As a** user  
**I want to** view my room design in 2D top-down layout  
**So that** I can see the furniture arrangement clearly

**Why:** Provide clear spatial understanding  
**What:** User views 2D layout

**Acceptance Criteria:**
- Clear 2D floor plan view
- Furniture with accurate proportions
- Labels for each piece
- Room dimensions displayed
- Toggle between 2D and 3D

### US-4.2: View Room in 3D
**As a** user  
**I want to** view my room design in realistic 3D  
**So that** I can see how it will actually look

**Why:** Provide realistic visualization  
**What:** User switches to 3D view

**Acceptance Criteria:**
- 3D rendered view with furniture
- Realistic textures and lighting
- Smooth rendering performance
- Toggle between 2D and 3D

### US-4.3: Rotate and Explore 3D View
**As a** user  
**I want to** freely rotate and zoom the 3D view  
**So that** I can see the room from all angles

**Why:** Enable thorough exploration  
**What:** User rotates and zooms 3D view

**Acceptance Criteria:**
- 360° rotation with mouse/touch
- Vertical angle adjustment
- Zoom in/out with scroll/pinch
- Smooth, responsive controls
- Reset view button

### US-4.4: Switch Between Preset Angles
**As a** user  
**I want to** quickly switch between preset viewing angles  
**So that** I can efficiently review key perspectives

**Why:** Provide quick navigation  
**What:** User clicks preset angle buttons

**Acceptance Criteria:**
- Preset buttons: Front, Side, Corner, Top-down
- Smooth animated transitions
- Works in 3D mode
- Current angle highlighted

### US-4.5: Toggle Dimension Display
**As a** user  
**I want to** toggle dimension labels on/off  
**So that** I can see exact measurements when needed

**Why:** Provide detailed information on demand  
**What:** User toggles dimension display

**Acceptance Criteria:**
- Toggle button clearly visible
- Display room and furniture dimensions
- Dimensions in user's selected unit
- Labels don't clutter view

### US-4.6: View Product Details in Context
**As a** user  
**I want to** click on any furniture item to see its details  
**So that** I can learn more without leaving visualization

**Why:** Provide information in context  
**What:** User clicks furniture to view details

**Acceptance Criteria:**
- Click furniture in 2D or 3D view
- Display modal with product details
- Show name, image, description, dimensions, price
- Link to full product page
- Option to replace with alternative

---

## Epic 5: Shopping & Purchase

### US-5.1: View Complete Product List
**As a** user  
**I want to** see a complete list of all furniture in my design  
**So that** I can review all items and their prices

**Why:** Provide clear cost breakdown  
**What:** User reviews product list and total cost

**Acceptance Criteria:**
- Scrollable list of all products
- Each item shows: image, name, price, quantity
- Total cost prominently displayed
- Budget comparison if budget was set
- Warning if over budget

### US-5.2: Add Individual Items to Cart
**As a** user  
**I want to** add individual furniture items to my shopping cart  
**So that** I can purchase selected pieces

**Why:** Enable selective purchasing  
**What:** User clicks "Add to Cart" for specific items

**Acceptance Criteria:**
- "Add to Cart" button for each item
- Confirmation message after adding
- Cart icon shows updated count
- Warning if out of stock
- Option to view cart

### US-5.3: Add All Items to Cart
**As a** user  
**I want to** add all furniture items to cart at once  
**So that** I can purchase the complete design

**Why:** Enable quick purchase of complete design  
**What:** User clicks "Add All to Cart"

**Acceptance Criteria:**
- "Add All to Cart" button prominently displayed
- Confirmation modal showing all items
- Integration with Castlery shopping cart
- Handle out-of-stock items gracefully
- Redirect to cart or continue shopping option

### US-5.4: Save Design for Later
**As a** user  
**I want to** save my room design  
**So that** I can return to it later or share it

**Why:** Allow users to pause and return  
**What:** User saves design

**Acceptance Criteria:**
- "Save Design" button
- Option to name the design
- Saved to local storage or account
- Confirmation message

---

## Epic 6: Sharing & Export

### US-6.1: Generate Shareable Link
**As a** user  
**I want to** generate a shareable link for my room design  
**So that** I can share it with family, friends, or designers

**Why:** Enable collaboration and feedback  
**What:** User generates and shares link

**Acceptance Criteria:**
- "Share" button clearly visible
- One-click link generation
- Link opens same design (read-only)
- Link remains valid permanently
- Copy to clipboard functionality
- Share via email or social media

### US-6.2: Export Room Design as Image
**As a** user  
**I want to** export my room design as a high-quality image  
**So that** I can save it locally or share via other channels

**Why:** Enable offline sharing and archiving  
**What:** User exports design as image

**Acceptance Criteria:**
- "Export" or "Download" button
- Choose view: 2D layout, 3D render, or both
- High-resolution output (min 1920x1080)
- Option to include/exclude dimensions
- Castlery watermark added
- Format: PNG or JPEG

### US-6.3: Export Product List
**As a** user  
**I want to** export the product list as PDF or spreadsheet  
**So that** I can reference it offline or share with others

**Why:** Provide detailed product information for offline use  
**What:** User exports product list

**Acceptance Criteria:**
- Export option in product list section
- Format options: PDF or CSV
- Include: names, images, prices, dimensions, links
- Total cost included
- Castlery branding on PDF

---

## Epic 7: Error Handling & Edge Cases

### US-7.1: Handle Image Upload Errors
**As a** user  
**I want to** receive clear error messages when image upload fails  
**So that** I understand what went wrong and how to fix it

**Why:** Reduce frustration; guide to success  
**What:** User sees error and takes corrective action

**Acceptance Criteria:**
- User-friendly error message
- Indicate causes: file too large, unsupported format, network issue
- Provide resolution guidance
- Allow retry
- Option to contact support

### US-7.2: Handle AI Processing Errors
**As a** user  
**I want to** be notified when AI processing fails  
**So that** I know what happened and what to do next

**Why:** Maintain trust when errors occur  
**What:** User sees error and chooses next action

**Acceptance Criteria:**
- Friendly error message
- Explain causes: service unavailable, low image quality
- Provide options: retry, upload different image, contact support
- Log error for debugging

### US-7.3: Handle Budget Exceeded Scenario
**As a** user  
**I want to** be notified when AI recommendations exceed my budget  
**So that** I can adjust my preferences or budget

**Why:** Prevent surprise at checkout  
**What:** User adjusts budget or preferences

**Acceptance Criteria:**
- Clear warning showing total cost, budget, exceeded amount
- Options: increase budget, ask AI to adjust, manually remove items
- AI suggests lower-cost alternatives

### US-7.4: Handle Out-of-Stock Products
**As a** user  
**I want to** be notified when recommended products are out of stock  
**So that** I can choose alternatives

**Why:** Set realistic expectations  
**What:** User views alternatives or saves for later

**Acceptance Criteria:**
- Out-of-stock items marked with badge
- Warning when adding to cart
- AI suggests in-stock alternatives
- Option for back-in-stock notification
- Can proceed with design for visualization

### US-7.5: Handle Poor Image Quality
**As a** user  
**I want to** be notified if my uploaded image quality is too low  
**So that** I can upload a better photo

**Why:** Ensure AI has good input  
**What:** User uploads better image or proceeds

**Acceptance Criteria:**
- AI analyzes image quality during upload
- Warning if: low resolution, too dark/bright, room not visible, blurry
- Suggestions for better photo
- Option to proceed anyway or upload new image

---

## Epic 8: Advanced Features

### US-8.1: Compare Multiple Designs
**As a** user  
**I want to** create and compare multiple design variations  
**So that** I can choose the best option

**Why:** Enable exploration of options  
**What:** User creates and compares variations

**Acceptance Criteria:**
- Option to create "Design Variation"
- Save multiple designs for same room
- Side-by-side comparison view
- Compare costs, styles, products
- Switch between designs easily

### US-8.2: Adjust Furniture Placement Manually
**As a** user  
**I want to** manually adjust furniture positions in 2D layout  
**So that** I can customize the arrangement

**Why:** Give advanced users fine-grained control  
**What:** User drags and positions furniture

**Acceptance Criteria:**
- Drag-and-drop furniture in 2D view
- Rotate furniture items
- Collision detection (prevent overlap)
- Snap to grid option
- Undo/redo functionality
- Changes reflected in 3D view

### US-8.3: Request Human Designer Review
**As a** user  
**I want to** request a review from a Castlery designer  
**So that** I can get professional feedback

**Why:** Bridge AI and human expertise  
**What:** User requests designer review

**Acceptance Criteria:**
- "Request Designer Review" button
- Form for specific questions/concerns
- Design automatically shared with designer
- Notification when designer responds
- Designer can comment or suggest changes

---

## Appendix: Data Requirements

### Castlery Test Database Integration
- Product catalog (names, descriptions, images, 3D models)
- Product categories and collections
- Pricing information
- Stock/availability status
- Product dimensions and specifications
- Product relationships (matching sets, collections)
- Product materials and color options
- High-resolution product images for rendering

### AI Service Requirements
- Image upload and storage
- Furniture detection and classification
- Room dimension estimation
- Furniture recommendation engine
- 3D rendering service
- Natural language processing for chat
- Image generation/manipulation for furniture replacement
