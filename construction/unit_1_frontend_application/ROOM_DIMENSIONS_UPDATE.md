# Room Dimensions Update - Custom Input

## 更新日期
2025-01-28

## 更新内容

### 功能优化
将 Room Setup 步骤中的 Room Size 预设选项改为用户自定义输入房间尺寸，提供更精确和灵活的房间配置。

### 具体变更

#### 1. 数据结构变更
**RoomSetup 接口**
```typescript
// Before
interface RoomSetup {
  intent: RoomIntent;
  size: RoomSize; // 'small' | 'medium' | 'large' | 'xlarge'
  roomType: string;
}

// After
interface RoomSetup {
  intent: RoomIntent;
  roomType: string;
  width: number;  // 宽度（英尺）
  length: number; // 长度（英尺）
}
```

#### 2. UI 组件变更

**原设计（Before）**
- 4个预设按钮：Small / Medium / Large / X-Large
- 显示面积范围（如 150-300 sq ft）
- 用户只能选择预设尺寸

**新设计（After）**
- 标题：Room Dimensions (feet)
- 两个数字输入框：
  - Width（宽度）
  - Length（长度）
- 实时计算显示：
  - 格式：`12' × 15' (180 sq ft)`
  - 带尺子图标

#### 3. 尺寸转换逻辑

**getRoomDimensionsFromSize 函数更新**
```typescript
// Before: 根据预设尺寸返回固定值
const getRoomDimensionsFromSize = (size: RoomSize): RoomDimensions => {
  const sizeMap = {
    small: { length: 3, width: 3, height: 2.5, unit: 'meters' },
    medium: { length: 5, width: 4, height: 2.8, unit: 'meters' },
    // ...
  };
  return sizeMap[size];
};

// After: 根据用户输入的英尺转换为米
const getRoomDimensionsFromSize = (width: number, length: number): RoomDimensions => {
  const widthMeters = width * 0.3048;  // 1 foot = 0.3048 meters
  const lengthMeters = length * 0.3048;
  return {
    length: Math.round(lengthMeters * 10) / 10,
    width: Math.round(widthMeters * 10) / 10,
    height: 2.8,
    unit: 'meters'
  };
};
```

### 用户体验改进

1. **精确控制**：用户可以输入精确的房间尺寸，而不是选择大致范围
2. **实时反馈**：输入时实时显示房间面积（平方英尺）
3. **直观单位**：使用英尺作为输入单位，更符合用户习惯
4. **数据验证**：
   - 最小值：1 英尺
   - 最大值：100 英尺
   - 自动处理无效输入

### 默认值

- Width: 12 feet
- Length: 15 feet
- 面积: 180 sq ft

### API 集成

所有 API 调用已更新为使用新的尺寸计算方式：
- `handleImageUpload`: 图片上传和房间检测
- `handleVisionComplete`: 智能家具推荐

### 文件修改

- `src/components/DesignStudio.tsx`
  - 更新 `RoomSetup` 接口
  - 修改 `getRoomDimensionsFromSize` 函数
  - 重构 `UploadStepContent` 组件
  - 更新所有使用 `roomSetup.size` 的地方

### 视觉设计

遵循 Fortress 2.0 设计系统：
- 使用 `--text-label` 字体大小作为标签
- 使用 `--text-small` 字体大小作为辅助文字
- 输入框使用 `bg-input-background` 和 `border-border`
- Focus 状态使用 `ring-ring` 颜色
- 禁用状态 60% 透明度

### 待优化项

1. 添加单位切换（英尺 ↔ 米）
2. 添加常见房间尺寸快捷选项
3. 添加房间形状选择（矩形、L型等）
4. 优化移动端输入体验

## 截图对比

### Before
- 4个预设尺寸按钮
- 固定的尺寸范围

### After
- 2个数字输入框（Width / Length）
- 实时计算面积显示
- 更灵活的自定义输入

## 技术细节

### 单位转换
- 输入单位：英尺（feet）
- API 单位：米（meters）
- 转换系数：1 foot = 0.3048 meters

### 数据流
1. 用户输入 → `roomSetup.width` / `roomSetup.length`
2. 上传图片 → `getRoomDimensionsFromSize(width, length)`
3. 转换为米 → 传递给 API
4. API 返回 → 显示检测结果

## 下一步

1. 测试不同尺寸输入的 API 响应
2. 验证单位转换的准确性
3. 添加输入验证和错误提示
4. 优化用户输入体验
