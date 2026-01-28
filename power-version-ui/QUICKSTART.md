# 快速开始指南

## 🚀 5 分钟快速启动

### 1. 前置要求

确保已安装:
- Node.js >= 18.0.0
- npm >= 9.0.0

### 2. 安装依赖

```bash
cd vibe-ai-in-home/power-version-ui
npm install
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
# VITE_API_URL=http://localhost:3001
```

### 4. 准备字体文件

将 Aime 字体文件复制到 `public/fonts/` 目录:

```bash
# 从 demo UI 复制字体文件
cp -r "../demo UI/public/fonts" public/
```

或者手动复制以下文件:
- `aime-regular.woff2`
- `aime-italic.woff2`
- `aime-bold.woff2`
- `aime-bold-italic.woff2`

### 5. 启动后端服务

在另一个终端窗口中:

```bash
cd vibe-ai-in-home/construction/unit_2_ai_service
npm run dev
```

后端服务将在 `http://localhost:3001` 启动。

### 6. 启动前端开发服务器

```bash
npm run dev
```

前端将在 `http://localhost:5174` 启动。

### 7. 访问应用

打开浏览器访问: http://localhost:5174

## 📖 开发工作流

### 创建新页面

1. 在 `src/pages/` 创建新组件:

```typescript
// src/pages/MyNewPage.tsx
import { Container, Typography } from '@mui/material';

export default function MyNewPage() {
  return (
    <Container>
      <Typography variant="h2">My New Page</Typography>
    </Container>
  );
}
```

2. 在 `src/App.tsx` 添加路由:

```typescript
import MyNewPage from '@/pages/MyNewPage';

// 在 Routes 中添加
<Route path="/my-new-page" element={<MyNewPage />} />
```

### 使用状态管理

```typescript
import { useAppContext } from '@/context/AppContext';

function MyComponent() {
  const { state, dispatch } = useAppContext();

  // 读取状态
  const roomType = state.roomSetup.roomType;

  // 更新状态
  const handleUpdate = () => {
    dispatch({
      type: 'SET_ROOM_SETUP',
      payload: { roomType: 'living_room' }
    });
  };

  return <div>{roomType}</div>;
}
```

### 调用 API

```typescript
import { uploadImage, detectFurniture } from '@/services/api';

async function handleUpload(file: File) {
  try {
    const result = await uploadImage(file);
    console.log('Upload success:', result);
  } catch (error) {
    console.error('Upload failed:', error);
  }
}
```

### 使用 MUI 主题

```typescript
import { Box, Button } from '@mui/material';

function MyComponent() {
  return (
    <Box sx={{ bgcolor: 'primary.main', p: 2 }}>
      <Button variant="contained" color="secondary">
        Click Me
      </Button>
    </Box>
  );
}
```

## 🎨 设计系统使用

### 颜色

```typescript
// 使用主题颜色
<Box sx={{ 
  bgcolor: 'primary.main',      // 深棕色
  color: 'primary.contrastText'  // 米白色文字
}} />

<Box sx={{ 
  bgcolor: 'secondary.main',     // 橙棕色
  color: 'text.primary'          // 深紫红文字
}} />
```

### 字体

```typescript
// 自动使用 Aime 字体
<Typography variant="h1">标题</Typography>
<Typography variant="body1">正文</Typography>
<Button>按钮</Button>  // 自动大写 + 字间距
```

### 圆角

```typescript
<Box sx={{ borderRadius: 2 }}>  // 8px (主题默认)
<Card sx={{ borderRadius: 3 }}>  // 12px
```

## 🔧 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 预览构建
npm run preview

# 代码检查
npm run lint

# 类型检查
npx tsc --noEmit
```

## 🐛 常见问题

### 1. 字体未加载

**问题**: 页面显示默认字体而不是 Aime

**解决**:
- 确认 `public/fonts/` 目录存在且包含字体文件
- 检查浏览器控制台是否有 404 错误
- 清除浏览器缓存

### 2. API 请求失败

**问题**: 网络请求返回 CORS 错误或连接失败

**解决**:
- 确认后端服务正在运行 (http://localhost:3001)
- 检查 `.env` 文件中的 `VITE_API_URL` 配置
- 查看后端服务日志

### 3. 类型错误

**问题**: TypeScript 报类型错误

**解决**:
```bash
# 运行类型检查
npx tsc --noEmit

# 查看具体错误信息
```

### 4. 端口被占用

**问题**: 端口 5174 已被使用

**解决**:
```bash
# 修改 vite.config.ts 中的端口
server: {
  port: 5175,  // 改为其他端口
}
```

## 📚 相关文档

- [README.md](./README.md) - 项目概述
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - 项目状态
- [Material-UI 文档](https://mui.com/)
- [React Router 文档](https://reactrouter.com/)
- [Vite 文档](https://vitejs.dev/)

## 💬 获取帮助

如有问题,请:
1. 查看项目文档
2. 检查控制台错误信息
3. 联系开发团队

## 🎉 开始开发

现在你已经准备好开始开发了!

建议的开发顺序:
1. 熟悉现有的 Landing Page 和 Room Setup Page
2. 创建 Path A 的第一个页面 (FurnitureSelectionPage)
3. 测试与后端 API 的集成
4. 逐步完成其他页面

祝开发顺利! 🚀
