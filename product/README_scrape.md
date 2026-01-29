# 商品数据爬取脚本说明

## scrape_more_products.py

这个脚本用于爬取 Castlery 网站的更多商品数据，并自动去重。

### 功能特点

1. **批量爬取**: 从8个主要类目中爬取商品数据
   - Sofas（沙发）
   - Tables（桌子）
   - Chairs（椅子）
   - Beds（床）
   - Storage（储物）
   - Furniture Sets（家具套装）
   - Outdoor（户外）
   - Accessories（配件）

2. **自动去重**: 
   - 基于商品URL去重（去除查询参数）
   - 基于商品名称去重（标准化处理）
   - 读取现有 `products.yaml` 文件，避免重复爬取

3. **数据完整性**: 
   - 提取商品名称、价格、描述
   - 提取商品选项（material, color, size等）
   - 提取商品图片（最多10张）
   - 提取分类和系列信息

### 使用方法

```bash
cd vibe-ai-in-home/product
python3 scrape_more_products.py
```

### 输出文件

脚本会将结果保存到 `products_extended.yaml` 文件。

### 配置参数

可以在脚本中修改以下参数：

- `PRODUCTS_PER_CATEGORY`: 每个类目爬取的商品数量（默认25个）

### 注意事项

1. 脚本需要安装 Playwright 和相关依赖
2. 爬取过程可能需要较长时间（取决于商品数量）
3. 脚本会自动跳过已存在的商品（基于URL和名称）
4. 如果网络不稳定，部分商品可能爬取失败，但不会影响整体流程

### 去重逻辑

- URL去重：去除查询参数后比较基础URL
- 名称去重：标准化处理（转小写、去除多余空格）后比较
