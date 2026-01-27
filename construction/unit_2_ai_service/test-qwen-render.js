// Test script for Qwen image generation (rendering) capability
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Helper function to convert image to base64
function imageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    let mimeType = 'image/jpeg';
    if (ext === '.png') mimeType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    return `data:${mimeType};base64,${base64Image}`;
  } catch (error) {
    throw new Error(`Failed to read image file: ${error.message}`);
  }
}

async function testQwenRender() {
  console.log('测试 Qwen 图像生成（渲染）能力...\n');
  
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey || !apiKey.startsWith('sk-')) {
    console.error('错误: DASHSCOPE_API_KEY 未配置或格式不正确');
    console.log('请在 .env 文件中设置 DASHSCOPE_API_KEY=sk-your-key');
    return;
  }

  // 图片路径和产品图片 URL
  const projectRoot = path.resolve(__dirname, '../../..');
  const roomImagePath = path.join(projectRoot, 'Image (2).jpeg');
  
  // 使用 products.yaml 中的 sofa 产品图片 URL
  // Mori Performance Fabric Chaise Sectional Sofa 的第一张图片
  const productImageUrl = 'https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1692006015/crusader/variants/AS-000406-PG4001/Mori-Left-Facing-Chaise-Sectional-Sofa-Square-Set_4-1692006012.jpg';
  
  // 检查房间图片是否存在
  if (!fs.existsSync(roomImagePath)) {
    console.error(`错误: 找不到房间图片: ${roomImagePath}`);
    return;
  }

  console.log(`房间图片: ${roomImagePath}`);
  console.log(`产品图片 URL: ${productImageUrl}\n`);

  try {
    // 步骤1: 使用 Qwen-VL 分析房间图片和产品图片
    console.log('步骤1: 使用 Qwen-VL 分析图片...');
    
    const roomImageBase64 = imageToBase64(roomImagePath);
    // 产品图片直接使用 URL，Qwen-VL 支持直接使用 URL

    // 使用代码中的 Prompt（参考 ImageProcessingService.ts）
    const systemPrompt = `你是一个专业的室内设计师。请帮助用户在空房间图片中放置Castlery家具产品。

请分析房间图片和产品图片，然后生成一个详细的描述，说明如何将产品放置在房间中，包括：
1. 房间的布局和风格
2. 产品的特点和风格
3. 最佳的放置位置和角度
4. 整体设计效果

请用中文描述，描述要详细且专业，适合用于图像生成。`;

    const analysisResponse = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen3-vl-plus',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: roomImageBase64 }
              },
              {
                type: 'image_url',
                image_url: { url: productImageUrl }
              },
              {
                type: 'text',
                text: '请分析这两张图片：第一张是房间图片，第二张是产品图片。请详细描述如何将产品放置在房间中，包括位置、角度、风格搭配等细节。'
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      throw new Error(`Qwen-VL API 错误: ${analysisResponse.status} - ${errorText}`);
    }

    const analysisResult = await analysisResponse.json();
    const designDescription = analysisResult.choices[0].message.content;
    console.log('分析结果:');
    console.log(designDescription);
    console.log('\n');

    // 步骤2: 使用 Qwen-Image 生成渲染后的图片
    console.log('步骤2: 使用 Qwen-Image 生成渲染后的图片...');
    
    // 构建图像生成提示词（结合代码中的 Prompt 和 Qwen-VL 的分析结果）
    const imagePrompt = `专业的室内设计渲染图，${designDescription}。高质量、真实感、专业摄影风格，自然光线，细节丰富。`;

    const imageGenResponse = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen-image-max',
        input: {
          messages: [
            {
              role: 'user',
              content: [
                {
                  text: imagePrompt
                }
              ]
            }
          ]
        },
        parameters: {
          size: '1664*928',
          n: 1,
          prompt_extend: true,
          watermark: false
        }
      }),
    });

    if (!imageGenResponse.ok) {
      const errorText = await imageGenResponse.text();
      throw new Error(`Qwen-Image API 错误: ${imageGenResponse.status} - ${errorText}`);
    }

    const imageGenResult = await imageGenResponse.json();
    console.log('API 响应:', JSON.stringify(imageGenResult, null, 2));
    
    // 保存生成的图片
    if (imageGenResult.output && imageGenResult.output.choices && imageGenResult.output.choices.length > 0) {
      const content = imageGenResult.output.choices[0].message.content;
      if (content && content.length > 0 && content[0].image) {
        const generatedImageUrl = content[0].image;
        console.log('\n生成的图片 URL:', generatedImageUrl);
        
        // 下载图片并保存到本地
        const imageResponse = await fetch(generatedImageUrl);
        if (!imageResponse.ok) {
          throw new Error(`下载图片失败: ${imageResponse.status}`);
        }
        const imageBuffer = await imageResponse.arrayBuffer();
        const outputDir = path.join(projectRoot, 'vibe-ai-in-home/construction/unit_2_ai_service/output');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const outputPath = path.join(outputDir, `qwen-render-${Date.now()}.png`);
        fs.writeFileSync(outputPath, Buffer.from(imageBuffer));
        
        console.log('\n✅ 成功！生成的图片已保存到:');
        console.log(outputPath);
        console.log('\n绝对路径:');
        console.log(path.resolve(outputPath));
      } else {
        console.log('响应中未找到图片 URL');
        console.log('响应内容:', JSON.stringify(imageGenResult, null, 2));
      }
    } else {
      console.log('API 响应格式异常');
      console.log('完整响应:', JSON.stringify(imageGenResult, null, 2));
    }

  } catch (error) {
    console.error('错误:', error.message);
    if (error.stack) {
      console.error('堆栈:', error.stack);
    }
  }
}

testQwenRender();
