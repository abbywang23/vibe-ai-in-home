// Test script for direct Qwen wan2.6-image API call (multi-image generation)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

async function testQwenWan26() {
  console.log('测试 Qwen wan2.6-image 多图生图接口...\n');
  
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey || !apiKey.startsWith('sk-')) {
    console.error('错误: DASHSCOPE_API_KEY 未配置或格式不正确');
    console.log('当前 API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');
    return;
  }

  console.log('API Key 配置正确');
  
  // 参考 curl 请求的结构：房间图片 + 多个产品图片
  const projectRoot = path.resolve(__dirname, '../../..');
  
  // 1. 房间图片（参考 curl 中的 imageUrl）
  // 使用本地文件，转换为 base64（wan2.6-image 支持 base64 和 URL）
  const roomImagePath = path.join(projectRoot, 'Image (2).jpeg');
  let roomImageUrl = null;
  
  if (fs.existsSync(roomImagePath)) {
    console.log(`使用本地房间图片: ${roomImagePath}`);
    // 读取并转换为 base64
    const imageBuffer = fs.readFileSync(roomImagePath);
    const base64Image = imageBuffer.toString('base64');
    roomImageUrl = `data:image/jpeg;base64,${base64Image}`;
    console.log(`图片大小: ${(imageBuffer.length / 1024 / 1024).toFixed(2)} MB`);
  } else {
    // 如果本地文件不存在，尝试使用远程 URL
    roomImageUrl = 'http://localhost:3001/uploads/1769514236920-Image (2).jpeg';
    console.log(`⚠️  本地文件不存在，使用远程 URL: ${roomImageUrl}`);
    console.log('注意: 如果本地服务器未运行，此 URL 将无法访问');
  }
  
  // 2. 从 products.yaml 读取多个产品的图片 URL
  const productsYamlPath = path.join(projectRoot, 'vibe-ai-in-home/product/products.yaml');
  
  if (!fs.existsSync(productsYamlPath)) {
    console.error(`错误: 找不到 products.yaml 文件: ${productsYamlPath}`);
    return;
  }

  console.log(`读取产品配置: ${productsYamlPath}`);
  const productsYaml = fs.readFileSync(productsYamlPath, 'utf8');
  const productsData = yaml.load(productsYaml);
  
  // 从不同产品中提取图片 URL（参考 curl 中的 selectedFurniture）
  // API 要求最多 4 张图片，所以：1 张房间图片 + 3 张产品图片
  let productImageUrls = [];
  if (productsData.categories && productsData.categories.length > 0) {
    for (const category of productsData.categories) {
      if (category.products && category.products.length > 0) {
        // 从不同产品中各取一张图片
        for (const product of category.products) {
          if (product.images && product.images.length > 0 && productImageUrls.length < 3) {
            productImageUrls.push(product.images[0].url);
            console.log(`  添加产品图片: ${product.name}`);
          }
          if (productImageUrls.length >= 3) break;
        }
        if (productImageUrls.length >= 3) break;
      }
    }
  }
  
  if (productImageUrls.length === 0) {
    console.error('错误: 在 products.yaml 中未找到产品图片 URL');
    return;
  }
  
  // 组合所有图片：房间图片 + 产品图片
  const allImageUrls = [roomImageUrl, ...productImageUrls];
  
  console.log(`\n使用 ${allImageUrls.length} 张图片进行多图生图测试:`);
  console.log(`  1. 房间图片`);
  productImageUrls.forEach((url, index) => {
    console.log(`  ${index + 2}. 产品图片 ${index + 1}: ${url.substring(0, 80)}...`);
  });
  console.log('');
  
  const startTime = Date.now();

  try {
    // 构建 content 数组：先添加文本，然后添加所有图片（房间图片 + 产品图片）
    const content = [
      {
        text: `请基于这张房间图片和${productImageUrls.length}张家具产品图片，生成一张现代简约风格的客厅渲染图。将家具产品自然地融入到房间中，保持整体风格协调，布局合理，光线自然`
      },
      ...allImageUrls.map(url => ({ image: url }))
    ];

    const requestData = {
      model: 'wan2.6-image',
      input: {
        messages: [
          {
            role: 'user',
            content: content
          }
        ]
      },
      parameters: {
        prompt_extend: true,
        watermark: false,
        n: 1,
        enable_interleave: false,
        size: '1280*1280'
      }
    };

    console.log(`发送请求到 ${requestData.model}...`);
    console.log('请求数据预览:', JSON.stringify({
      ...requestData,
      input: {
        ...requestData.input,
        messages: requestData.input.messages.map(msg => ({
          ...msg,
          content: msg.content.map(c => 
            c.image ? { 
              ...c, 
              image: typeof c.image === 'string' && c.image.length > 50 
                ? (c.image.startsWith('data:') ? c.image.substring(0, 50) + '...' : c.image.substring(0, 80) + '...')
                : c.image
            } : c
          )
        }))
      }
    }, null, 2));
    
    console.log('\n正在发送请求（多图生图可能需要较长时间，请耐心等待）...');
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestData),
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`\n响应时间: ${responseTime}ms (${(responseTime/1000).toFixed(2)}秒)`);
    console.log('响应状态:', response.status, response.statusText);

    if (!response.ok) {
      // 读取错误响应，设置超时避免卡住
      let errorText = '';
      try {
        const textPromise = response.text();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('读取响应超时')), 5000)
        );
        errorText = await Promise.race([textPromise, timeoutPromise]);
      } catch (e) {
        errorText = `无法读取错误响应: ${e.message}`;
      }
      console.error('\n❌ API 错误响应:', errorText);
      console.error(`状态码: ${response.status} ${response.statusText}`);
      throw new Error(`Qwen API 错误: ${response.status} - ${errorText}`);
    }

    // 读取成功响应
    let result;
    try {
      result = await response.json();
    } catch (e) {
      console.error('解析响应 JSON 失败:', e.message);
      const text = await response.text();
      console.error('响应内容:', text.substring(0, 500));
      throw new Error(`解析响应失败: ${e.message}`);
    }
    console.log('✅ API 响应成功！');
    console.log('响应结构:', JSON.stringify(result, null, 2));
    
    // 检查是否有生成的图片
    if (result.output && result.output.choices && result.output.choices.length > 0) {
      const content = result.output.choices[0].message.content;
      if (content && content.length > 0 && content[0].image) {
        const generatedImageUrl = content[0].image;
        console.log('\n✅ 成功生成图片！');
        console.log('图片URL:', generatedImageUrl);
        
        // 尝试下载图片验证
        console.log('\n验证图片是否可访问...');
        const imageResponse = await fetch(generatedImageUrl);
        if (imageResponse.ok) {
          console.log('✅ 图片可以正常访问');
          console.log('图片大小:', imageResponse.headers.get('content-length'), 'bytes');
          
          // 保存图片到本地
          const imageBuffer = await imageResponse.arrayBuffer();
          const outputDir = path.join(__dirname, 'output');
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }
          const outputPath = path.join(outputDir, `test_wan26_${Date.now()}.png`);
          fs.writeFileSync(outputPath, Buffer.from(imageBuffer));
          console.log('✅ 图片已保存到:', outputPath);
        } else {
          console.log('❌ 图片无法访问');
        }
      } else {
        console.log('❌ 响应中未找到图片');
        console.log('content 结构:', content);
      }
    } else {
      console.log('❌ 响应格式异常');
      console.log('output 结构:', result.output);
    }

  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    console.error(`\n❌ 测试失败 (耗时: ${responseTime}ms):`);
    console.error('错误类型:', error.constructor.name);
    console.error('错误信息:', error.message);
    
    if (error.code) {
      console.error('错误代码:', error.code);
    }
    
    if (error.cause) {
      console.error('错误原因:', error.cause);
    }
    
    // 确保错误时退出
    throw error;
  }
}

// 添加超时处理（多图生图需要更长时间，根据文档同步调用支持，但可能需要更长时间）
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('请求超时 (180秒) - 多图生图可能需要更长时间')), 180000);
});

// 运行测试并处理结果
(async () => {
  try {
    await Promise.race([testQwenWan26(), timeoutPromise]);
    console.log('\n✅ 测试完成');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 最终错误:', error.message);
    process.exit(1);
  }
})();