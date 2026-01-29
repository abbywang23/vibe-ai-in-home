# 基于家具识别的智能推荐功能

## 功能概述

这个功能允许系统根据AI识别出的家具类别，从产品数据库中智能挑选合适的替换商品。

## 工作流程

```
1. 用户上传房间图片
   ↓
2. AI 识别图片中的家具类别 (例如: sofa, table, chair)
   ↓
3. 系统根据识别的类别从数据库中挑选商品
   ↓
4. 返回推荐的家具列表和摆放位置
```

## API 端点

### POST /api/ai/recommend-from-detected

根据识别出的家具类别生成推荐。

#### 请求体

```json
{
  "detectedCategories": ["sofa", "table", "chair"],
  "roomType": "living_room",
  "dimensions": {
    "length": 5.0,
    "width": 4.0,
    "height": 2.8,
    "unit": "meters"
  },
  "budget": {
    "amount": 5000,
    "currency": "SGD"
  },
  "preferences": {
    "selectedCategories": [],
    "selectedCollections": ["modern"],
    "preferredProducts": []
  }
}
```

#### 参数说明

- **detectedCategories** (必需): 识别出的家具类别数组
  - 支持的类别: `sofa`, `chair`, `table`, `bed`, `storage`, `desk`
  - 系统会自动标准化类别名称（例如 "sofas" → "sofa"）

- **roomType** (必需): 房间类型
  - `living_room`, `bedroom`, `dining_room`, `home_office`

- **dimensions** (必需): 房间尺寸
  - `length`: 房间长度（米）
  - `width`: 房间宽度（米）
  - `height`: 房间高度（米）

- **budget** (可选): 预算限制
  - `amount`: 预算金额
  - `currency`: 货币类型（默认 SGD）

- **preferences** (可选): 用户偏好
  - `selectedCollections`: 偏好的系列（例如 ["modern", "scandinavian"]）
  - `selectedCategories`: 额外的类别过滤
  - `preferredProducts`: 偏好的产品ID

#### 响应示例

```json
{
  "success": true,
  "recommendations": [
    {
      "productId": "product-1",
      "productName": "Aria 3 Seater Sofa",
      "position": {
        "x": 2.5,
        "y": 0,
        "z": 0.5
      },
      "rotation": 0,
      "reasoning": "Placed Aria 3 Seater Sofa against the main wall as the focal point of the seating area",
      "price": 1899
    },
    {
      "productId": "product-15",
      "productName": "Oslo Coffee Table",
      "position": {
        "x": 2.5,
        "y": 0,
        "z": 1.33
      },
      "rotation": 0,
      "reasoning": "Placed Oslo Coffee Table in front of the seating area as a coffee table",
      "price": 549
    }
  ],
  "totalPrice": 2448,
  "budgetExceeded": false,
  "metadata": {
    "detectedCategories": ["sofa", "table"],
    "matchedCategories": ["Aria 3 Seater Sofa", "Oslo Coffee Table"]
  }
}
```

## 智能选择算法

系统使用多维度评分算法来选择最佳商品：

### 1. 价格评分 (30分)
- 优先选择占剩余预算 60-80% 的商品
- 避免选择过于便宜或过于昂贵的商品

### 2. 尺寸评分 (30分)
- 商品占房间面积 ≤ 15%: 30分
- 商品占房间面积 ≤ 25%: 20分
- 其他: 10分

### 3. 系列匹配评分 (40分)
- 如果商品属于用户偏好的系列，加40分

### 4. 类别优先级
- 根据房间类型，不同类别有不同的优先级
- 例如客厅: sofa (1) > table (2) > chair (3) > storage (4)

## 摆放逻辑

系统根据家具类别使用不同的摆放策略：

### Sofa (沙发)
- 位置: 靠主墙，居中
- 旋转: 0度（面向房间）
- 距离墙: 0.5米

### Table (桌子)
- 第一张桌子: 房间中心
- 咖啡桌: 沙发前方
- 旋转: 0度

