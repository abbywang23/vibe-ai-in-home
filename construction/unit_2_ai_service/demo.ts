/**
 * Demo Script for AI Service
 * 
 * This script demonstrates the core functionality of the AI Service
 * by making HTTP requests to the running server.
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(60) + '\n');
}

function logSuccess(message: string) {
  log(`✓ ${message}`, colors.green);
}

function logError(message: string) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message: string) {
  log(`ℹ ${message}`, colors.blue);
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Test 1: Health Check
 */
async function testHealthCheck() {
  logSection('Test 1: Health Check');
  
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    logSuccess('Health check passed');
    logInfo(`Status: ${response.data.status}`);
    logInfo(`Service: ${response.data.service}`);
    logInfo(`Uptime: ${response.data.uptime.toFixed(2)}s`);
    return true;
  } catch (error: any) {
    logError(`Health check failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 2: Get Product Categories
 */
async function testGetCategories() {
  logSection('Test 2: Get Product Categories');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/ai/products/categories`);
    logSuccess('Categories retrieved successfully');
    
    if (response.data.categories && response.data.categories.length > 0) {
      logInfo(`Found ${response.data.categories.length} categories:`);
      response.data.categories.forEach((cat: any) => {
        console.log(`  - ${cat.name} (${cat.productCount} products)`);
      });
    } else {
      logInfo('No categories found');
    }
    
    return true;
  } catch (error: any) {
    logError(`Failed to get categories: ${error.message}`);
    return false;
  }
}

/**
 * Test 3: Search Products
 */
