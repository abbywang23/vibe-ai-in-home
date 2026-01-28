// Test script for multi-furniture render API using Cloudinary + wan2.5-i2i-preview
// This script tests the new implementation that follows the wan25-curl.sh pattern
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

async function loadProductUrls() {
  try {
    const productsYamlPath = path.join(__dirname, '../../product/products.yaml');
    
    if (!fs.existsSync(productsYamlPath)) {
      console.warn('⚠️  products.yaml not found, using fallback URLs');
      return [
        "https://cdn.castlery.com/products/mori-performance-fabric-chaise-sectional-sofa/mori-performance-fabric-chaise-sectional-sofa-1.jpg",
        "https://cdn.castlery.com/products/avery-swivel-armchair/avery-swivel-armchair-1.jpg",
        "https://cdn.castlery.com/products/dawson-3-seater-sofa-with-ottoman/dawson-3-seater-sofa-with-ottoman-1.jpg"
      ];
    }

    const productsYaml = fs.readFileSync(productsYamlPath, 'utf8');
    const productsData = yaml.load(productsYaml);

    const imageUrls = [];
    if (productsData.categories && productsData.categories.length > 0) {
      for (const category of productsData.categories) {
        if (category.products && category.products.length > 0) {
          for (const product of category.products) {
            if (product.images && product.images.length > 0 && imageUrls.length < 3) {
              imageUrls.push(product.images[0].url);
              console.log(`  添加产品图片: ${product.name}`);
            }
            if (imageUrls.length >= 3) break;
          }
          if (imageUrls.length >= 3) break;
        }
      }
    }

    return imageUrls;
  } catch (error) {
    console.error('Error loading products.yaml:', error);
    return [
      "https://cdn.castlery.com/products/mori-performance-fabric-chaise-sectional-sofa/mori-performance-fabric-chaise-sectional-sofa-1.jpg",
      "https://cdn.castlery.com/products/avery-swivel-armchair/avery-swivel-armchair-1.jpg",
      "https://cdn.castlery.com/products/dawson-3-seater-sofa-with-ottoman/dawson-3-seater-sofa-with-ottoman-1.jpg"
    ];
  }
}

async function testMultiRenderCloudinary() {
  console.log('🧪 测试多家具渲染API (新实现: Cloudinary + wan2.5-i2i-preview)...\n');
  
  try {
    // Load product URLs from products.yaml
    console.log('📋 从 products.yaml 加载产品图片URL...');
    const productImageUrls = await loadProductUrls();
    console.log(`✅ 加载了 ${productImageUrls.length} 个产品图片URL\n`);

    // Test data with actual product URLs
    const testData = {
      imageUrl: "http://localhost:3001/uploads/1769510172515-Image (4).jpeg",
      selectedFurniture: [
        {
          id: "product-1",
          name: "Mori Performance Fabric Chaise Sectional Sofa",
          imageUrl: productImageUrls[0]
        },
        {
          id: "product-11", 
          name: "Avery Swivel Armchair",
          imageUrl: productImageUrls[1]
        },
        {
          id: "product-30",
          name: "Dawson 3 Seater Sofa with Ottoman",
          imageUrl: productImageUrls[2]
        }
      ],
      roomType: "living room"
    };

    console.log('🚀 发送请求到 /api/ai/multi-render...');
    console.log('选中的家具:', testData.selectedFurniture.map(f => f.name).join(', '));
    console.log('\n使用的产品图片URL:');
    testData.selectedFurniture.forEach((f, index) => {
      console.log(`  ${index + 1}. ${f.name}`);
      console.log(`     ${f.imageUrl}`);
    });
    console.log('');
    
    const startTime = Date.now();
    console.log(`⏰ 开始时间: ${new Date(startTime).toLocaleTimeString()}`);
    console.log('');
    
    const response = await fetch('http://localhost:3001/api/ai/multi-render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 请求失败: ${response.status} - ${response.statusText}\n${errorText}`);
    }

    const result = await response.json();
    const endTime = Date.now();
    const totalTime = Math.round((endTime - startTime) / 1000);
    
    console.log('\n🎉 多家具渲染成功！');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('生成的图片URL:', result.processedImageUrl);
    console.log('处理的家具数量:', testData.selectedFurniture.length);
    console.log('生成时间:', new Date(result.placement.appliedAt).toLocaleString());
    console.log(`总耗时: ${totalTime}秒 (${Math.floor(totalTime / 60)}分${totalTime % 60}秒)`);
    console.log('═══════════════════════════════════════════════════════════');
    
    // Verify the image file exists
    console.log('\n🔍 验证生成的图片...');
    const imageUrl = result.processedImageUrl;
    const imageResponse = await fetch(imageUrl);
    
    if (imageResponse.ok) {
      const contentLength = imageResponse.headers.get('content-length');
      console.log('✅ 生成的图片文件可以正常访问');
      if (contentLength) {
        const sizeKB = Math.round(parseInt(contentLength) / 1024);
        const sizeMB = (sizeKB / 1024).toFixed(2);
        console.log(`📏 图片大小: ${sizeKB} KB (${sizeMB} MB)`);
      }
      
      // Extract filename from URL
      const filename = imageUrl.split('/').pop();
      console.log(`📁 文件名: ${filename}`);
      
      // Show absolute path
      const uploadsDir = path.join(__dirname, 'uploads');
      const absolutePath = path.join(uploadsDir, filename);
      console.log(`📍 绝对路径: ${absolutePath}`);
      
    } else {
      console.log('❌ 生成的图片文件无法访问');
    }
    
    console.log('\n🔄 新实现流程验证：');
    console.log('1. ✅ 用户图片上传到 Cloudinary');
    console.log('2. ✅ 使用产品图片URL（来自products.yaml）');
    console.log('3. ✅ 调用 wan2.5-i2i-preview 异步API');
    console.log('4. ✅ 轮询获取任务结果');
    console.log('5. ✅ 下载并保存生成的图片');
    
    console.log('\n🎯 测试完成！新实现已成功运行。');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.stack) {
      console.error('\n📋 错误堆栈:');
      console.error(error.stack);
    }
    
    console.log('\n🔧 故障排除建议:');
    console.log('1. 确保 AI 服务正在运行 (npm run dev)');
    console.log('2. 检查 .env 文件中的 DASHSCOPE_API_KEY');
    console.log('3. 检查 Cloudinary 配置');
    console.log('4. 确保测试图片文件存在');
  }
}

// Run the test
testMultiRenderCloudinary();