### Chair (椅子)
- 偶数索引: 左侧，旋转90度
- 奇数索引: 右侧，旋转270度
- 形成对话区域

### Storage (储物柜)
- 位置: 靠墙角
- 旋转: 0度
- 节省空间

### Bed (床)
- 位置: 靠主墙，居中
- 旋转: 0度
- 作为卧室焦点

## 使用示例

### 场景1: 客厅家具替换

```javascript
// 1. 用户上传图片，AI识别出家具
const detectedCategories = ['sofa', 'coffee table', 'armchair'];

// 2. 调用推荐API
const response = await fetch('/api/ai/recommend-from-detected', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    detectedCategories,
    roomType: 'living_room',
    dimensions: { length: 5.0, width: 4.0, height: 2.8, unit: 'meters' },
    budget: { amount: 5000, currency: 'SGD' },
    preferences: {
      selectedCollections: ['modern', 'scandinavian']
    }
  })
});

const recommendations = await response.json();
console.log(`推荐了 ${recommendations.recommendations.length} 件家具`);
console.log(`总价: ${recommendations.totalPrice} SGD`);
```

### 场景2: 卧室家具推荐

```javascript
const response = await fetch('/api/ai/recommend-from-detected', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    detectedCategories: ['bed', 'storage', 'chair'],
    roomType: 'bedroom',
    dimensions: { length: 4.0, width: 3.5, height: 2.8, unit: 'meters' },
    budget: { amount: 3000, currency: 'SGD' }
  })
});
```

## 类别标准化

系统会自动将各种变体标准化为标准类别：

| 输入 | 标准化后 |
|------|---------|
| sofa, sofas, couch, sectional | sofa |
| chair, chairs, armchair, seat | chair |
| table, tables, coffee table, desk | table |
| bed, beds | bed |
| storage, cabinet, shelf, shelving | storage |

## 错误处理

### 无可用商品
```json
{
  "success": true,
  "recommendations": [],
  "totalPrice": 0,
  "budgetExceeded": false
}
```

### 预算超支
```json
{
  "success": true,
  "recommendations": [...],
  "totalPrice": 6500,
  "budgetExceeded": true,
  "exceededAmount": 1500
}
```

### 无效的类别
```json
{
  "success": false,
  "error": "detectedCategories array is required and must not be empty"
}
```

## 与现有推荐API的区别

### `/api/ai/recommend` (原有)
- 基于房间类型自动选择家具类别
- 适用于空房间设计

### `/api/ai/recommend-from-detected` (新增)
- 基于AI识别的家具类别
- 适用于替换现有家具
- 更精确的类别匹配

## 性能优化

1. **产品缓存**: ProductServiceClient 在启动时加载所有产品
2. **智能过滤**: 先按类别过滤，再按预算和系列过滤
3. **评分算法**: 快速计算，无需复杂的AI推理

## 未来改进

1. **AI增强**: 使用AI模型进一步优化商品选择
2. **风格匹配**: 根据房间风格智能匹配家具风格
3. **尺寸验证**: 更精确的空间适配检查
4. **用户反馈**: 基于用户选择历史优化推荐

## 测试

```bash
# 启动AI服务
cd construction/unit_2_ai_service
npm run dev

# 测试推荐API
curl -X POST http://localhost:3001/api/ai/recommend-from-detected \
  -H "Content-Type: application/json" \
  -d '{
    "detectedCategories": ["sofa", "table"],
    "roomType": "living_room",
    "dimensions": {"length": 5.0, "width": 4.0, "height": 2.8, "unit": "meters"},
    "budget": {"amount": 5000, "currency": "SGD"}
  }'
```

## 相关文件

- `src/services/RecommendationService.ts` - 推荐服务实现
- `src/controllers/recommendationController.ts` - API控制器
- `src/routes/index.ts` - 路由配置
- `src/clients/ProductServiceClient.ts` - 产品数据访问
- `product/products.yaml` - 产品数据库

---

**更新时间**: 2026-01-27
**版本**: 1.0.0
