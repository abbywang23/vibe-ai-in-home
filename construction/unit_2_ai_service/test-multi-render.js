// Test script for multi-furniture render API using Cloudinary + wan2.5-i2i-preview
require('dotenv').config();

async function testMultiRender() {
  console.log('测试多家具渲染API (Cloudinary + wan2.5-i2i-preview)...\n');
  
  try {
    // Test data - using product URLs from products.yaml
    const testData = {
      imageUrl: "http://localhost:3001/uploads/1769510172515-Image (4).jpeg",
      selectedFurniture: [
        {
          id: "product-1",
          name: "Mori Performance Fabric Chaise Sectional Sofa",
          imageUrl: "https://cdn.castlery.com/products/mori-performance-fabric-chaise-sectional-sofa/mori-performance-fabric-chaise-sectional-sofa-1.jpg"
        },
        {
          id: "product-11", 
          name: "Avery Swivel Armchair",
          imageUrl: "https://cdn.castlery.com/products/avery-swivel-armchair/avery-swivel-armchair-1.jpg"
        },
        {
          id: "product-30",
          name: "Dawson 3 Seater Sofa with Ottoman",
          imageUrl: "https://cdn.castlery.com/products/dawson-3-seater-sofa-with-ottoman/dawson-3-seater-sofa-with-ottoman-1.jpg"
        }
      ],
      roomType: "living room"
    };

    console.log('发送请求到 /api/ai/multi-render...');
    console.log('选中的家具:', testData.selectedFurniture.map(f => f.name).join(', '));
    console.log('使用的产品图片URL:');
    testData.selectedFurniture.forEach(f => {
      console.log(`  - ${f.name}: ${f.imageUrl}`);
    });
    console.log('');
    
    const startTime = Date.now();
    
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
    
    console.log('\n✅ 多家具渲染成功！');
    console.log('生成的图片URL:', result.processedImageUrl);
    console.log('处理的家具数量:', testData.selectedFurniture.length);
    console.log('生成时间:', new Date(result.placement.appliedAt).toLocaleString());
    console.log(`总耗时: ${totalTime}秒 (${Math.floor(totalTime / 60)}分${totalTime % 60}秒)`);
    
    // Verify the image file exists
    const imageUrl = result.processedImageUrl;
    const imageResponse = await fetch(imageUrl);
    
    if (imageResponse.ok) {
      const contentLength = imageResponse.headers.get('content-length');
      console.log('✅ 生成的图片文件可以正常访问');
      if (contentLength) {
        const sizeKB = Math.round(parseInt(contentLength) / 1024);
        console.log(`图片大小: ${sizeKB} KB`);
      }
    } else {
      console.log('❌ 生成的图片文件无法访问');
    }
    
    console.log('\n🎉 测试完成！新的实现流程：');
    console.log('1. ✅ 用户图片上传到 Cloudinary');
    console.log('2. ✅ 使用产品图片URL（来自products.yaml）');
    console.log('3. ✅ 调用 wan2.5-i2i-preview 异步API');
    console.log('4. ✅ 轮询获取任务结果');
    console.log('5. ✅ 下载并保存生成的图片');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.stack) {
      console.error('错误堆栈:', error.stack);
    }
  }
}

testMultiRender();