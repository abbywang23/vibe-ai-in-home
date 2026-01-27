// Test script for Qwen API
const { QwenClient } = require('./dist/clients/QwenClient');

async function testQwen() {
  console.log('Testing Qwen API...');
  
  // Test with environment variable
  const client = new QwenClient();
  
  console.log('API Key available:', client.isAvailable());
  console.log('API Key (first 10 chars):', process.env.DASHSCOPE_API_KEY?.substring(0, 10) || 'Not set');
  
  if (client.isAvailable()) {
    try {
      const response = await client.chatCompletion({
        model: 'qwen-plus',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: '你好，请简单介绍一下你自己。' }
        ],
        temperature: 0.7,
        max_tokens: 100
      });
      
      console.log('Qwen Response:', response.choices[0].message.content);
    } catch (error) {
      console.error('Qwen API Error:', error.message);
    }
  } else {
    console.log('Qwen API not available - API key not configured');
    console.log('To test Qwen, set DASHSCOPE_API_KEY environment variable');
  }
}

testQwen();