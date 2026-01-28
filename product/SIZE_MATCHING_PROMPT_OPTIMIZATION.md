# 尺寸匹配优化：家具替换/生成流程与 Prompt 梳理

> 目标：不“梳理一大堆”，只聚焦 **家具替换/生成** 时的 prompt/入参，并给出针对“尺寸匹配（scale/比例/占地）”的可落地优化建议。

---

## 1. 当前家具替换/生成的关键链路（只保留关键节点）

### 1) 上传/检测（为后续尺寸锚点提供 bbox）
- **前端**：`DesignStudio` 上传后调用 `POST /api/ai/detect`
- **后端**：`ImageProcessingService.detectFurnitureWithAI()` 使用 `qwen3-vl-plus` 做房间分析
- **Prompt**：`src/prompts/roomAnalysisPrompt.ts`
  - 输出包含：`detectedItems[].boundingBox`（0-100 百分比），`roomDimensions`（meters/feet），`roomType`，`roomStyle`
  - 注意：后端会把家具类型严格过滤为 6 类：`sofa/table/chair/storage/bed/desk`

### 2) 推荐（用于“选什么”，不是“怎么生成”，但包含尺寸信息）
- **前端**：`POST /api/ai/products/smart-recommend`
- **后端**：`ProductRecommendationService.generateAIRecommendations()` 使用 `qwen-turbo`
- **Prompt 现状**：
  - user prompt 会列出候选产品的 `Dimensions: widthW × depthD × heightH meters`
  - 但更偏“选品理由”，对“生成时比例/占地/留通道”的约束很弱（详见第 3 节）

### 3) 生成（你关心的“prompt”主要在这里）

#### A. 单件替换：`POST /api/ai/replace`（**有自然语言 prompt**）
- **后端实现**：`ImageProcessingService.replaceFurnitureWithAI()`
- **实际调用模型**：`wan2.6-image`（DashScope multimodal generation）
- **当前 prompt（核心问题）**：只插入了 `${product.name}`，没有使用：
  - 被替换目标的 **bounding box**
  - 被替换目标的 **类型**（sofa/table…）
  - 产品的 **真实尺寸**（W/D/H）
  - 房间的 **真实尺寸**（长宽高）

#### B. 单件放置：`POST /api/ai/place`（**有自然语言 prompt**）
- **后端实现**：`ImageProcessingService.placeFurnitureWithAI()`
- **当前 prompt**：包含 `imagePosition(%) + rotation + scale`，但仍缺少“真实尺寸/占地/与场景标尺”的明确约束。

#### C. 多件生成：`POST /api/ai/multi-render`（**基本没有 prompt 可控**）
- **后端实现**：`ImageProcessingService.generateMultiFurnitureRender()`
- **实际调用**：Decor8AI `generate_designs_for_room`
- **入参（相当于 prompt 的可控面）**：
  - `room_type`：映射为 livingroom/bedroom/…
  - `design_style`：目前写死 `'minimalist'`
  - `decor_items`：仅包含每件家具的 `{ url, name }`
- **关键结论**：多件生成链路里 **没有自然语言 prompt**（或者说只能通过 `name/design_style` 间接影响），因此“尺寸匹配”更难精准控制。

---

## 2. 关键发现：图片中家具尺寸 vs 产品配置尺寸

### 2.1 图片中家具的尺寸（检测接口返回）

**检测接口**：`POST /api/ai/detect`  
**返回数据结构**：`FurnitureDetectionResponse`

```typescript
interface DetectedFurnitureItem {
  itemId: string;
  furnitureType: 'sofa' | 'table' | 'chair' | 'storage' | 'bed' | 'desk';
  boundingBox: {
    x: number;      // 0-100 百分比
    y: number;      // 0-100 百分比
    width: number;  // 0-100 百分比
    height: number; // 0-100 百分比
  };
  confidence: number;
}
```

**关键结论**：
- ✅ **有** `boundingBox`（图片中的位置和大小，百分比）
- ❌ **没有** 真实物理尺寸（W/D/H in meters/cm）
- ✅ **有** `roomDimensions`（房间的真实尺寸：L/W/H in meters/feet）

**这意味着**：检测接口**无法直接告诉你图片中某个沙发是 2.5m 还是 1.8m 宽**，只能告诉你它在图片中占多少百分比。要计算真实尺寸，需要结合：
- `boundingBox`（百分比）
- `roomDimensions`（房间真实尺寸）
- 透视关系估算

### 2.2 产品配置文档的尺寸（products.yaml）

**配置位置**：`product/products.yaml`  
**配置格式**：在 `options` 字段下

