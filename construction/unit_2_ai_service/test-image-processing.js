// Test script for image processing with Qwen-VL
require('dotenv').config();
const { QwenClient } = require('./dist/clients/QwenClient');

async function testImageProcessing() {
  console.log('Testing Qwen-VL image processing...');
  
  const client = new QwenClient();
  
  console.log('API Key available:', client.isAvailable());
  
  if (!client.isAvailable()) {
    console.log('Qwen API not available - API key not configured');
    return;
  }

  try {
    // Test with a sample room image
    const response = await client.chatCompletion({
      model: 'qwen3-vl-plus',
      messages: [
        {
          role: 'system',
          content: `你是一个专业的室内设计师和家具识别专家。请分析这张房间图片，识别其中的家具并判断房间是否为空。

请按照以下JSON格式返回结果：
{
  "isEmpty": boolean,
  "detectedItems": [
    {
      "itemId": "unique_id",
      "furnitureType": "家具类型（如：沙发、桌子、椅子等）",
      "boundingBox": {
        "x": 边界框左上角x坐标（0-100百分比）,
        "y": 边界框左上角y坐标（0-100百分比）,
        "width": 边界框宽度（0-100百分比）,
        "height": 边界框高度（0-100百分比）
      },
      "confidence": 置信度（0-1之间的小数）
    }
  ]
}`
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
              }
            },
            {
              type: 'text',
              text: '请分析这张房间图片，识别其中的家具。如果房间是空的，isEmpty设为true。如果有家具，isEmpty设为false并列出所有检测到的家具。'
            }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });
    
    console.log('Qwen-VL Response:');
    console.log(response.choices[0].message.content);
    
  } catch (error) {
    console.error('Qwen-VL API Error:', error.message);
  }
}

testImageProcessing();