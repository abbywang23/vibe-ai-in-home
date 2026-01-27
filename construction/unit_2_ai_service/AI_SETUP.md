# AI Service Configuration Guide

## Overview

The AI Service now supports multiple AI providers with automatic fallback:

1. **Qwen (阿里云百炼)** - Primary choice, Chinese AI model
2. **OpenAI GPT-4** - Secondary choice, international model  
3. **Mock AI** - Fallback when no API keys are configured

## Configuration

### 1. Qwen (阿里云百炼) Setup

1. **Get API Key**:
   - Visit: https://bailian.console.aliyun.com/
   - Create account and get API key (starts with `sk-`)

2. **Configure Environment**:
   ```bash
   # Add to .env file
   DASHSCOPE_API_KEY=sk-your-dashscope-api-key-here
   ```

3. **Test Configuration**:
   ```bash
   # Build the project first
   npm run build
   
   # Run test script
   node test-qwen.js
   ```

### 2. OpenAI Setup (Optional)

1. **Get API Key**:
   - Visit: https://platform.openai.com/api-keys
   - Create API key (starts with `sk-`)

2. **Configure Environment**:
   ```bash
   # Add to .env file
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

## API Endpoints

### Health Check
```bash
GET /health

# Response includes AI provider status
{
  "status": "ok",
  "service": "ai-service", 
  "aiProviders": {
    "available": ["qwen", "openai"],
    "fallback": "mock"
  }
}
```

### Chat with AI
```bash
POST /api/ai/chat
{
  "sessionId": "session_123",
  "message": "我需要一个沙发推荐",
  "language": "zh",
  "context": {}
}

# Response
{
  "success": true,
  "reply": "我建议为您的客厅选择一款舒适的组合沙发...",
  "actions": []
}
```

### AI Recommendations
```bash
POST /api/ai/recommend
{
  "roomType": "living_room",
  "dimensions": {"length": 5, "width": 4, "height": 3, "unit": "meters"},
  "budget": {"amount": 5000, "currency": "SGD"},
  "preferences": {"selectedCategories": ["sofa"]},
  "language": "zh"
}
```

## AI Provider Priority

The system automatically selects AI providers in this order:

1. **Qwen** (if `DASHSCOPE_API_KEY` is configured)
2. **OpenAI** (if `OPENAI_API_KEY` is configured)  
3. **Mock AI** (always available as fallback)

## Features by Provider

| Feature | Qwen | OpenAI | Mock |
|---------|------|--------|------|
| Chat (中文) | ✅ | ✅ | ✅ |
| Chat (English) | ✅ | ✅ | ✅ |
| Furniture Recommendations | ✅ | ✅ | ✅ |
| Room Layout Analysis | ✅ | ✅ | ❌ |
| Cost | Pay per use | Pay per use | Free |

## Qwen Models Available

- `qwen-plus` (Default) - Balanced performance and cost
- `qwen-turbo` - Faster, lower cost
- `qwen-max` - Highest quality, higher cost

## Error Handling

The service gracefully handles AI provider failures:

1. If Qwen fails → Try OpenAI
2. If OpenAI fails → Use Mock AI
3. Mock AI always works (rule-based responses)

## Testing

### Test Chat Function
```bash
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test",
    "message": "推荐一个沙发",
    "language": "zh",
    "context": {}
  }'
```

### Test Recommendations
```bash
curl -X POST http://localhost:3001/api/ai/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "roomType": "living_room",
    "dimensions": {"length": 5, "width": 4, "height": 3, "unit": "meters"},
    "budget": {"amount": 5000, "currency": "SGD"},
    "preferences": {"selectedCategories": ["sofa"]},
    "language": "zh"
  }'
```

## Troubleshooting

### Common Issues

1. **"DashScope API key not configured"**
   - Check `.env` file has `DASHSCOPE_API_KEY=sk-...`
   - Restart the service after adding API key

2. **"Qwen API error: 401"**
   - API key is invalid or expired
   - Check key format (should start with `sk-`)

3. **"No AI providers available"**
   - No API keys configured
   - System will use Mock AI (still functional)

### Debug Mode

Enable debug logging:
```bash
DEBUG=ai-service npm run dev
```

## Cost Considerations

- **Mock AI**: Free, always available
- **Qwen**: ~¥0.008 per 1K tokens (very affordable)
- **OpenAI**: ~$0.03 per 1K tokens

For development and testing, Mock AI is sufficient. For production with intelligent responses, configure Qwen API key.