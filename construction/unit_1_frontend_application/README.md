# Frontend Application - Furniture Room Planner

React + TypeScript 前端应用，用于家具房间规划系统。

## 功能特性 / Features

- ✅ 房间配置 / Room Configuration
- ✅ 偏好设置 / Preferences Setup
- ✅ AI 推荐展示 / AI Recommendations Display
- ✅ 实时聊天 / Real-time Chat
- ✅ 中英文双语 / Bilingual (EN/ZH)
- ✅ 响应式设计 / Responsive Design

## 技术栈 / Tech Stack

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Material-UI** - UI 组件库
- **Axios** - HTTP 客户端

## 快速开始 / Quick Start

### 前提条件 / Prerequisites

1. Node.js 20+ 已安装
2. 后端服务运行在 http://localhost:3001

### 安装依赖 / Install Dependencies

```bash
cd construction/unit_1_frontend_application
npm install
```

### 启动开发服务器 / Start Dev Server

```bash
npm run dev
```

应用将在 http://localhost:5174 启动

### 构建生产版本 / Build for Production

```bash
npm run build
```

## 使用说明 / Usage

### 步骤 1: 配置房间

1. 选择房间类型（客厅、卧室、餐厅、书房）
2. 选择单位（米或英尺）
3. 输入房间尺寸（长、宽、高）
4. 点击"下一步"

### 步骤 2: 设置偏好

1. 输入预算（可选）
2. 选择家具类别
3. 点击"获取推荐"

### 步骤 3: 查看推荐

1. 查看 AI 生成的家具推荐
2. 每件家具显示：
   - 名称和价格
   - 在房间中的位置
   - 旋转角度
   - 推荐理由
3. 使用聊天功能与 AI 交流

## 项目结构 / Project Structure

```
src/
├── components/          # React 组件
│   ├── RoomConfigPanel.tsx
│   ├── PreferencesPanel.tsx
│   ├── RecommendationsDisplay.tsx
│   └── ChatPanel.tsx
├── services/           # API 服务
│   └── api.ts
├── types/              # TypeScript 类型
│   └── index.ts
├── App.tsx             # 主应用组件
├── main.tsx            # 入口文件
└── index.css           # 全局样式
```

## API 集成 / API Integration

前端通过 Axios 与后端 API 通信：

- `POST /api/ai/recommend` - 获取家具推荐
- `GET /api/ai/products/search` - 搜索产品
- `GET /api/ai/products/categories` - 获取分类
- `POST /api/ai/chat` - 聊天交互

## 配置 / Configuration

API 基础 URL 在 `src/services/api.ts` 中配置：

```typescript
const API_BASE_URL = 'http://localhost:3001';
```

如果后端运行在不同端口，请修改此配置。

## 开发 / Development

### 热重载 / Hot Reload

开发服务器支持热重载，修改代码后自动刷新。

### 类型检查 / Type Checking

```bash
npm run build
```

TypeScript 会在构建时进行类型检查。

## 故障排除 / Troubleshooting

### 无法连接到后端

**问题**: API 请求失败

**解决方案**:
1. 确保后端服务运行在 http://localhost:3001
2. 检查 CORS 配置
3. 查看浏览器控制台错误信息

### 端口冲突

**问题**: 端口 5174 已被占用

**解决方案**:
Vite 会自动尝试下一个可用端口（5175, 5176...）

### 依赖安装失败

**解决方案**:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 浏览器支持 / Browser Support

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 未来增强 / Future Enhancements

- [ ] 3D 可视化（Three.js）
- [ ] 2D 平面图（Konva.js）
- [ ] 拖拽家具调整位置
- [ ] 保存和分享设计
- [ ] 购物车功能
- [ ] 用户账户系统

## License

ISC
