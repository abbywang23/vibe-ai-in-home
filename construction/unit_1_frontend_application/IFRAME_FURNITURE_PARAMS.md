# Iframe 家具渲染参数说明

## 概述

本文档说明如何通过 iframe 向渲染界面传递家具参数，用于 Decor8 AI 渲染。

## 家具参数结构

### FurnitureItemForRender

每个家具项需要包含以下参数：

```typescript
interface FurnitureItemForRender {
  id: string;              // 必需：家具唯一标识符
  name: string;            // 必需：家具名称
  imageUrl: string;        // 必需：用于前端展示的图片 URL
  renderImageUrl?: string; // 可选：用于 AI 渲染的图片 URL（优先使用）
  category?: string;       // 可选：家具类别（如 "sofa", "chair", "table"）
}
```

### 完整消息结构

```typescript
interface IframeMessagePayload {
  furniture?: FurnitureItemForRender[];  // 家具列表
  // 注意：roomType 和 roomDimensions 由后端 AI 自动识别，不需要传入
}
```

## 使用方式

### 1. 父页面发送数据

在父页面中，当 iframe 加载完成后，通过 `postMessage` 发送家具数据：

```javascript
// 等待 iframe 加载完成
const iframe = document.getElementById('render-iframe');

iframe.addEventListener('load', () => {
  // 准备家具数据
  const furnitureData = {
    type: 'FURNITURE_DATA',
    payload: {
      furniture: [
        {
          id: 'sofa-001',
          name: 'Modern Sectional Sofa',
          imageUrl: 'https://example.com/sofa-display.jpg',
          renderImageUrl: 'https://example.com/sofa-render.jpg',
          category: 'sofa'
        },
        {
          id: 'table-002',
          name: 'Coffee Table',
          imageUrl: 'https://example.com/table-display.jpg',
          renderImageUrl: 'https://example.com/table-render.jpg',
          category: 'table'
        }
      ]
      // 注意：不需要传入 roomType 和 roomDimensions
      // 这些信息会由后端 AI 自动识别
    }
  };

  // 发送数据到 iframe
  iframe.contentWindow.postMessage(furnitureData, '*');
});
```

### 2. Iframe 接收数据

iframe 内部会自动接收并处理这些数据（已在 `useIframeMessage` hook 中实现）。

### 3. 监听渲染状态

父页面可以监听 iframe 返回的渲染状态：

```javascript
window.addEventListener('message', (event) => {
  if (event.data.type === 'RENDER_STATUS') {
    const { status, progress, renderedImageUrl, error } = event.data.payload;
    
    console.log('Render status:', status);
    
    switch (status) {
      case 'idle':
        console.log('等待用户上传图片');
        break;
      case 'uploading':
        console.log('上传进度:', progress + '%');
        break;
      case 'detecting':
        console.log('正在检测房间...');
        break;
      case 'rendering':
        console.log('正在渲染家具...');
        break;
      case 'completed':
        console.log('渲染完成！', renderedImageUrl);
        // 可以在这里获取渲染后的图片 URL
        break;
      case 'error':
        console.error('渲染失败:', error);
        break;
    }
  }
});
```

## 完整示例

