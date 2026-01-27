# 流程重构进度文档
## Flow Redesign Progress

> **目标**：重构用户流程，优化交互体验，分三步完成房间设置和家具选择

---

## 📋 新流程设计

### 第一步：基础信息设置
- ✅ Choose Mode（选择模式：替换现有家具 / 空房间AI装修）
- ✅ Upload Room Photo（上传房间照片）
- ✅ Room Type & Dimensions（房间类型和尺寸）
- ✅ 点击 Continue 进入下一步

### 第二步：偏好设置
- ⚠️ 根据第一步的 room type 展示不同 room type 支持的家具类型
- ✅ 选择想替换的家具类型（多选）
- ✅ 选择预算
- ⚠️ 展示家具的 collection，支持选择 collection
- ✅ 点击 Confirm 进入下一步

### 第三步：家具选择与渲染
- ⚠️ 展示家具列表（基于第二步的选择）
- ⚠️ 默认渲染其中一个在右侧展示
- ⚠️ 支持选择其它家具列表进行重新渲染后展示

---

## 🔍 现有接口和能力检查

### ✅ 已支持的接口

#### 1. 产品搜索
- **接口**: `GET /api/ai/products/search`
- **参数**: 
  - `q` (string, optional): 搜索关键词
  - `categories` (string[], optional): 家具类别过滤
  - `collections` (string[], optional): 系列过滤（通过 tags）
  - `maxPrice` (number, optional): 最大价格
  - `limit` (number, optional): 结果数量限制
- **状态**: ✅ 完全支持

#### 2. 获取分类
- **接口**: `GET /api/ai/products/categories`
- **返回**: 所有可用的产品分类列表
- **状态**: ✅ 完全支持

#### 3. 获取产品详情
- **接口**: `GET /api/ai/products/:id`
- **状态**: ✅ 完全支持

#### 4. 图片上传
- **接口**: `POST /api/ai/upload`
- **状态**: ✅ 完全支持

#### 5. 家具检测
- **接口**: `POST /api/ai/detect`
- **状态**: ✅ 完全支持

#### 6. 家具替换渲染
- **接口**: `POST /api/ai/replace`
- **参数**: imageUrl, detectedItemId, replacementProductId
- **状态**: ✅ 完全支持

#### 7. 家具放置渲染
- **接口**: `POST /api/ai/place`
- **参数**: imageUrl, productId, imagePosition, rotation, scale
- **状态**: ✅ 完全支持

---

### ⚠️ 需要新增或增强的接口

#### 1. 根据房间类型获取支持的家具类型
- **需求**: 根据 room type 返回该房间类型支持的家具类别列表
- **当前状态**: 
  - ✅ 后端有内部逻辑 `getRoomTypePriorities()` 在 `RecommendationService.ts`
  - ❌ 没有公开的 API 接口
- **优先级**: 🔴 高
- **实现方案**:
  ```typescript
  // 新增接口
  GET /api/ai/products/categories/by-room-type?roomType={roomType}
  
  // 返回格式
  {
    "success": true,
    "roomType": "living_room",
    "categories": [
      { "id": "sofa", "name": "Sofa", "priority": 1 },
      { "id": "table", "name": "Table", "priority": 2 },
      { "id": "chair", "name": "Chair", "priority": 3 },
      { "id": "storage", "name": "Storage", "priority": 4 }
    ]
  }
  ```

#### 2. 获取所有 Collections 列表
- **需求**: 获取所有可用的产品系列（collections）
- **当前状态**: 
  - ✅ 产品数据中有 `collection` 字段
  - ✅ 搜索接口支持 `collections` 参数过滤
  - ❌ 没有获取所有 collections 列表的接口
