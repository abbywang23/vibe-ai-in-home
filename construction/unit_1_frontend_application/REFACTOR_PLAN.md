# Frontend Refactor Plan - Optimized User Flow

## 目标
根据优化后的用户流程重新实现前端，提供更清晰、更直观的用户体验。

## 当前状态 vs 目标状态

### 当前流程（基于标签页）
1. 用户看到 3 个标签：Configure, Preferences, Chat
2. 在 Configure 中设置房间信息
3. 在 Preferences 中设置偏好并获取推荐
4. 在 Chat 中与 AI 交互

### 目标流程（基于步骤向导）
1. **Landing Page** - 介绍和开始
2. **Upload Photo** - 上传房间照片（第一步）
3. **Room Setup** - 选择房间类型和输入尺寸
4. **Mode Selection** - 选择模式（替换家具 vs 装修空房间）
5. **Path A/B** - 根据模式进入不同路径
6. **Results** - 查看 AI 生成的结果
7. **Visualization** - 2D/3D 可视化
8. **Shopping** - 购物车和结账

## 新组件结构

```
src/
├── pages/
│   ├── HomePage.tsx ✅ (已存在，需更新)
│   ├── PlannerFlowPage.tsx ⭐ (新建 - 主流程页面)
│   └── PlannerPage.tsx (保留作为备份)
│
├── components/
│   ├── flow/ ⭐ (新建目录 - 流程组件)
│   │   ├── RoomPhotoUpload.tsx
│   │   ├── RoomSetup.tsx
│   │   ├── ModeSelection.tsx
│   │   ├── PathAReplace.tsx
│   │   ├── PathBFurnish.tsx
│   │   ├── ResultsView.tsx
│   │   └── VisualizationPanel.tsx
│   │
│   ├── shared/ ⭐ (新建目录 - 共享组件)
│   │   ├── ImageUploader.tsx
│   │   ├── BudgetInput.tsx
│   │   ├── CollectionSelector.tsx
│   │   ├── ProductCard.tsx
│   │   └── ProgressStepper.tsx
│   │
│   └── (现有组件保留)
│       ├── ChatPanel.tsx
│       ├── ShoppingCart.tsx
│       ├── FurnitureList.tsx
│       └── ...
```

## 实现步骤

### Phase 1: 核心流程组件 (优先级：高)

#### 1.1 RoomPhotoUpload Component
**功能：**
- 拖拽上传区域
- 图片预览
- 文件验证（格式、大小）
- 上传进度显示

**Why:** 建立视觉上下文，让 AI 更好地理解空间

#### 1.2 RoomSetup Component
**功能：**
- 显示上传的照片
- 房间类型选择（Living Room, Bedroom, etc.）
- 尺寸输入（长、宽、高）
- 单位切换（米/英尺）
- AI 可能建议房间类型和尺寸

**Why:** 收集房间基本信息

#### 1.3 ModeSelection Component
**功能：**
- 两个大卡片：
  - "Replace Existing Furniture" - 适用于已有家具的房间
  - "Furnish Empty Room" - 适用于空房间
- 每个模式的视觉说明
- AI 可能根据照片建议模式

**Why:** 根据房间状态分叉流程

### Phase 2: 路径 A - 替换家具 (优先级：高)

#### 2.1 PathAReplace Component
**子步骤：**
1. **AI Furniture Detection** - 显示检测到的家具
2. **Select Items to Replace** - 用户选择要替换的项目
3. **Set Budget** - 输入预算
4. **Select Collections** (可选) - 选择偏好的系列
5. **Confirm & Generate** - 确认并触发 AI 渲染

**Why:** 引导用户完成家具替换流程

### Phase 3: 路径 B - 装修空房间 (优先级：高)

#### 3.1 PathBFurnish Component
**子步骤：**
1. **AI Empty Room Confirmation** - 确认房间为空
2. **Set Budget** - 输入预算
3. **Select Style & Collections** - 选择风格和系列
4. **Specify Categories** (可选) - 指定家具类别
5. **Confirm & Generate** - 确认并触发 AI 装修

**Why:** 引导用户完成空房间装修流程

### Phase 4: 结果展示 (优先级：高)

#### 4.1 ResultsView Component
**功能：**
- 显示 AI 生成的渲染图
- Before/After 滑块对比
- 推荐产品列表
- 总价 vs 预算对比
- AI Chat 集成（用于调整）
- 切换到可视化视图

**Why:** 清晰展示 AI 结果，支持迭代调整

