# API 配置说明

## 重要提示

**所有 API 调用现在必须通过环境变量配置，不再使用 localhost 硬编码。**

## 配置步骤

### 1. 创建 `.env` 文件

复制 `.env.example` 并设置实际的 API 地址：

```bash
cp .env.example .env
```

### 2. 配置 API 地址

编辑 `.env` 文件，设置 `VITE_API_BASE_URL`：

```env
# 开发环境示例（使用实际服务器 IP）
VITE_API_BASE_URL=http://192.168.1.100:3001

# 生产环境示例
VITE_API_BASE_URL=https://api.example.com
```

**⚠️ 重要：不要使用 `localhost` 或 `127.0.0.1`**

## 已修复的文件

1. **src/services/api.ts**
   - 移除了 localhost 默认值
   - 添加了环境变量检查，未配置时会抛出错误

2. **src/services/aiApi.ts**
   - 所有接口调用都使用 `API_BASE_URL` 环境变量

3. **src/utils/cloudinaryUpload.ts**
   - 修复了缺失的 `apiConfig` 导入
   - 现在使用统一的 `API_BASE_URL`

4. **src/components/DesignStudio.tsx**
   - 移除了 console.log 中的 localhost 默认值

5. **test-api-integration.html**
   - 移除了硬编码的 localhost
   - 现在通过 `window.API_BASE_URL` 或用户输入配置

6. **.env.example**
   - 移除了 localhost 示例
   - 添加了配置说明

## 验证配置

启动应用前，确保：

1. `.env` 文件存在且包含 `VITE_API_BASE_URL`
2. API 地址指向实际的后端服务器
3. 后端服务器可访问（网络可达）

## 错误处理

如果未配置 `VITE_API_BASE_URL`，应用启动时会抛出错误：

```
Error: VITE_API_BASE_URL environment variable is required. Please set it in your .env file.
```

## 常见问题

**Q: 为什么不能使用 localhost？**
A: localhost 只能在本地机器上访问，无法在远程服务器或移动设备上使用。

**Q: 如何找到我的服务器 IP？**
A: 
- Linux/Mac: `hostname -I` 或 `ifconfig`
- Windows: `ipconfig`

**Q: 开发环境应该使用什么地址？**
A: 使用你的开发机器的实际 IP 地址，例如 `http://192.168.1.100:3001`
