# 快速开始 - Qwen 房间分析测试

## 🚀 5分钟快速测试

### 步骤 1: 安装依赖

```bash
pip install requests
```

### 步骤 2: 设置 API Key

```bash
# Linux/Mac
export DASHSCOPE_API_KEY=sk-your-api-key-here

# Windows
set DASHSCOPE_API_KEY=sk-your-api-key-here
```

### 步骤 3: 运行测试

```bash
# 使用本地图片
python3 test_qwen_room_analysis.py /path/to/your/room_image.jpg

# 或使用在线图片 URL
python3 test_qwen_room_analysis.py https://example.com/room.jpg
```

## 📸 测试图片建议

### 推荐的测试图片类型：

1. **客厅图片** (living_room)
   - 包含沙发、茶几、电视
   - 现代或北欧风格

2. **卧室图片** (bedroom)
   - 包含床、衣柜、床头柜
   - 简约或经典风格

3. **餐厅图片** (dining_room)
   - 包含餐桌、餐椅
   - 传统或现代风格

4. **空房间图片**
   - 测试 isEmpty 检测
   - 测试尺寸估计能力

## 🎯 测试用例示例

### 测试 1: 基本分析

```bash
python3 test_qwen_room_analysis.py room.jpg
```

**预期结果**：
- ✅ 正确识别房间类型
- ✅ 检测到家具
- ✅ 估计房间尺寸
- ✅ 识别房间风格

### 测试 2: 带尺寸参考

```bash
python3 test_qwen_room_analysis.py room.jpg \
  --length 4.5 \
  --width 3.8 \
  --height 2.7 \
  --unit meters
```

**预期结果**：
- ✅ AI 会参考提供的尺寸，但主要基于图片分析
- ✅ 尺寸估计可能更准确

### 测试 3: 保存结果

```bash
python3 test_qwen_room_analysis.py room.jpg --save result.json
```

**预期结果**：
- ✅ 生成包含原始响应和解析结果的 JSON 文件
- ✅ 可用于后续分析和调试

## ✅ 验证检查清单

运行测试后，检查以下内容：

- [ ] **JSON 解析成功**：没有解析错误
- [ ] **验证通过**：所有字段符合要求
- [ ] **房间类型**：值在 [living_room, bedroom, dining_room, home_office] 中
- [ ] **房间风格**：值在预定义的风格列表中
- [ ] **置信度**：所有置信度在 0-100 范围内
- [ ] **家具检测**：检测到的家具数量合理
- [ ] **尺寸估计**：尺寸值合理（如：长度 3-6米）

## 🐛 常见问题

### Q: API Key 在哪里获取？
A: 访问 [阿里云百炼控制台](https://bailian.console.aliyun.com/) 注册并获取 API Key

### Q: 支持哪些图片格式？
A: JPG, PNG, WebP（通过 URL 或本地文件）

### Q: 测试需要多长时间？
A: 通常 10-30 秒，取决于图片大小和网络速度

### Q: 如何查看详细的错误信息？
A: 脚本会打印完整的错误堆栈，检查控制台输出

## 📊 预期输出示例

```
📤 正在调用 Qwen API (模型: qwen3-vl-plus)...
   图片: ./test_images/living_room.jpg

📥 收到 AI 响应 (长度: 1234 字符)

🔍 正在解析 JSON...
✅ JSON 解析成功
✅ 验证通过，所有字段符合要求

============================================================
📊 房间分析结果
============================================================

🏠 房间类型: living_room
   置信度: 92%

📐 房间尺寸: 4.5 × 3.8 × 2.7 meters
   置信度: 75%

🎨 房间风格: Modern
   置信度: 88%

📦 是否为空: 否

🪑 家具数量: 3
   置信度: 90%

🪑 检测到的家具 (3 件):
   1. sofa
      位置: (15, 30) 尺寸: 40×25
      置信度: 92.0%
   2. coffee_table
      位置: (25, 50) 尺寸: 20×15
      置信度: 85.0%
   3. tv_stand
      位置: (60, 20) 尺寸: 25×15
      置信度: 78.0%

============================================================
```

## 🎉 成功标志

如果看到以下内容，说明测试成功：

1. ✅ **JSON 解析成功**
2. ✅ **验证通过，所有字段符合要求**
3. ✅ 房间类型、尺寸、风格都有合理的值
4. ✅ 置信度在合理范围内（通常 > 50）

## 📝 下一步

测试成功后，可以：

1. 将结果与 TypeScript 实现对比
2. 优化 Prompt 以提高准确性
3. 测试不同类型的房间图片
4. 集成到实际项目中