```yaml
products:
  - name: Mori Performance Fabric Chaise Sectional Sofa
    options:
      - type: width
        values: ["269cm"]
      - type: depth
        values: ["70/130cm"]  # ⚠️ 注意：这是范围值
      - type: height
        values: ["52cm (floor to arm)"]
```

**解析逻辑**：`ProductServiceClient.extractDimensionsFromOptions()`

```typescript
// 当前解析逻辑（有问题）
private parseDimension(dimensionStr: string): number {
  const match = dimensionStr.match(/(\d+)cm/);
  return match ? parseInt(match[1]) : 0;  // ⚠️ 对 "70/130cm" 只取 70
}
```

**关键结论**：
- ✅ **有** 产品尺寸配置（width/depth/height）
- ✅ **能解析** 简单格式（如 `269cm`）
- ❌ **解析有问题**：`70/130cm` 这种范围值只取第一个数字 `70`，导致深度被低估

**影响**：
- 推荐阶段可能误判产品尺寸（以为更小）
- 生成时更容易出现“产品比预期大”的问题

### 2.3 尺寸数据可用性总结

| 数据源 | 图片中家具尺寸 | 产品配置尺寸 | 房间尺寸 |
|--------|---------------|-------------|---------|
| **检测接口** | ❌ 只有 bbox（百分比） | - | ✅ 有（L/W/H） |
| **产品配置** | - | ✅ 有（但解析有问题） | - |
| **可用于生成 prompt** | ⚠️ 需计算 | ✅ 可直接用 | ✅ 可直接用 |

**建议**：
1. **修复产品尺寸解析**：`70/130cm` → 取最大值 `130cm` 或保留范围
2. **增强检测 prompt**：让 AI 尝试估算图片中家具的真实尺寸（可选，但会增加复杂度）
3. **生成时用 bbox + 产品尺寸 + 房间尺寸**：三者结合做尺寸匹配

### 2.4 如何从 bbox 估算图片中家具的真实尺寸（可选）

虽然检测接口不直接返回真实尺寸，但可以通过以下方式估算：

**方法 1：基于房间尺寸和 bbox 比例估算**
```typescript
// 伪代码示例
function estimateFurnitureSize(
  bbox: { width: number, height: number },  // 百分比
  roomDimensions: { length: number, width: number, height: number },
  furnitureType: string
): { estimatedWidth: number, estimatedDepth: number, estimatedHeight: number } {
  // 假设图片是房间的俯视图/透视图
  // bbox.width% 对应房间的某个维度
  
  // 简化估算（需要根据实际透视关系调整）
  const estimatedWidth = (bbox.width / 100) * roomDimensions.width;
  const estimatedDepth = (bbox.height / 100) * roomDimensions.length;  // 注意：这取决于透视
  const estimatedHeight = roomDimensions.height * 0.3; // 假设家具高度约为房间高度的30%
  
  return { estimatedWidth, estimatedDepth, estimatedHeight };
}
```

**方法 2：在检测 prompt 中要求 AI 估算**
可以在 `roomAnalysisPrompt.ts` 的 user prompt 中添加：
```text
7. **家具尺寸估算**：对每个检测到的家具，估算其真实尺寸（长×宽×高，单位：米）
   - 可以参考房间尺寸、标准家具尺寸、透视关系
   - 如果无法准确估算，提供合理范围
```

然后在返回的 JSON 中添加：
```json
{
  "detectedItems": [{
    "itemId": "...",
    "furnitureType": "sofa",
    "boundingBox": {...},
    "estimatedDimensions": {  // 新增字段
      "width": 2.5,
      "depth": 1.0,
      "height": 0.85,
      "unit": "meters",
      "confidence": 0.7
    }
  }]
}
```

> **注意**：方法 2 会增加检测复杂度，但能提供更准确的尺寸信息用于后续匹配。

---

## 3. 尺寸匹配问题：当前“生成时 prompt/入参”的主要缺口

### 缺口 1：替换 prompt 没有“目标区域锚点”
检测已经产出了 `boundingBox`（百分比），但 `/api/ai/replace` 的生成 prompt 没有用到它，模型只能“猜”要替换哪里、替换多大，经常导致：
- 替换对象位置偏移
- 尺寸比例失真（过大/过小）
- 不该变化的区域被重绘

### 缺口 2：替换/放置 prompt 没有“真实尺寸标尺”
虽然产品数据里能解析出 W/D/H（并且推荐 prompt 里也会展示），但生成 prompt 没把这些尺寸作为强约束传给模型：
- 结果会出现“看起来像同一款产品，但体量不对”的问题（例如：沙发被生成得像单人椅，或占满整面墙）

