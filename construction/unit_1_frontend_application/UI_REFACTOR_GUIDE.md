# UI Refactor Implementation Guide

## 已完成
✅ 主题更新 - 使用 demo UI 的精确颜色和字体
✅ PlannerFlowPage - 新的步骤向导式页面
✅ StepCard - 可展开的步骤卡片组件
✅ RoomSetupStep - 房间设置步骤
✅ DesignVisionStep - 设计愿景步骤
✅ FurnitureSelectionStep - 家具选择步骤
✅ FinalReviewStep - 最终审核步骤
✅ RenderingCanvas - 渲染画布组件
✅ FurnitureListPanel - 家具列表面板
✅ 路由更新 - 添加 /planner 和 /planner-old 路由

## 待实施
⏳ API 集成 - 连接所有步骤到现有的 Redux actions 和 API hooks
⏳ 测试和调试 - 测试完整流程
⏳ 动画和过渡效果
⏳ 响应式优化
⏳ 加载状态优化
⏳ 错误处理优化

### 核心改动概述
将当前的标签页式界面改为步骤向导式界面，参考 `demo UI/src/app/components/DesignStudio.tsx`

### 新页面结构

```
PlannerFlowPage (新建)
├── Header (顶部导航)
├── Left Panel (步骤面板 - 480px 宽)
│   └── Vertical Stepper
│       ├── Step 1: Room Setup
│       ├── Step 2: Design Vision  
│       ├── Step 3: Furniture Selection
│       └── Step 4: Final Review
└── Right Panel (可视化区域)
    ├── Rendering Canvas (上部)
    └── Furniture List (下部 - 280px 高)
```

### 步骤 1: 创建新的 PlannerFlowPage

**文件**: `src/pages/PlannerFlowPage.tsx`

**关键功能**:
- 使用 Material-UI Stepper 组件
- 4 个步骤的状态管理
- 左右分栏布局
- 保持现有的 Redux 状态

**参考**: `demo UI/src/app/components/DesignStudio.tsx` (行 1-150)

### 步骤 2: 创建步骤组件

#### 2.1 RoomSetupStep Component
**文件**: `src/components/steps/RoomSetupStep.tsx`

**UI 元素**:
- Design Intent 选择 (Refresh Room / New Room)
- Room Type 下拉选择
- Room Size 按钮组 (Small/Medium/Large/XLarge)
- 图片上传区域
- AI 分析结果显示

**API 集成**:
```typescript
// 使用现有的 Redux actions
dispatch(configureRoom({ roomType, dimensions }));
dispatch(setRoomImage(roomImage));

// 使用现有的 API hooks
const [uploadImage] = useUploadImageMutation();
const [detectFurniture] = useDetectFurnitureMutation();
```

**参考**: `demo UI` UploadStepContent (行 500-650)

#### 2.2 DesignVisionStep Component
**文件**: `src/components/steps/DesignVisionStep.tsx`

**UI 元素**:
- Design Intent (Refresh / Redesign)
- Style Preference 下拉选择
- Budget Range 滑块 (Min/Max)
- AI 推荐显示

**API 集成**:
```typescript
dispatch(updatePreferences(preferences));
```

**参考**: `demo UI` VisionStepContent (行 650-750)

#### 2.3 FurnitureSelectionStep Component
**文件**: `src/components/steps/FurnitureSelectionStep.tsx`

**UI 元素**:
- Budget Summary 卡片
- AI Selection Note
- Furniture Cards 列表
  - 产品图片
  - 产品信息
  - AI 推荐理由
  - Swap/Remove 按钮

**API 集成**:
```typescript
const [getRecommendations] = useGetRecommendationsMutation();

// 获取推荐
const result = await getRecommendations({
  roomType,
  dimensions,
  budget,
  preferences,
}).unwrap();

// 更新状态
result.recommendations.forEach((placement) => {
  dispatch(placeFurniture(placement));
});
```

**参考**: `demo UI` SelectionStepContent (行 750-900)

#### 2.4 FinalReviewStep Component
**文件**: `src/components/steps/FinalReviewStep.tsx`

**UI 元素**:
- Ready to Generate 信息卡片
- Generate Rendering 按钮
- 渲染进度显示
- 完成后的操作按钮 (Purchase/Re-generate/Download/Share)

**API 集成**:
```typescript
// 使用现有的渲染 API (如果有)
// 或者模拟渲染过程
```

**参考**: `demo UI` ConfirmationStepContent (行 900-1000)

### 步骤 3: 创建共享组件

#### 3.1 StepCard Component
**文件**: `src/components/shared/StepCard.tsx`

**功能**:
- 可展开/折叠的步骤卡片
- 状态指示器 (pending/active/completed/locked)
- 步骤图标和标题
- 内容区域

**样式**:
```typescript
const getStepStyles = (status: StepStatus) => ({
  border: status === 'active' ? `1px solid ${brandColors.primary}` : `1px solid ${brandColors.border}`,
  backgroundColor: status === 'completed' ? brandColors.background : 
                   status === 'pending' ? brandColors.muted + '20' : 
                   brandColors.background,
});
```

**参考**: `demo UI` StepCard (行 400-500)

#### 3.2 RenderingCanvas Component
**文件**: `src/components/shared/RenderingCanvas.tsx`

**功能**:
- 显示上传的房间图片
- AI 分析状态显示
- 渲染进度显示
- 最终结果展示

**参考**: `demo UI` RenderingCanvas (行 1000-1150)

