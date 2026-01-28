#!/bin/bash

echo "Testing Qwen image generation for place API..."

# Test place furniture API with image generation
echo "Testing place furniture with image generation..."
PLACE_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{
    \"imageUrl\": \"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80\",
    \"productId\": \"product-1\",
    \"imagePosition\": {\"x\": 50, \"y\": 50},
    \"rotation\": 0,
    \"scale\": 1.0
  }" \
  http://localhost:3001/api/ai/place)

echo "Place response:"
echo "$PLACE_RESPONSE" | jq '.' 2>/dev/null || echo "$PLACE_RESPONSE"

# Check if we got a generated image
PROCESSED_URL=$(echo "$PLACE_RESPONSE" | grep -o '"processedImageUrl":"[^"]*' | cut -d'"' -f4)
if [[ "$PROCESSED_URL" == *"rendered_"* ]]; then
  echo "✅ Image generation successful - got rendered image: $PROCESSED_URL"
  
  # Test if the generated image is accessible
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROCESSED_URL")
  if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Generated image is accessible (HTTP $HTTP_STATUS)"
  else
    echo "❌ Generated image is not accessible (HTTP $HTTP_STATUS)"
  fi
elif [[ "$PROCESSED_URL" == *"fallback=true"* ]]; then
  echo "❌ Image generation failed - using fallback"
else
  echo "⚠️  Unknown response format"
fi

echo "Image generation test completed."