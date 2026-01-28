# UI Layout Update - Room Setup Step

## 更新日期
2025-01-28

## 更新内容

### 布局优化
将 Room Setup 步骤的 UI 布局从原来的"左侧配置+上传，右侧单一预览"改为"左侧配置，右侧两栏（Original | Rendered）"布局。

### 具体变更

#### 1. UploadStepContent 组件
- **移除**：Upload Room Photo 上传区域
- **保留**：
  - Design Intent 选择（Refresh Room / New Room）
  - Room Type 下拉选择
  - Room Size 选择（Small / Medium / Large / X-Large）
  - AI Detection Results（上传后显示）
  - Confirm & Continue 按钮

#### 2. RenderingCanvas 组件
- **新增两栏布局**：
  - **左栏 (Original)**：
    - 标题："Original"
    - 副标题："Upload your room photo"
    - 上传区域：拖拽上传或点击浏览
    - 上传后显示原始图片，带"Uploaded"标签
  
  - **右栏 (Rendered)**：
    - 标题："Rendered"
    - 副标题：根据状态动态显示
    - 状态显示：
      - 未上传：提示"Upload a room photo to start"
      - 分析中：显示分析进度和状态
      - 渲染中：显示渲染进度条
      - 完成：显示AI渲染结果，带"AI Rendered"标签

### 用户体验改进

1. **直观对比**：用户可以同时看到原始图片和AI渲染结果，便于对比效果
2. **清晰流程**：左侧配置参数，右侧实时预览，流程更加清晰
3. **视觉平衡**：两栏布局更加平衡，充分利用屏幕空间
4. **状态反馈**：每个阶段都有清晰的视觉反馈和进度提示

### 技术实现

- 使用 CSS Grid 实现两栏布局（`grid-cols-2`）
- 保持所有 API 调用参数不变
- 复用现有的状态管理逻辑
- 遵循 Fortress 2.0 设计系统规范

### 文件修改

- `src/components/DesignStudio.tsx`
  - 修改 `UploadStepContent` 组件
  - 重构 `RenderingCanvas` 组件
  - 添加 `onUpload` prop 传递

### 待优化项

1. 修复 TypeScript 类型错误（DimensionUnit, FurnitureDimensions）
2. 清理未使用的导入和变量
3. 添加拖拽上传功能增强
4. 优化移动端响应式布局

## 截图对比

### 原始布局
- 左侧：配置 + 上传
- 右侧：单一预览区域

### 新布局
- 左侧：配置参数
- 右侧：Original | Rendered 两栏对比

## 下一步

1. 测试上传功能是否正常工作
2. 验证 AI 分析和渲染流程
3. 优化响应式布局
4. 添加更多交互细节（如图片缩放、全屏查看等）