- **优先级**: 🔴 高
- **实现方案**:
  ```typescript
  // 新增接口
  GET /api/ai/products/collections
  
  // 返回格式
  {
    "success": true,
    "collections": [
      { "id": "sideboard", "name": "Sideboard", "productCount": 45 },
      { "id": "dining_room_sets", "name": "Dining Room Sets", "productCount": 12 },
      { "id": "desks", "name": "Desks", "productCount": 8 }
    ]
  }
  ```

#### 3. 批量获取产品列表（用于第三步）
- **需求**: 根据选择的类别、系列、预算获取产品列表
- **当前状态**: 
  - ✅ `GET /api/ai/products/search` 已支持
  - ⚠️ 可能需要增强返回更多产品信息（如尺寸、图片等）
- **优先级**: 🟡 中
- **实现方案**: 使用现有接口，可能需要调整 limit 参数

#### 4. 批量渲染多个家具
- **需求**: 一次性渲染多个家具到图片中
- **当前状态**: 
  - ✅ 有单个家具替换接口 `/api/ai/replace`
  - ✅ 有单个家具放置接口 `/api/ai/place`
  - ❌ 没有批量渲染接口
- **优先级**: 🟡 中
- **实现方案**:
  ```typescript
  // 新增接口
  POST /api/ai/render-multiple
  
  // 请求格式
  {
    "imageUrl": string,
    "replacements": [
      { "detectedItemId": string, "replacementProductId": string },
      ...
    ],
    "placements": [
      { "productId": string, "position": {x, y}, "rotation": number, "scale": number },
      ...
    ]
  }
  
  // 返回格式
  {
    "success": true,
    "processedImageUrl": string,
    "appliedReplacements": [...],
    "appliedPlacements": [...]
  }
  ```

---

## 📝 实现进度

### 第一步：基础信息设置 ✅

#### 组件：`RoomInformationSetup`
- ✅ 已创建组件
- ✅ 支持模式选择（替换/空房间）
- ✅ 支持图片上传
- ✅ 支持房间类型和尺寸设置
- ✅ 步骤式引导（Stepper）
- ✅ 数据验证

#### 集成状态
- ✅ 已集成到 `PlannerPage`
- ✅ 图片上传后显示在右侧
- ✅ 完成后自动导航到下一步

**状态**: ✅ 完成

---

### 第二步：偏好设置 ⚠️

#### 需要实现的功能

1. **根据房间类型展示家具类型** ⚠️
   - [x] ✅ 后端接口已完成：`GET /api/ai/products/categories/by-room-type`
   - [ ] 创建新组件 `FurnitureCategorySelector`
   - [ ] 调用新接口获取房间类型对应的家具类别
   - [ ] 显示家具类别列表（带优先级）
   - [ ] 支持多选

2. **预算选择** ✅
   - ✅ 已有 `PreferencesPanel` 组件
   - ✅ 支持预算输入
   - ⚠️ 需要集成到新流程

3. **Collection 选择** ⚠️
   - [x] ✅ 后端接口已完成：`GET /api/ai/products/collections`
   - [ ] 创建新组件 `CollectionSelector`
   - [ ] 调用新接口获取所有 collections
   - [ ] 显示 collection 列表
   - [ ] 支持多选

4. **整合组件** ⚠️
   - [ ] 创建新组件 `PreferenceSelectionStep`
   - [ ] 整合家具类型选择、预算、collection 选择
   - [ ] 添加 Confirm 按钮

**状态**: ⚠️ 进行中（接口已完成，需要新增组件）

---

### 第三步：家具选择与渲染 ⚠️

#### 需要实现的功能

1. **家具列表展示** ⚠️
   - [ ] 创建新组件 `ProductListDisplay`
   - [ ] 根据第二步的选择调用搜索接口
   - [ ] 显示产品卡片（图片、名称、价格）
   - [ ] 支持选择产品

2. **默认渲染** ⚠️
   - [ ] 选择第一个产品（或推荐的产品）
   - [ ] 调用渲染接口
   - [ ] 在右侧显示渲染结果

