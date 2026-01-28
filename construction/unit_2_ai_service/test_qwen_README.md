# Qwen 房间分析测试脚本使用说明

## 📋 简介

这个 Python 脚本用于测试 Qwen-VL 模型是否能正确解析房间图片并返回结构化的分析数据。

## 🔧 环境准备

### 1. 安装依赖

```bash
pip install requests
```

或者使用 requirements.txt：

```bash
pip install -r requirements.txt
```

### 2. 获取 API Key

1. 访问 [阿里云百炼控制台](https://bailian.console.aliyun.com/)
2. 创建账号并获取 API Key（以 `sk-` 开头）
3. 设置环境变量：

```bash
export DASHSCOPE_API_KEY=sk-your-api-key-here
```

或者在 Windows 上：

```cmd
set DASHSCOPE_API_KEY=sk-your-api-key-here
```

## 🚀 使用方法

### 基本用法

```bash
# 使用本地图片文件
python test_qwen_room_analysis.py /path/to/room_image.jpg

# 使用图片 URL
python test_qwen_room_analysis.py https://example.com/room_image.jpg

# 指定 API Key（如果未设置环境变量）
python test_qwen_room_analysis.py image.jpg --api-key sk-your-api-key
```

### 带房间尺寸参考

```bash
python test_qwen_room_analysis.py image.jpg \
  --length 4.5 \
  --width 3.8 \
  --height 2.7 \
  --unit meters
```

### 保存结果到文件

```bash
python test_qwen_room_analysis.py image.jpg --save result.json
```

### 完整示例

```bash
python test_qwen_room_analysis.py \
  ./test_images/living_room.jpg \
  --length 5.0 \
  --width 4.0 \
  --height 2.8 \
  --unit meters \
  --save analysis_result.json
```

## 📊 输出说明

脚本会输出：

1. **API 调用信息**：显示正在调用的模型和图片路径
2. **解析状态**：显示 JSON 解析是否成功
3. **验证结果**：检查返回的数据是否符合要求
4. **分析结果**：美化打印的分析结果，包括：
   - 🏠 房间类型（living_room/bedroom/dining_room/home_office）
   - 📐 房间尺寸（长×宽×高）
   - 🎨 房间风格（Modern/Nordic/Classic等）
   - 📦 是否为空
   - 🪑 家具数量和列表

## ✅ 验证检查

脚本会自动验证返回的数据是否包含：

- ✅ 所有必需字段（isEmpty, roomType, roomDimensions, roomStyle, detectedItems, furnitureCount）
- ✅ 房间类型值是否有效（living_room/bedroom/dining_room/home_office）
- ✅ 房间风格值是否有效（Modern/Nordic/Classic等）
- ✅ 置信度是否在 0-100 范围内
- ✅ 尺寸单位是否有效（meters/feet）
- ✅ 家具列表格式是否正确

## 📝 示例输出

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

## 🐛 故障排除

### 1. API Key 错误

```
❌ 错误: 未找到 API Key
```

**解决方案**：设置环境变量 `DASHSCOPE_API_KEY` 或使用 `--api-key` 参数

### 2. 图片文件不存在

```
FileNotFoundError: 图片文件不存在: image.jpg
```

**解决方案**：检查图片路径是否正确

### 3. JSON 解析失败

```
❌ 无法解析 JSON 响应
```

**解决方案**：
- 检查 API Key 是否有效
- 检查图片格式是否支持（JPG, PNG）
- 查看原始响应内容，可能需要优化 Prompt

### 4. 网络超时

```
Qwen API request timeout
```

**解决方案**：
- 检查网络连接
- 图片文件可能太大，尝试压缩图片
- 使用更小的图片尺寸

## 📦 依赖

- `requests`: HTTP 请求库
- Python 3.7+

## 🔗 相关文档

- [Qwen-VL 模型文档](https://help.aliyun.com/zh/model-studio/developer-reference/qwen-vl-plus)
- [DashScope API 文档](https://help.aliyun.com/zh/model-studio/developer-reference/api-details-9)

## 📄 许可证

与项目主许可证一致
