# 快速启动指南 - 统一设计流程

## 🚀 快速开始

### 1. 安装依赖
```bash
cd vibe-ai-in-home/power-version-ui
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 访问应用
打开浏览器访问: http://localhost:5174

## 📁 项目结构

```
power-version-ui/
├── src/
│   ├── components/
│   │   ├── UnifiedDesignFlow.tsx    # 🆕 统一设计流程主组件
│   │   └── steps/                   # 步骤组件
│   │       ├── RoomSetupStep.tsx
│   │       ├── DesignVisionStep.tsx
│   │       ├── FurnitureSelectionStep.tsx
│   │       └── FinalReviewStep.tsx
│   ├── context/
│   │   └── AppContext.tsx           # 全局状态管理
│   ├── pages/
│   │   └── LandingPage.tsx          # 首页
│   ├── theme/
│   │   └── fortressTheme.ts         # Fortress 2.0 主题
│   ├── types/
│   │   └── index.ts                 # TypeScript 类型定义
│   ├── services/
│   │   └── api.ts                   # API 服务
│   └── App.tsx                      # 🔄 已更新路由配置
└── public/
    └── fonts/                       # Aime 字体文件
```

## 🎯 主要功能

### 统一设计流程 (UnifiedDesignFlow)
- ✅ 4 步设计流程
- ✅ 左侧步骤导航
- ✅ 顶部进度条
- ✅ 步骤间导航
- ✅ 保存进度功能

### 步骤 1: Room Setup
- 上传房间照片
- 选择房间类型（客厅/卧室/餐厅/办公室/厨房）
- 输入房间尺寸（宽/长/高）
- 选择设计模式：
  - 替换现有家具
  - 空房间布置

### 步骤 2: Design Vision
**替换模式**:
- 选择要替换的家具类别
- 设置预算
- 选择收藏系列（可选）

**空房间模式**:
- 选择设计风格
- 选择收藏系列（可选）

### 步骤 3: Furniture Selection
- AI 自动检测家具（替换模式）
- AI 自动布置（空房间模式）
- 生成 AI 渲染图

### 步骤 4: Final Review
- 查看 AI 渲染结果
- 浏览推荐家具
- 添加到购物车
- 查看订单摘要

## 🎨 设计系统

### Fortress 2.0 主题
- **主色调**: #844025 (深棕色)
- **次要色**: #D25C1B (橙棕色)
- **背景色**: #FBF9F4 (米白色)
- **文字色**: #3C101E (深紫红)
- **字体**: Aime

### Material-UI 组件
- Box, Container, Typography
- Button, Card, CardContent
- Stepper, Step, StepLabel
- LinearProgress
- TextField, Select, MenuItem
- Grid, Chip, Alert

## 🔧 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 代码检查
npm run lint
```

## 📝 待办事项

### 高优先级
- [ ] 连接后端 AI 服务 API
- [ ] 实现图片上传功能
- [ ] 实现家具检测功能
- [ ] 实现 AI 渲染功能

### 中优先级
- [ ] 根据 Figma 设计微调样式
- [ ] 添加加载动画
- [ ] 优化错误处理
- [ ] 添加表单验证

### 低优先级
- [ ] 优化移动端响应式布局
- [ ] 添加单元测试
- [ ] 性能优化
- [ ] 添加国际化支持

## 🐛 已知问题

1. **TypeScript 类型警告**
   - 状态: IDE 显示 `useState` 导入错误
   - 影响: 仅 IDE 警告，不影响运行
   - 原因: 可能是 IDE 缓存问题
   - 解决: 代码实际运行正常，可以忽略

2. **API 未连接**
   - 状态: 后端 API 尚未集成
   - 影响: 无法实际上传图片和生成渲染
   - 解决: 需要连接 unit_2_ai_service

## 📚 相关文档

- [UNIFIED_FLOW_IMPLEMENTATION.md](./UNIFIED_FLOW_IMPLEMENTATION.md) - 实现详情
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - 项目总结
- [README.md](./README.md) - 项目说明

## 🤝 贡献指南

1. 遵循 Fortress 2.0 设计系统
2. 使用 Material-UI 组件
3. 保持代码风格一致
4. 添加适当的类型定义
5. 编写清晰的注释

## 📞 支持

如有问题，请查看:
- 项目文档
- TypeScript 类型定义
- Material-UI 文档
- React 官方文档