#### 3.3 FurnitureListPanel Component
**文件**: `src/components/shared/FurnitureListPanel.tsx`

**功能**:
- 横向滚动的家具列表
- 产品卡片 (图片、名称、类别、价格)
- 总价显示

**参考**: `demo UI` FurnitureListPanel (行 1150-1250)

### 步骤 4: 更新路由

**文件**: `src/main.tsx`

```typescript
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/planner" element={<PlannerFlowPage />} />
  <Route path="/planner-old" element={<PlannerPage />} /> {/* 保留旧版本 */}
</Routes>
```

### 步骤 5: 更新 HomePage

**文件**: `src/pages/HomePage.tsx`

**改动**:
- 更新按钮颜色使用新主题
- 确保 "Get Started" 导航到 `/planner`

### 关键设计原则

#### 颜色使用
```typescript
// 主要操作
backgroundColor: brandColors.primary,
color: brandColors.primaryForeground,

// 次要操作
backgroundColor: brandColors.secondary,
color: brandColors.secondaryForeground,

// 边框
border: `1px solid ${brandColors.border}`,

// 背景
backgroundColor: brandColors.background,

// 文字
color: brandColors.foreground,
color: brandColors.mutedForeground, // 次要文字
```

#### 间距
```typescript
// 使用 spacing 系统
padding: spacing.lg / 8,  // 32px / 8 = 4
margin: spacing.md / 8,   // 24px / 8 = 3
gap: spacing.sm / 8,      // 16px / 8 = 2
```

#### 圆角
```typescript
borderRadius: '8px', // 统一使用 8px
```

#### 字体
```typescript
// 标题
fontFamily: typography.display.fontFamily,
fontSize: typography.sizes.h5,

// 正文
fontFamily: typography.display.fontFamily,
fontSize: typography.sizes.base,

// 按钮
fontFamily: typography.body.fontFamily,
fontSize: typography.sizes.button,
textTransform: 'uppercase',
letterSpacing: '2.8px',
```

### API 集成保持不变

所有现有的 API 调用保持不变：

```typescript
// Redux Hooks
const dispatch = useDispatch<AppDispatch>();
const session = useSelector((state: RootState) => state.session);
const design = useSelector((state: RootState) => state.design);
const cart = useSelector((state: RootState) => state.cart);

// API Hooks
const [getRecommendations] = useGetRecommendationsMutation();
const [sendChat] = useSendChatMessageMutation();
const [uploadImage] = useUploadImageMutation();
const [detectFurniture] = useDetectFurnitureMutation();
```

### 状态管理保持不变

所有 Redux actions 保持不变：

```typescript
// Session actions
dispatch(configureRoom(config));
dispatch(updatePreferences(prefs));
dispatch(addChatMessage(message));

// Design actions
dispatch(placeFurniture(placement));
dispatch(removeFurniture(placementId));
dispatch(setRoomConfig(config));
dispatch(setRoomImage(roomImage));

// Cart actions
dispatch(addItem(cartItem));
dispatch(updateQuantity({ itemId, quantity }));
dispatch(removeItem(itemId));

// UI actions
dispatch(addNotification({ type, message }));
```

### 测试清单

- [ ] 主题颜色正确应用
- [ ] 步骤导航正常工作
- [ ] 图片上传功能正常
- [ ] AI 推荐 API 调用成功
- [ ] 家具选择和取消选择正常
- [ ] 购物车功能正常
- [ ] 聊天功能正常
- [ ] 响应式布局正常
- [ ] 所有按钮和交互正常

### 优先级

**高优先级** (核心流程):
1. ✅ 主题更新
2. ✅ PlannerFlowPage 骨架
3. ✅ RoomSetupStep
4. ✅ DesignVisionStep
5. ✅ FurnitureSelectionStep
6. ✅ FinalReviewStep

**中优先级** (增强体验):
7. ✅ RenderingCanvas
8. ✅ FurnitureListPanel
9. ✅ StepCard 组件
10. ⏳ 动画和过渡效果

**低优先级** (优化):
11. ⏳ 响应式优化
12. ⏳ 加载状态优化
13. ⏳ 错误处理优化

### 实施时间估算

- PlannerFlowPage: 2-3 小时
- 4 个步骤组件: 4-6 小时
- 共享组件: 2-3 小时
- 测试和调试: 2-3 小时
- **总计**: 10-15 小时

### 下一步行动

1. 创建 `PlannerFlowPage.tsx` 骨架
2. 实现 `RoomSetupStep.tsx`
3. 测试第一步的完整流程
4. 逐步实现其他步骤
5. 集成所有组件
6. 全面测试

### 参考文件

- **Demo UI**: `demo UI/src/app/components/DesignStudio.tsx`
- **主题**: `src/theme/brandTheme.ts`
- **现有页面**: `src/pages/PlannerPage.tsx`
- **Redux Store**: `src/store/`
- **API Services**: `src/services/aiApi.ts`

### 注意事项

1. **不要修改** Redux store 结构
2. **不要修改** API 调用接口
3. **保持** 所有业务逻辑不变
4. **只更新** UI 组件和布局
5. **保留** 旧版本作为备份 (`/planner-old`)
6. **测试** 每个步骤后再继续下一步

### 完成标准

- ✅ UI 与 demo UI 视觉一致
- ✅ 所有功能正常工作
- ✅ API 集成无问题
- ✅ Redux 状态管理正常
- ✅ 响应式布局良好
- ✅ 无 TypeScript 错误
- ✅ 无控制台错误