3. **重新渲染** ⚠️
   - [ ] 用户选择其他产品
   - [ ] 调用渲染接口替换当前渲染
   - [ ] 更新右侧显示

4. **批量渲染支持** ⏸️
   - [ ] 暂不实现（按需求先只支持单个家具渲染）
   - [ ] 后续可考虑批量渲染功能

**状态**: ⚠️ 未开始（需要新增组件，单个渲染接口已存在）

---

## 🔧 需要开发的任务

### 后端任务

#### 高优先级 🔴

1. **新增接口：根据房间类型获取家具类别** ✅
   - 文件: `construction/unit_2_ai_service/src/controllers/productController.ts`
   - 方法: `getCategoriesByRoomType`
   - 路由: `GET /api/ai/products/categories/by-room-type`
   - 状态: ✅ 已完成
   - 配置: `products.yaml` 中添加了 `room_type_categories` 配置
   - 实现: 服务启动时加载配置，固定返回

2. **新增接口：获取所有 Collections** ✅
   - 文件: `construction/unit_2_ai_service/src/controllers/productController.ts`
   - 方法: `getCollections`
   - 路由: `GET /api/ai/products/collections`
   - 文件: `construction/unit_2_ai_service/src/clients/ProductServiceClient.ts`
   - 方法: `getCollections()` - 从产品数据中提取所有唯一的 collection
   - 状态: ✅ 已完成
   - 配置: `products.yaml` 中添加了 `collections` 配置
   - 实现: 服务启动时加载配置，固定返回

#### 中优先级 🟡

3. **增强接口：批量渲染**
   - 文件: `construction/unit_2_ai_service/src/controllers/imageController.ts`
   - 方法: `renderMultiple`
   - 路由: `POST /api/ai/render-multiple`
   - 预计时间: 4小时

### 前端任务

#### 高优先级 🔴

1. **创建组件：FurnitureCategorySelector**
   - 文件: `construction/unit_1_frontend_application/src/components/FurnitureCategorySelector.tsx`
   - 功能: 根据房间类型显示家具类别，支持多选
   - 预计时间: 2小时

2. **创建组件：CollectionSelector**
   - 文件: `construction/unit_1_frontend_application/src/components/CollectionSelector.tsx`
   - 功能: 显示所有 collections，支持多选
   - 预计时间: 2小时

3. **创建组件：PreferenceSelectionStep**
   - 文件: `construction/unit_1_frontend_application/src/components/PreferenceSelectionStep.tsx`
   - 功能: 整合第二步的所有选择项
   - 预计时间: 3小时

4. **更新 API 服务** ✅
   - 文件: `construction/unit_1_frontend_application/src/services/aiApi.ts`
   - 新增: `useGetCategoriesByRoomTypeQuery`
   - 新增: `useGetCollectionsQuery`
   - 状态: ✅ 已完成

#### 中优先级 🟡

5. **创建组件：ProductListDisplay**
   - 文件: `construction/unit_1_frontend_application/src/components/ProductListDisplay.tsx`
   - 功能: 显示产品列表，支持选择
   - 预计时间: 3小时

6. **创建组件：ProductSelectionStep**
   - 文件: `construction/unit_1_frontend_application/src/components/ProductSelectionStep.tsx`
   - 功能: 第三步的完整流程
   - 预计时间: 4小时

7. **更新 RoomInformationSetup**
   - 文件: `construction/unit_1_frontend_application/src/components/RoomInformationSetup.tsx`
   - 调整: 修改步骤顺序，第一步改为模式选择
   - 预计时间: 2小时

---

## 📊 进度总览

| 步骤 | 状态 | 完成度 | 备注 |
|------|------|--------|------|
| 第一步：基础信息设置 | ✅ 完成 | 100% | 已实现并集成 |
| 第二步：偏好设置 | ✅ 完成 | 100% | 所有组件已完成并集成 |
| 第三步：家具选择与渲染 | ✅ 完成 | 100% | 所有组件已完成并集成 |
| 后端接口开发 | ✅ 完成 | 100% | 已新增2个接口 |
| 前端API服务 | ✅ 完成 | 100% | 已更新API服务 |
| 前端组件开发 | ✅ 完成 | 100% | 所有新组件已创建 |
| PlannerPage 集成 | ✅ 完成 | 100% | 新流程已完全集成 |