### 缺口 3：multi-render 链路几乎无法精控尺寸
Decor8AI 的 `decor_items` 只有 `name/url`，没有 bbox、没有真实尺寸、也没有“替换哪个现有家具”的信息，所以它更像“风格合成/摆场”而不是“精确替换”：
- 如果你们的目标是“替换现有家具并尽量贴合原体量”，multi-render 这条链路天然吃亏

### 缺口 4：产品尺寸解析存在误差，会放大尺寸匹配问题
`ProductServiceClient.extractDimensionsFromOptions()` 解析 YAML `options`：
- 对 `269cm` 这类 OK
- 但对 `70/130cm` 这种“范围/两段式”的深度（例如沙发带贵妃位）会只取第一个 `70`（因为正则只抓第一个 `(\d+)cm`）
- 这会导致你在“推荐/过滤/计算占地”时以为产品更小，从而在生成时更容易超出预期

---

## 4. 现有生成 Prompt / 入参长什么样（便于对照）

### 3.1 `/api/ai/replace` 当前 prompt（节选）
后端当前拼的文本是（仅替换产品名）：

```text
将这个房间中的现有家具替换为${product.name}。要求：
1. 保持房间的整体布局和风格
2. 新家具应该与房间的色彩搭配和谐
3. 确保家具的尺寸和比例适合房间空间
4. 保持自然的光线和阴影效果
5. 生成高质量、真实感的室内设计效果图
请生成一张专业的室内设计渲染图，展示${product.name}完美融入到这个房间中，替换原有家具的效果。
```

**问题**：这里的“尺寸和比例适合”是软描述，没有任何可计算的锚点（bbox/真实尺寸/房间尺寸）。

### 3.2 `/api/ai/place` 当前 prompt（节选）

```text
在这个房间中放置${product.name}家具。要求：
1. 将家具放置在房间的合适位置（大约在图片的${imagePosition.x}%, ${imagePosition.y}%位置）
2. 家具旋转角度为${rotation}度，缩放比例为${scale}
3. 确保家具与房间风格协调，光线自然
4. 保持房间的整体布局和透视关系
5. 生成高质量、真实感的室内设计效果图
请生成一张专业的室内设计渲染图，展示${product.name}完美融入到这个房间中的效果。
```

**问题**：虽然有 `scale`，但它不是“真实尺寸标尺”（且模型未必会严格服从一个抽象数值）。

### 3.3 `/api/ai/multi-render` 的“prompt 等价物”（结构化入参）
当前 payload 关键字段：
- `room_type`
- `design_style`：目前固定 `'minimalist'`
- `decor_items`: `[{ url, name }, ...]`

**问题**：`decor_items.name` 是唯一可注入的文字信息，因此“尺寸/体量”只能靠 `name` 间接提示。

---

## 5. 尺寸匹配优化建议（按优先级，尽量不动大架构）

### P0（最推荐）：增强 replace/place 的 prompt，把“尺寸锚点”说清楚
核心思路：把“模型需要做对的事”变成 **明确、可执行、可检查** 的约束：
- **目标区域**：把 bbox（0-100%）写进 prompt，要求“仅在该区域替换/调整，其他区域不重绘”
- **体量/占地**：把产品 W/D/H 写进 prompt，并要求生成的占地与 bbox 一致（可给容差）
- **不改变相机/透视**：明确禁止改变镜头、墙体、窗户、地面材质等

> 这一步本质是把“尺寸匹配”从一句口号变成结构化约束，通常是 ROI 控制最有效的改动。

### P0（配套）：让 `/api/ai/replace` 拿得到 bbox（否则无法写进 prompt）
目前 `/api/ai/replace` 只有 `detectedItemId`，但后端并没有“检测上下文存储”，因此仅凭 `detectedItemId` **无法反查 bbox**。

两种常见做法（二选一即可）：
- **做法 A（改接口入参，最直接）**：前端在调用 replace 时额外传 `detectedItem.boundingBox`（以及 `furnitureType`）
- **做法 B（服务端存上下文）**：detect 后把 `detectedItems` 存到 session/DB/cache，replace 用 `detectedItemId` 反查 bbox

### P1：multi-render 尺寸控制的“低成本可控手段”
因为 Decor8AI 只能吃 `name/url`：
- **在 `decor_items[].name` 里拼接尺寸**（例如 `Mori Sofa (W2.69m D1.30m H0.52m)`）
- **把 design_style 从写死改为检测结果映射**（`roomStyle: Modern/Nordic/...` → Decor8AI 的 style 枚举）

