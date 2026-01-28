# Vibe AI In-Home - Power Version UI

基于优化用户流程的 AI 驱动家居设计应用前端。

## 🎯 项目概述

这是根据 Figma 设计优化后的用户界面重构版本,使用 Material-UI 作为底层 UI 库,并遵循 Fortress 2.0 设计系统。

### 核心功能

- **Landing Page** - 产品介绍和功能展示
- **Room Setup** - 房间信息设置(上传图片、选择类型、尺寸、模式)
- **Path A - 替换现有家具流程**:
  - 家具选择和预算设置
  - 收藏系列选择
  - AI 检测预览
  - 渲染结果展示
- **Path B - 空房间布置流程**:
  - 风格和收藏系列选择
  - AI 自动布置结果
- **共享功能**:
  - 产品展示和对比
  - AI 聊天助手
  - 购物车

## 🛠 技术栈

- **React 18.3.1** + TypeScript
- **Vite 6.3.5** - 构建工具
- **Material-UI v5** - UI 组件库
- **React Router v6** - 路由管理
- **Axios** - HTTP 客户端
- **React Context + useReducer** - 状态管理

## 🎨 设计系统

### Fortress 2.0 颜色方案

- **Primary**: `rgba(132, 64, 37, 1.00)` - 深棕色
- **Secondary**: `rgba(210, 92, 27, 1.00)` - 橙棕色
- **Background**: `rgba(251, 249, 244, 1.00)` - 米白色
- **Text**: `rgba(60, 16, 30, 1.00)` - 深紫红

### 字体

- **Aime** - 单一字体系统
- 字体文件位于 `public/fonts/`

## 📦 安装

```bash
# 安装依赖
npm install

# 复制环境变量
cp .env.example .env

# 启动开发服务器
npm run dev
```

## 🚀 开发

```bash
# 开发模式 (端口 5174)
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

## 🔌 API 集成

项目连接到 `unit_2_ai_service` 后端服务 (默认端口 3001)。

### 主要 API 端点

- `POST /api/ai/upload` - 上传房间图片
- `POST /api/ai/detect` - 家具检测
- `POST /api/ai/replace` - 家具替换 (Path A)
- `POST /api/ai/place` - 空房间布置 (Path B)
- `POST /api/ai/multi-render` - 多家具渲染
- `POST /api/ai/products/smart-recommend` - 智能推荐
- `POST /api/ai/chat` - AI 聊天

## 📁 项目结构

```
power-version-ui/
├── public/
│   └── fonts/              # Aime 字体文件
├── src/
│   ├── context/            # React Context (状态管理)
│   │   └── AppContext.tsx
│   ├── pages/              # 页面组件
│   │   ├── LandingPage.tsx
│   │   ├── RoomSetupPage.tsx
│   │   └── ...
│   ├── services/           # API 服务
│   │   └── api.ts
│   ├── theme/              # MUI 主题配置
│   │   └── fortressTheme.ts
│   ├── types/              # TypeScript 类型定义
│   │   └── index.ts
│   ├── App.tsx             # 主应用组件
│   ├── main.tsx            # 入口文件
│   └── index.css           # 全局样式
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🎯 用户流程

### Path A: 替换现有家具

1. Landing Page → 点击"开始设计"
2. Room Setup → 上传图片、选择房间类型、输入尺寸、选择"替换现有家具"模式
3. Furniture Selection → 选择要替换的家具类别、设置预算
4. Collection Selection → 选择偏好的收藏系列
5. AI Detection → 查看 AI 检测到的家具
6. Rendering Result → 查看替换后的效果和推荐产品

### Path B: 空房间布置

1. Landing Page → 点击"开始设计"
2. Room Setup → 上传图片、选择房间类型、输入尺寸、选择"空房间布置"模式
3. Style Selection → 选择设计风格和收藏系列
4. AI Furnishing → 查看 AI 自动布置的效果和产品列表

## 🔧 配置

### 环境变量

在 `.env` 文件中配置:

```env
VITE_API_URL=http://localhost:3001
```

### Vite 代理配置

开发环境下,API 请求会自动代理到后端服务:

```typescript
// vite.config.ts
server: {
  port: 5174,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
}
```

## 📝 开发规范

### 代码风格

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 组件使用函数式组件 + Hooks
- 使用 Material-UI 的 `sx` prop 进行样式定制

### 状态管理

使用 React Context + useReducer 模式:

```typescript
const { state, dispatch } = useAppContext();

// 更新状态
dispatch({ type: 'SET_ROOM_SETUP', payload: { roomType: 'living_room' } });
```

### API 调用

使用封装的 API 服务:

```typescript
import { uploadImage, detectFurniture } from '@/services/api';

const result = await uploadImage(file);
const detection = await detectFurniture(imageUrl);
```

## 🚧 待完成功能

- [ ] Path A 完整流程页面
- [ ] Path B 完整流程页面
- [ ] 产品详情和对比功能
- [ ] 购物车功能
- [ ] AI 聊天助手
- [ ] 3D 可视化预览
- [ ] 响应式设计优化
- [ ] 错误处理和加载状态
- [ ] 单元测试

## 📄 许可证

Private - All rights reserved

## 👥 团队

Vibe AI In-Home Development Team