### Phase 5: 可视化和购物 (优先级：中)

#### 5.1 VisualizationPanel Component
**功能：**
- 2D 平面图
- 3D 视图（如果可用）
- 旋转和缩放控制
- 尺寸标注切换
- 产品详情查看

#### 5.2 Shopping Integration
**功能：**
- 产品列表
- 添加到购物车
- 购物车管理
- 导出和分享

### Phase 6: 共享组件 (优先级：中)

创建可复用的组件：
- ImageUploader
- BudgetInput
- CollectionSelector
- ProductCard
- ProgressStepper

## 状态管理更新

### 新增 Redux Slices

```typescript
// flowSlice.ts
interface FlowState {
  currentStep: number;
  roomImage: File | null;
  roomType: string;
  dimensions: RoomDimensions;
  mode: 'replace' | 'furnish' | null;
  detectedFurniture: DetectedItem[];
  selectedItems: string[];
  budget: number;
  selectedCollections: string[];
  aiResults: AIResults | null;
}
```

## 路由更新

```typescript
// main.tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/planner" element={<PlannerFlowPage />} /> {/* 新流程 */}
  <Route path="/planner-old" element={<PlannerPage />} /> {/* 旧版本备份 */}
</Routes>
```

## API 集成

### 新增 API Endpoints

```typescript
// aiApi.ts
export const aiApi = createApi({
  endpoints: (builder) => ({
    // 现有的...
    
    // 新增
    uploadRoomImage: builder.mutation<ImageUploadResponse, File>(),
    detectFurniture: builder.mutation<DetectionResponse, string>(),
    estimateDimensions: builder.mutation<DimensionsResponse, string>(),
    suggestRoomType: builder.mutation<RoomTypeResponse, string>(),
    generateReplacement: builder.mutation<ReplacementResponse, ReplacementRequest>(),
    generateFurnishing: builder.mutation<FurnishingResponse, FurnishingRequest>(),
  }),
});
```

## 设计系统应用

所有新组件将使用：
- `brandColors` - Castlery 品牌色
- `spacing` - 8px 间距系统
- `typography` - Aime 和 Sanomat Sans 字体
- Material-UI 组件与品牌主题

## 测试策略

1. **单元测试** - 每个新组件
2. **集成测试** - 完整流程
3. **E2E 测试** - 关键用户路径
4. **可访问性测试** - WCAG 2.1 AA

## 迁移策略

### 选项 A: 渐进式迁移（推荐）
1. 保留旧版本在 `/planner-old`
2. 新版本在 `/planner`
3. 用户可以选择使用哪个版本
4. 逐步完善新版本
5. 最终移除旧版本

### 选项 B: 一次性替换
1. 完全实现新流程
2. 彻底测试
3. 一次性替换旧版本

## 时间估算

- **Phase 1**: 2-3 天（核心流程组件）
- **Phase 2**: 1-2 天（路径 A）
- **Phase 3**: 1-2 天（路径 B）
- **Phase 4**: 2-3 天（结果展示）
- **Phase 5**: 2-3 天（可视化和购物）
- **Phase 6**: 1-2 天（共享组件）
- **测试和优化**: 2-3 天

**总计**: 11-18 天

## 下一步行动

1. ✅ 创建 PlannerFlowPage 骨架
2. ⏳ 实现 RoomPhotoUpload 组件
3. ⏳ 实现 RoomSetup 组件
4. ⏳ 实现 ModeSelection 组件
5. ⏳ 实现 PathA 和 PathB 组件
6. ⏳ 实现 ResultsView 组件
7. ⏳ 集成现有的可视化和购物组件
8. ⏳ 测试完整流程
9. ⏳ 更新文档

## 问题和决策

### 需要确认：
1. 是否保留旧版本作为备份？
2. 是否需要支持直接跳到某个步骤？
3. 是否需要保存进度功能？
4. 后端 API 是否需要相应更新？
5. 是否需要添加分析和跟踪？

### 技术决策：
- ✅ 使用 Material-UI Stepper 组件
- ✅ 使用 Redux 管理流程状态
- ✅ 使用 RTK Query 处理 API 调用
- ✅ 保持品牌设计系统一致性
- ⏳ 考虑添加动画过渡效果

## 参考文档

- `inception/user_stories.md` - 优化后的用户故事
- `construction/unit_1_frontend_application/domain_model.md` - 领域模型
- `construction/unit_1_frontend_application/src/theme/brandTheme.ts` - 品牌主题