> 这不是“强保证”，但通常能显著降低离谱的比例错误，成本也低。

### P1：生成前做一次 size sanity check（不改 prompt，但能减少失败）
在选品阶段（或生成前）对每个品类做简单阈值过滤/提示：
- 例如：`sofa.width <= roomWidth * 0.75`，`table.depth <= roomWidth * 0.35`
- 把明显不可能放进房间的选项提前排掉

### P2：修复产品尺寸解析（避免“尺寸错判”）
把 `70/130cm` 解析成 **最大值 130cm** 或 **范围**，至少不要只取 70cm。

---

## 6. 推荐的 Prompt v2 模板（可直接替换现有拼接逻辑）

> 说明：下面模板假设你们能拿到 `bbox`、`roomDimensions`、`productDimensions`。即便暂时拿不到全部字段，也建议先把能拿到的塞进去（例如先塞 product dims + room dims）。

### 5.1 Replace Prompt v2（强约束尺寸与区域）

```text
你是一名专业室内摄影级渲染师。请在不改变相机视角/透视/光照方向的前提下，对输入房间照片做“局部替换”：

【替换目标】
- 目标家具类型：{furnitureType}（例如 sofa/table/chair/storage/bed/desk）
- 目标区域（bbox，单位为整张图的百分比）：x={bbox.x}%, y={bbox.y}%, w={bbox.width}%, h={bbox.height}%
- 要替换成的产品：{productName}
- 产品真实尺寸：W={productW}m, D={productD}m, H={productH}m
- 房间真实尺寸参考：L={roomL}m, W={roomW}m, H={roomH}m

【必须满足的约束（尺寸匹配核心）】
1) 仅在 bbox 区域内替换该件家具；bbox 外的墙面/地面/窗户/门/天花板/其他家具保持不变，不要重绘。
2) 新家具在画面中的占地与 bbox 尺寸匹配：宽度≈bbox.w，高度≈bbox.h（允许±10%容差），不要明显超出 bbox。
3) 保持与地面接触正确（脚落地/阴影方向一致），透视比例自然。
4) 保留原房间布局与风格，只替换该件家具；不要新增或删除其他物体。

【输出要求】
- 写实、高清、自然光影，材质真实，颜色与房间协调
- 不要添加文字、水印、边框
```

### 5.2 Place Prompt v2（让 scale 不再是“抽象数字”）

```text
你是一名专业室内摄影级渲染师。请在不改变相机视角/透视/整体光照的前提下，把 {productName} 放置到输入房间照片中。

【产品信息】
- 产品：{productName}
- 产品真实尺寸：W={productW}m, D={productD}m, H={productH}m

【放置参数】
- 目标位置（图片百分比）：({x}%, {y}%)
- 旋转：{rotation}°
- 缩放：{scale}（注意：scale 仅用于微调，最终体量必须符合产品真实尺寸与房间比例）
- 房间真实尺寸参考：L={roomL}m, W={roomW}m, H={roomH}m

【必须满足的约束（尺寸匹配核心）】
1) 新家具在画面中体量合理：不要大到挡住通道/窗户，也不要小到像玩具模型。
2) 新家具落地与阴影正确，且与周围家具的相对比例自然。
3) 不要改变墙面/地面材质、不要重绘其他家具。

【输出要求】
- 写实、高清、自然光影
- 不要添加文字、水印、边框
```

---

## 7. multi-render（Decor8AI）可落地的“尺寸注入”写法（低成本）

### 6.1 在 `decor_items[].name` 注入尺寸（示例）
把：
- `name: "Mori Performance Fabric Chaise Sectional Sofa"`
改为：
- `name: "Mori Performance Fabric Chaise Sectional Sofa (approx W2.69m D1.30m H0.52m)"`

> 这不会 100% 保证，但在“只能靠文字暗示”的约束下，属于性价比很高的改动。

### 6.2 把 `design_style` 从写死改为基于检测结果映射
检测结果里已经有 `roomStyle`（Modern/Nordic/...），建议在 multi-render 入参里映射成 Decor8AI 支持的 style（至少别永远 `'minimalist'`）。

---

## 8. 最小改动落地清单（建议你们按这个顺序做）

1) **先改 `/api/ai/replace` 的 prompt（P0）**：加入 bbox + product dims + 强约束（第 6.1）
2) **补齐 bbox 来源（P0）**：前端传 bbox 或后端存上下文（二选一）
3) **multi-render 注入尺寸（P1）**：把尺寸拼进 `decor_items.name`
4) **修复尺寸解析（P2）**：`70/130cm` 取 max 或 range（避免深度被低估）