---

## 🎯 下一步行动

### 已完成 ✅

**所有核心功能已完成！**

1. ✅ **后端：新增根据房间类型获取家具类别接口**
2. ✅ **后端：新增获取 Collections 接口**
3. ✅ **前端：更新 API 服务**
4. ✅ **前端：创建 FurnitureCategorySelector 组件**
5. ✅ **前端：创建 CollectionSelector 组件**
6. ✅ **前端：创建 PreferenceSelectionStep 组件**
7. ✅ **前端：创建 ProductListDisplay 组件**
8. ✅ **前端：创建 ProductSelectionStep 组件**
9. ✅ **前端：更新 PlannerPage 集成新流程**

### 🎉 流程重构完成

新的三步式用户流程已经完全实现：

1. **第一步：基础信息设置** - 用户选择模式、上传照片、设置房间信息
2. **第二步：偏好设置** - 根据房间类型选择家具类别、预算、风格系列
3. **第三步：家具选择与渲染** - 浏览推荐家具、实时渲染预览、完成设计

### 可选增强功能

- **批量渲染接口** - 可以在未来需要时实现，用于一次性渲染多个家具

---

## 📌 注意事项

1. **接口兼容性**: 新增接口需要保持向后兼容，不影响现有功能

2. **数据格式**: Collections 数据需要从产品 YAML 文件中提取，确保数据完整性

3. **性能考虑**: 第三步的渲染可能需要较长时间，需要添加加载状态和进度提示

4. **错误处理**: 所有新接口和组件都需要完善的错误处理

5. **用户体验**: 每步都需要清晰的反馈和引导

---

## 📝 更新日志

### 2026-01-27

#### 初始阶段
- ✅ 创建文档
- ✅ 检查现有接口和能力
- ✅ 识别需要新增的接口和组件
- ✅ 制定实现计划

#### 接口开发完成
- ✅ 在 `products.yaml` 中添加 `room_type_categories` 配置
- ✅ 在 `products.yaml` 中添加 `collections` 配置
- ✅ 更新 `ProductServiceClient` 加载配置
- ✅ 添加 `getCategoriesByRoomType()` 方法
- ✅ 添加 `getCollections()` 方法
- ✅ 更新 `ProductController` 添加两个新接口
- ✅ 更新路由配置添加新路由
- ✅ 更新前端 API 服务添加新的查询 hooks

#### 组件开发完成
- ✅ 创建 `FurnitureCategorySelector` 组件
- ✅ 创建 `CollectionSelector` 组件
- ✅ 创建 `PreferenceSelectionStep` 组件
- ✅ 创建 `ProductListDisplay` 组件
- ✅ 创建 `ProductSelectionStep` 组件

#### 集成完成
- ✅ 更新 `PlannerPage` 集成新的三步式流程
- ✅ 实现步骤间的数据传递和状态管理
- ✅ 添加完成状态和重新开始功能
- ✅ 修复所有 TypeScript 编译错误

#### 🎉 流程重构完成
**新的用户流程已经完全实现并可以使用！**

#### 🔧 3D功能移除
- ✅ 移除了所有3D相关的功能和接口
- ✅ 简化为纯2D图像处理流程
- ✅ 更新了类型定义，移除 Position3D 和 CameraAngle
- ✅ 简化了 VisualizationCanvas 组件
- ✅ 更新了所有相关组件和服务

---

## 🔗 相关文档

- [优化后的用户流程](./OPTIMIZED_USER_FLOW.md)
- [当前流程](./CURRENT_FLOW.md)
- [产品数据](./products.yaml)
