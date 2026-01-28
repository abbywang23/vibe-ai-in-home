# 图片上传流程说明

## 新的上传流程

### 1. 前端直接上传到 Cloudinary
- 使用 `uploadToCloudinary()` 函数
- 先从后端获取签名：`GET /api/ai/upload/signature`
- 然后直接上传到 Cloudinary：`POST https://api.cloudinary.com/v1_1/{cloudName}/image/upload`
- 返回 Cloudinary URL（如 `https://res.cloudinary.com/...`）

### 2. 将 Cloudinary URL 传给后端
- 前端获得 Cloudinary URL 后，直接传给后端的检测接口
- 后端检测到是 HTTPS URL（Cloudinary），会直接使用，不会再次上传

## 优势

1. **减少后端负载**：文件不再经过后端服务器
2. **提高上传速度**：直接上传到 Cloudinary，减少中转
3. **避免二次上传**：后端不需要再次上传到 Cloudinary
4. **支持上传进度**：前端可以显示上传进度

## 代码变更

### 前端 (`src/services/aiApi.ts`)
- `uploadImage()` 方法现在使用 `uploadToCloudinary()`
- 添加了文件验证
- 支持上传进度回调

### 后端
- 无需修改，后端会自动识别 Cloudinary URL 并直接使用
- `/api/ai/upload/signature` 接口已存在，用于生成上传签名

## 使用示例

```typescript
// 上传图片（带进度回调）
const uploadResponse = await aiApi.uploadImage(file, (percentage) => {
  console.log(`上传进度: ${percentage}%`);
});

// uploadResponse.imageUrl 是 Cloudinary URL
// 可以直接传给后端接口
const detectResponse = await aiApi.detectRoom({
  imageUrl: uploadResponse.imageUrl,
  roomDimensions: roomDimensions
});
```