async function testSearchProducts() {
  logSection('Test 3: Search Products');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/ai/products/search`, {
      params: {
        q: 'sofa',
        limit: 5,
      },
    });
    
    logSuccess('Product search successful');
    logInfo(`Found ${response.data.total} products`);
    
    if (response.data.products && response.data.products.length > 0) {
      console.log('\nTop results:');
      response.data.products.slice(0, 3).forEach((product: any, index: number) => {
        console.log(`\n${index + 1}. ${product.name}`);
        console.log(`   Price: ${product.currency} ${product.price}`);
        console.log(`   Category: ${product.category}`);
        console.log(`   Dimensions: ${product.dimensions.width}m × ${product.dimensions.depth}m × ${product.dimensions.height}m`);
      });
    }
    
    return true;
  } catch (error: any) {
    logError(`Product search failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 4: Get Recommendations for Living Room
 */
async function testRecommendations() {
  logSection('Test 4: Get Furniture Recommendations');
  
  const request = {
    roomType: 'living_room',
    dimensions: {
      length: 5,
      width: 4,
      height: 3,
      unit: 'meters',
    },
    budget: {
      amount: 5000,
      currency: 'SGD',
    },
    preferences: {
      selectedCategories: ['sofa', 'table'],
    },
  };
  
  logInfo('Request:');
  console.log(JSON.stringify(request, null, 2));
  
  try {
    const response = await axios.post(`${BASE_URL}/api/ai/recommend`, request);
    
    logSuccess('Recommendations generated successfully');
    logInfo(`Total recommendations: ${response.data.recommendations.length}`);
    logInfo(`Total price: ${request.budget.currency} ${response.data.totalPrice}`);
    
    if (response.data.budgetExceeded) {
      log(`⚠ Budget exceeded by ${request.budget.currency} ${response.data.exceededAmount}`, colors.yellow);
    } else {
      logSuccess('Within budget');
    }
    
    if (response.data.recommendations && response.data.recommendations.length > 0) {
      console.log('\nRecommendations:');
      response.data.recommendations.forEach((rec: any, index: number) => {
        console.log(`\n${index + 1}. ${rec.productName}`);
        console.log(`   Price: ${request.budget.currency} ${rec.price}`);
        console.log(`   Position: (${rec.position.x.toFixed(2)}, ${rec.position.y.toFixed(2)}, ${rec.position.z.toFixed(2)})`);
        console.log(`   Rotation: ${rec.rotation}°`);
        console.log(`   Reasoning: ${rec.reasoning}`);
      });
    }
    
    return true;
  } catch (error: any) {
    logError(`Recommendations failed: ${error.response?.data?.error?.message || error.message}`);
    if (error.response?.data?.error?.details) {
      console.log('Validation errors:', error.response.data.error.details);
    }
    return false;
  }
}

/**
 * Test 5: Chat Interaction (English)
 */
async function testChatEnglish() {
  logSection('Test 5: Chat Interaction (English)');
  
  const request = {
    sessionId: '123e4567-e89b-12d3-a456-426614174000',
    message: 'I need a sofa for my living room',
    language: 'en',
    context: {},
  };
  
  logInfo(`User: ${request.message}`);
  
  try {
    const response = await axios.post(`${BASE_URL}/api/ai/chat`, request);
    
    logSuccess('Chat response received');
    log(`AI: ${response.data.reply}`, colors.cyan);
    
    return true;
  } catch (error: any) {
    logError(`Chat failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 6: Chat Interaction (Chinese)
 */
async function testChatChinese() {
  logSection('Test 6: Chat Interaction (Chinese)');
  
  const request = {
    sessionId: '123e4567-e89b-12d3-a456-426614174000',
    message: '我需要一个沙发',
    language: 'zh',
    context: {},
  };
  
  logInfo(`用户: ${request.message}`);
  
  try {
    const response = await axios.post(`${BASE_URL}/api/ai/chat`, request);
    
    logSuccess('收到聊天回复');
    log(`AI: ${response.data.reply}`, colors.cyan);
    
    return true;
  } catch (error: any) {
    logError(`聊天失败: ${error.message}`);
    return false;
  }
}

/**
 * Test 7: Get Product by ID
 */
async function testGetProductById() {
  logSection('Test 7: Get Product by ID');
  
  const productId = 'product-1';
  logInfo(`Fetching product: ${productId}`);
  
  try {
    const response = await axios.get(`${BASE_URL}/api/ai/products/${productId}`);
    
    logSuccess('Product retrieved successfully');
    const product = response.data.product;
    
    console.log(`\nProduct Details:`);
    console.log(`  Name: ${product.name}`);
    console.log(`  Price: ${product.currency} ${product.price}`);
    console.log(`  Category: ${product.category}`);
    console.log(`  Description: ${product.description}`);
    console.log(`  In Stock: ${product.inStock ? 'Yes' : 'No'}`);
    console.log(`  Delivery: ${product.delivery}`);
    
    return true;
  } catch (error: any) {
    logError(`Failed to get product: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

/**
 * Main demo execution
 */
async function runDemo() {
  log('\n' + '█'.repeat(60), colors.bright + colors.blue);
  log('  AI SERVICE DEMO', colors.bright + colors.blue);
  log('█'.repeat(60) + '\n', colors.bright + colors.blue);
  
  logInfo('Starting demo tests...');
  logInfo(`Target server: ${BASE_URL}`);
  
  const results: { [key: string]: boolean } = {};
  
  // Run tests sequentially
  results['Health Check'] = await testHealthCheck();
  await delay(500);
  
  results['Get Categories'] = await testGetCategories();
  await delay(500);
  
  results['Search Products'] = await testSearchProducts();
  await delay(500);
  
  results['Get Recommendations'] = await testRecommendations();
  await delay(500);
  
  results['Chat (English)'] = await testChatEnglish();
  await delay(500);
  
  results['Chat (Chinese)'] = await testChatChinese();
  await delay(500);
  
  results['Get Product by ID'] = await testGetProductById();
  
  // Summary
  logSection('Demo Summary');
  
  const passed = Object.values(results).filter((r) => r).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    if (passed) {
      logSuccess(test);
    } else {
      logError(test);
    }
  });
  
  console.log('\n' + '='.repeat(60));
  if (passed === total) {
    log(`✓ All tests passed (${passed}/${total})`, colors.bright + colors.green);
  } else {
    log(`⚠ ${passed}/${total} tests passed`, colors.yellow);
  }
  console.log('='.repeat(60) + '\n');
}

// Run demo
runDemo().catch((error) => {
  logError(`Demo failed: ${error.message}`);
  process.exit(1);
});