### HTML 页面示例

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Furniture Render - Parent Page</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    #render-iframe {
      width: 1000px;
      height: 580px;
      border: 1px solid #ccc;
      border-radius: 8px;
    }
    #status {
      margin-top: 20px;
      padding: 10px;
      background: #f0f0f0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>Furniture Render Demo</h1>
  
  <iframe 
    id="render-iframe" 
    src="http://localhost:5173/iframe-render"
  ></iframe>
  
  <div id="status">
    <strong>Status:</strong> <span id="status-text">Loading...</span>
  </div>

  <script>
    const iframe = document.getElementById('render-iframe');
    const statusText = document.getElementById('status-text');

    // 准备家具数据
    const furnitureData = {
      type: 'FURNITURE_DATA',
      payload: {
        furniture: [
          {
            id: 'sofa-001',
            name: 'Modern Sectional Sofa',
            imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
            renderImageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
            category: 'sofa'
          },
          {
            id: 'chair-002',
            name: 'Accent Chair',
            imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c',
            renderImageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c',
            category: 'chair'
          },
          {
            id: 'table-003',
            name: 'Coffee Table',
            imageUrl: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d',
            renderImageUrl: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d',
            category: 'table'
          }
        ]
        // 注意：不需要传入 roomType 和 roomDimensions
        // 这些信息会由后端 AI 在检测阶段自动识别
      }
    };

    // 等待 iframe 加载完成
    iframe.addEventListener('load', () => {
      console.log('Iframe loaded, sending furniture data...');
      iframe.contentWindow.postMessage(furnitureData, '*');
      statusText.textContent = 'Furniture data sent';
    });

    // 监听渲染状态
    window.addEventListener('message', (event) => {
      if (event.data.type === 'RENDER_STATUS') {
        const { status, progress, renderedImageUrl, error } = event.data.payload;
        
        let statusMessage = '';
        switch (status) {
          case 'idle':
            statusMessage = 'Ready - Waiting for image upload';
            break;
          case 'uploading':
            statusMessage = `Uploading image... ${progress || 0}%`;
            break;
          case 'detecting':
            statusMessage = 'Detecting room...';
            break;
          case 'rendering':
            statusMessage = 'Rendering furniture...';
            break;
          case 'completed':
            statusMessage = `Completed! Image: ${renderedImageUrl}`;
            break;
          case 'error':
            statusMessage = `Error: ${error}`;
            break;
        }
        
        statusText.textContent = statusMessage;
        console.log('Render status:', status, event.data.payload);
      }
    });
  </script>
</body>
</html>
```

## 重要说明

### 1. 图片 URL 要求

- **imageUrl**: 用于前端展示的图片，可以是任何可访问的图片 URL
- **renderImageUrl**: 用于 AI 渲染的图片，建议使用高质量、背景透明的产品图
- 如果只提供 `imageUrl`，系统会使用它进行渲染
- 如果同时提供两者，系统会优先使用 `renderImageUrl` 进行渲染

### 2. 跨域问题

- 确保图片 URL 支持跨域访问（CORS）
- 如果使用 `postMessage`，建议在生产环境中指定具体的 origin，而不是使用 `'*'`

### 3. 数据验证

- 确保 `furniture` 数组不为空
- 每个家具项必须包含 `id`、`name` 和 `imageUrl`

### 4. 渲染流程

1. 用户上传房间图片
2. 系统调用后端 AI 检测房间（自动识别房间类型和尺寸）
3. 系统使用 AI 识别的房间信息和传入的家具数据调用 multi-render API
4. 返回渲染后的图片

**重要说明**：房间类型（roomType）和房间尺寸（roomDimensions）完全由后端 AI 自动识别，父页面只需要提供家具列表即可。

## API 参考

### MultiRenderRequest

实际发送给 Decor8 AI 的请求格式：

```typescript
interface MultiRenderRequest {
  imageUrl: string;  // 用户上传的房间图片
  selectedFurniture: Array<{
    id: string;
    name: string;
    imageUrl?: string;  // 从 renderImageUrl 或 imageUrl 获取
  }>;
  roomType?: string;
  roomDimensions?: RoomDimensions;
}
```

### MultiRenderResponse

Decor8 AI 返回的响应格式：

```typescript
interface MultiRenderResponse {
  success: boolean;
  processedImageUrl: string;  // 渲染后的图片 URL
  placement: {
    placementId: string;
    productId: string;
    productName: string;
    imagePosition: { x: number; y: number };
    scale: number;
    rotation: number;
    appliedAt: string;
  };
}
```

## 故障排查

### 问题：iframe 没有收到数据

- 检查 iframe 是否已完全加载
- 确认 `postMessage` 的 origin 参数正确
- 查看浏览器控制台是否有错误信息

### 问题：渲染失败

- 检查家具数据格式是否正确
- 确认图片 URL 可访问
- 查看错误提示信息

### 问题：图片无法显示

- 检查图片 URL 的 CORS 设置
- 确认图片格式支持（JPG, PNG）
- 验证图片大小不超过限制（10MB）
