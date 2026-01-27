# 房间图片上传功能说明

## 功能概述

已成功添加房间图片上传和处理功能，支持空房间和非空房间两种场景。

## 新增组件

### 1. RoomImageUpload
**文件**: `src/components/RoomImageUpload.tsx`

**功能**:
- 图片上传界面
- 拖拽上传支持
- 图片预览
- 文件验证（格式、大小）
- 上传状态显示

**支持格式**: JPEG, PNG
**最大文件大小**: 10MB

### 2. FurnitureDetectionPanel
**文件**: `src/components/FurnitureDetectionPanel.tsx`

**功能**:
- 显示 AI 检测到的家具列表
- 显示检测置信度
- 查看替换建议按钮
- 一键替换功能
- 家具位置信息

**适用场景**: 非空房间（已有家具）

### 3. EmptyRoomPlacementPanel
**文件**: `src/components/EmptyRoomPlacementPanel.tsx`

**功能**:
- 产品搜索
- 家具选择
- 位置调整（X, Y 坐标）
- 旋转调整（0-360°）
- 缩放调整（0.5x - 2.0x）
- 放置家具到图片

**适用场景**: 空房间

### 4. RoomImageManager
**文件**: `src/components/RoomImageManager.tsx`

**功能**:
- 统一管理图片上传流程
- 自动触发 AI 检测
- 根据检测结果显示对应面板
- 显示处理后的图片
- 显示已应用的操作

### 5. ImageProcessingService
**文件**: `src/services/ImageProcessingService.ts`

**功能**:
- 图片验证（格式、大小）
- 准备上传数据（FormData）
- 创建预览 URL
- 清理预览 URL

## 使用流程

### 场景 1: 空房间

1. **上传图片**
   - 点击上传区域或拖拽图片
   - 系统验证图片格式和大小
   - 显示预览

2. **AI 检测**
   - 自动触发 AI 分析
   - 检测房间是否为空
   - 显示"空房间检测"提示

3. **放置家具**
   - 搜索想要的家具
   - 选择产品
   - 调整位置、旋转、缩放
   - 点击"放置家具"

4. **查看结果**
   - 显示处理后的图片
   - 列出已放置的家具
   - 可继续添加更多家具

### 场景 2: 非空房间（已有家具）

1. **上传图片**
   - 上传包含家具的房间照片
   - 显示预览

2. **AI 检测**
   - 自动检测现有家具
   - 显示检测到的家具列表
   - 显示置信度

3. **替换家具**
   - 查看每个家具的替换建议
   - 选择要替换的家具
   - 点击"替换"或"查看替换建议"

4. **查看结果**
   - 显示替换后的图片
   - 列出已应用的替换
   - 可继续替换其他家具

## 集成到 PlannerPage

### 新增标签页
在左侧面板添加了"Image"标签页（第3个标签）

### 标签页顺序
1. Configure - 房间配置
2. Preferences - 偏好设置
3. **Image** - 图片上传 ⭐ 新增
4. Chat - AI 聊天
5. Cart - 购物车

### 状态管理
使用 Redux `designSlice` 中的 `roomImage` 状态存储：
- 原始图片 URL
- 处理后图片 URL
- 检测到的家具
- 应用的替换
- 应用的放置
- 是否为空房间

## API 集成

### 已集成的 API 端点

1. **uploadImage** - 上传图片
   ```typescript
   POST /api/ai/upload
   Body: FormData with image file
   Response: { imageUrl: string }
   ```

2. **detectFurniture** - 检测家具
   ```typescript
   POST /api/ai/detect
   Body: { imageUrl, roomDimensions }
   Response: { detectedItems[], isEmpty: boolean }
   ```

3. **replaceFurniture** - 替换家具
   ```typescript
   POST /api/ai/replace
   Body: { imageUrl, detectedItemId, replacementProductId }
   Response: { processedImageUrl, replacement }
   ```

4. **placeFurniture** - 放置家具（空房间）
   ```typescript
   POST /api/ai/place
   Body: { imageUrl, productId, imagePosition, rotation, scale }
   Response: { processedImageUrl, placement }
   ```

## 用户体验特性

### 1. 自动化流程
- 上传后自动触发检测
- 无需手动点击"检测"按钮

### 2. 实时反馈
- 上传进度显示
- 检测状态提示
- 处理状态显示
- 成功/错误通知

### 3. 友好提示
- 空房间：显示蓝色信息提示
- 非空房间：显示绿色成功提示
- 错误：显示红色错误提示

### 4. 操作记录
- 显示已放置的家具列表
- 显示已应用的替换列表
- 可查看处理后的图片

## 错误处理

### 图片验证错误
- 格式不支持：提示只支持 JPEG/PNG
- 文件过大：提示最大 10MB

### 上传错误
- 网络错误：提示重试
- 服务器错误：显示错误信息

### 检测错误
- AI 服务不可用：提示稍后重试
- 检测失败：显示错误信息

### 处理错误
- 替换失败：提示重试
- 放置失败：提示重试

## 技术实现

### 图片预览
使用 `URL.createObjectURL()` 创建本地预览，避免上传前等待

### 内存管理
使用 `URL.revokeObjectURL()` 清理预览 URL，防止内存泄漏

### 表单数据
使用 `FormData` 上传文件，支持多部分表单数据

### 状态同步
所有操作结果同步到 Redux store，保持状态一致

## 用户故事覆盖

### 已实现 ✅
- US-2.5: 上传房间照片
- US-4.1: 上传房间图片
- US-4.2: AI 家具检测
- US-4.3: 查看替换建议
- US-4.4: 应用家具替换
- US-4.5: 向空房间添加家具

## 测试建议

### 测试场景 1: 空房间
1. 上传空房间照片
2. 验证显示"空房间检测"提示
3. 搜索并选择家具
4. 调整位置、旋转、缩放
5. 放置家具
6. 验证显示处理后的图片

### 测试场景 2: 非空房间
1. 上传包含家具的照片
2. 验证显示检测到的家具列表
3. 查看置信度
4. 点击"替换"按钮
5. 验证显示处理后的图片

### 测试场景 3: 错误处理
1. 上传超大文件（>10MB）
2. 上传不支持的格式（如 GIF）
3. 验证错误提示

## 下一步改进

### 短期
1. 添加多个替换建议选择
2. 支持拖拽调整家具位置
3. 添加撤销/重做功能

### 中期
1. 支持批量替换
2. 添加家具样式过滤
3. 实时预览调整效果

### 长期
1. AR 预览支持
2. 3D 模型集成
3. 多角度视图

## 总结

房间图片上传功能已完整实现，支持：
- ✅ 图片上传和验证
- ✅ AI 自动检测
- ✅ 空房间家具放置
- ✅ 非空房间家具替换
- ✅ 实时反馈和通知
- ✅ 错误处理
- ✅ 状态管理

用户现在可以通过上传房间照片，使用 AI 辅助进行家具规划和替换，大大提升了用户体验。
