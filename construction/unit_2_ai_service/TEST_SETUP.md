# 测试设置指南

## ✅ 环境已准备完成

1. ✅ Python 3.13.5 已安装
2. ✅ 虚拟环境已创建 (`test_env/`)
3. ✅ requests 库已安装
4. ✅ 测试脚本已就绪

## 🔑 设置 API Key

### 方法 1: 设置环境变量（推荐）

```bash
# 在终端中设置（当前会话有效）
export DASHSCOPE_API_KEY=sk-your-api-key-here

# 或添加到 ~/.zshrc 或 ~/.bashrc（永久生效）
echo 'export DASHSCOPE_API_KEY=sk-your-api-key-here' >> ~/.zshrc
source ~/.zshrc
```

### 方法 2: 使用命令行参数

```bash
source test_env/bin/activate
python3 test_qwen_room_analysis.py image.jpg --api-key sk-your-api-key-here
```

## 🚀 运行测试

### 激活虚拟环境

```bash
cd /Users/kaizelin/castlery/git_code/ai-in-home/vibe-ai-in-home/construction/unit_2_ai_service
source test_env/bin/activate
```

### 测试命令

```bash
# 使用在线图片 URL
python3 test_qwen_room_analysis.py "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800"

# 使用本地图片
python3 test_qwen_room_analysis.py /path/to/your/room_image.jpg

# 带房间尺寸参考
python3 test_qwen_room_analysis.py image.jpg \
  --length 4.5 \
  --width 3.8 \
  --height 2.7 \
  --unit meters

# 保存结果到文件
python3 test_qwen_room_analysis.py image.jpg --save result.json
```

## 📝 获取 API Key

1. 访问 [阿里云百炼控制台](https://bailian.console.aliyun.com/)
2. 注册/登录账号
3. 创建 API Key（以 `sk-` 开头）
4. 复制 API Key 并设置到环境变量

## 🎯 测试图片建议

可以使用以下公开图片 URL 进行测试：

- 客厅: `https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800`
- 卧室: `https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800`
- 餐厅: `https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800`

## ⚠️ 注意事项

- API Key 需要以 `sk-` 开头
- 确保网络可以访问 DashScope API
- 图片 URL 必须是公开可访问的
- 本地图片路径需要是绝对路径或相对于当前目录的路径

## 🔍 验证设置

运行以下命令验证环境：

```bash
source test_env/bin/activate
python3 -c "import requests; print('✅ requests 已安装')"
echo "API Key: ${DASHSCOPE_API_KEY:0:10}..."  # 显示前10位
```
