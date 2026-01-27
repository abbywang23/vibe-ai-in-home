# AI Service - Furniture Room Planner

A Node.js/TypeScript backend service that provides AI-powered furniture recommendations and product search capabilities for the room planner system.

## Features

- **Furniture Recommendations**: Generate intelligent furniture recommendations based on room type, dimensions, and budget
- **Product Search**: Search and filter products from local catalog
- **Chat Interface**: Natural language interaction in English and Chinese
- **Product Management**: Browse categories and product details
- **Mock AI**: Uses rule-based logic for demo purposes (no external API keys required)

## Prerequisites

- Node.js 18+ or 20+ LTS
- npm or yarn

## Installation

1. Navigate to the project directory:
```bash
cd construction/unit_2_ai_service
```

2. Install dependencies:
```bash
npm install
```

3. Environment configuration:
The `.env` file is already configured with default values. No changes needed for local development.

## Running the Service

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The service will start on `http://localhost:3001`

## Running the Demo

The demo script tests all major functionality of the service.

### Prerequisites
Make sure the service is running first:
```bash
npm run dev
```

### Run Demo (in a separate terminal)
```bash
npm run demo
```

The demo will test:
1. Health check
2. Get product categories
3. Search products
4. Generate furniture recommendations
5. Chat interaction (English)
6. Chat interaction (Chinese)
7. Get product by ID

## API Endpoints

### Health Check
```
GET /health
```

### Recommendations
```
POST /api/ai/recommend
Content-Type: application/json

{
  "roomType": "living_room",
  "dimensions": {
    "length": 5,
    "width": 4,
    "height": 3,
    "unit": "meters"
  },
  "budget": {
    "amount": 5000,
    "currency": "SGD"
  },
  "preferences": {
    "selectedCategories": ["sofa", "table"]
  }
}
```

### Chat
```
POST /api/ai/chat
Content-Type: application/json

{
  "sessionId": "123e4567-e89b-12d3-a456-426614174000",
  "message": "I need a sofa for my living room",
  "language": "en",
  "context": {}
}
```

### Product Search
```
GET /api/ai/products/search?q=sofa&limit=10
```

### Get Categories
```
GET /api/ai/products/categories
```

### Get Product by ID
```
GET /api/ai/products/:id
```

## Project Structure

```
src/
├── clients/              # External service clients
│   └── ProductServiceClient.ts
├── controllers/          # Request handlers
│   ├── recommendationController.ts
│   ├── chatController.ts
│   └── productController.ts
├── services/            # Business logic
│   ├── RecommendationService.ts
│   └── ChatService.ts
├── models/              # Domain models and types
│   ├── types.ts
│   └── schemas.ts
├── middleware/          # Express middleware
│   └── errorHandler.ts
├── routes/              # Route definitions
│   └── index.ts
├── app.ts               # Express app setup
└── index.ts             # Entry point
```

## Configuration

### Environment Variables

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `PRODUCTS_CONFIG_PATH`: Path to products YAML file
- `ALLOWED_ORIGINS`: CORS allowed origins

### Product Catalog

Products are loaded from `../../product/products.yaml`. The service automatically:
- Parses product data
- Infers categories and dimensions
- Makes products searchable

## Development

### Type Checking
```bash
npx tsc --noEmit
```

### Build
```bash
npm run build
```

## Testing

The demo script (`demo.ts`) serves as the primary testing tool. It validates:
- API endpoint functionality
- Request/response formats
- Error handling
- Multi-language support

## Troubleshooting

### Service won't start
- Check if port 3001 is available
- Verify Node.js version (18+ required)
- Ensure all dependencies are installed

### Products not loading
- Verify `PRODUCTS_CONFIG_PATH` in `.env`
- Check if `../../product/products.yaml` exists
- Review console logs for errors

### Demo fails
- Ensure service is running on port 3001
- Check network connectivity
- Review error messages in demo output

## Architecture

The service follows clean architecture principles:

1. **Controllers**: Handle HTTP requests/responses
2. **Services**: Contain business logic
3. **Clients**: Interface with external data sources
4. **Models**: Define domain types and validation
5. **Middleware**: Cross-cutting concerns (errors, logging)

## Mock AI Implementation

For demo purposes, the service uses rule-based logic instead of external AI APIs:

- **Recommendations**: Selects products based on room type priorities
- **Chat**: Keyword-based responses in English and Chinese
- **Placements**: Simple geometric distribution algorithm

This allows the demo to run without API keys while demonstrating the system architecture.

## Future Enhancements

- Integration with OpenAI GPT-4 for intelligent recommendations
- Integration with Replicate for image processing
- Caching layer for improved performance
- Rate limiting for production use
- Comprehensive test suite

## License

ISC
