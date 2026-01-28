#!/bin/bash

# Test script for wan2.5-i2i-preview API using curl (image synthesis)
# Uploads images to Cloudinary first, then uses URLs for API call

set -e  # Exit on error

echo "测试 wan2.5-i2i-preview 图片合成接口..."
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check DashScope API Key
if [ -z "$DASHSCOPE_API_KEY" ] || [[ ! "$DASHSCOPE_API_KEY" =~ ^sk- ]]; then
    echo "错误: DASHSCOPE_API_KEY 未配置或格式不正确"
    echo "当前 API Key: ${DASHSCOPE_API_KEY:0:10}..."
    exit 1
fi

# Cloudinary credentials
CLOUDINARY_API_KEY="117752995173679"
CLOUDINARY_API_SECRET="OGiujqsUNHsYduK3mg96lEg_L4I"
# Cloud name must be provided - it's found in Cloudinary Dashboard
# You can set it via environment variable: export CLOUDINARY_CLOUD_NAME=your-cloud-name
# Or uncomment and set it directly below:
# CLOUDINARY_CLOUD_NAME="your-cloud-name-here"
CLOUDINARY_CLOUD_NAME="${CLOUDINARY_CLOUD_NAME:-dyurkavye}"

echo "DashScope API Key 配置正确"
echo "Cloudinary 配置:"
echo "  API Key: $CLOUDINARY_API_KEY"
echo "  Cloud Name: $CLOUDINARY_CLOUD_NAME"
echo ""

# Get project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Function to upload image to Cloudinary and get URL
upload_to_cloudinary() {
    local image_path="$1"
    local image_name="$2"
    
    if [ ! -f "$image_path" ]; then
        echo "❌ 错误: 图片文件不存在: $image_path" >&2
        return 1
    fi
    
    echo "正在上传到 Cloudinary: $image_name" >&2
    
    # Generate timestamp for signature
    local timestamp=$(date +%s)
    local public_id="test_wan25_${image_name}_${timestamp}"
    
    # Generate signature: sha1(public_id=xxx&timestamp=xxx + api_secret)
    # Cloudinary signature format: sha1(parameter_string + api_secret)
    local signature_string="public_id=${public_id}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}"
    local signature=$(echo -n "$signature_string" | shasum -a 1 | cut -d' ' -f1)
    
    # Upload to Cloudinary with signature
    local upload_response=$(curl -s -X POST \
        "https://api.cloudinary.com/v1_1/$CLOUDINARY_CLOUD_NAME/image/upload" \
        -F "file=@$image_path" \
        -F "api_key=$CLOUDINARY_API_KEY" \
        -F "timestamp=$timestamp" \
        -F "signature=$signature" \
        -F "public_id=$public_id")
    
    # Check if upload was successful
    local secure_url=$(echo "$upload_response" | grep -o '"secure_url":"[^"]*' | cut -d'"' -f4)
    local url=$(echo "$upload_response" | grep -o '"url":"[^"]*' | cut -d'"' -f4)
    
    if [ -n "$secure_url" ]; then
        echo "$secure_url"
        return 0
    elif [ -n "$url" ]; then
        echo "$url"
        return 0
    else
        echo "❌ 上传失败: $upload_response" >&2
        return 1
    fi
}

# 1. Upload room image to Cloudinary
ROOM_IMAGE_PATH="$PROJECT_ROOT/Image (2).jpeg"

if [ ! -f "$ROOM_IMAGE_PATH" ]; then
    echo "❌ 错误: 房间图片不存在: $ROOM_IMAGE_PATH"
    exit 1
fi

echo "上传房间图片到 Cloudinary..."
ROOM_IMAGE_URL=$(upload_to_cloudinary "$ROOM_IMAGE_PATH" "room")
if [ $? -ne 0 ] || [ -z "$ROOM_IMAGE_URL" ]; then
    echo "❌ 错误: 房间图片上传失败"
    exit 1
fi
echo "✅ 房间图片 URL: $ROOM_IMAGE_URL"
echo ""

# 2. Read product image URLs from products.yaml (use URLs directly)
PRODUCTS_YAML="$PROJECT_ROOT/vibe-ai-in-home/product/products.yaml"

if [ ! -f "$PRODUCTS_YAML" ]; then
    echo "错误: 找不到 products.yaml 文件: $PRODUCTS_YAML"
    exit 1
fi

echo "读取产品配置: $PRODUCTS_YAML"

# Use Node.js to extract product image URLs from YAML
TEMP_JSON=$(mktemp)
node -e "
const fs = require('fs');
const yaml = require('js-yaml');

const productsYaml = fs.readFileSync('$PRODUCTS_YAML', 'utf8');
const productsData = yaml.load(productsYaml);

const imageUrls = [];
if (productsData.categories && productsData.categories.length > 0) {
  for (const category of productsData.categories) {
    if (category.products && category.products.length > 0) {
      for (const product of category.products) {
        if (product.images && product.images.length > 0 && imageUrls.length < 2) {
          imageUrls.push(product.images[0].url);
          process.stderr.write('  添加产品图片: ' + product.name + '\\n');
        }
        if (imageUrls.length >= 2) break;
      }
      if (imageUrls.length >= 2) break;
    }
  }
}

fs.writeFileSync('$TEMP_JSON', JSON.stringify(imageUrls));
" 2>&1

if [ $? -ne 0 ]; then
    echo "❌ 错误: 无法解析 products.yaml"
    rm -f "$TEMP_JSON"
    exit 1
fi

# Read product image URLs from temp file
PRODUCT_IMAGES_JSON=$(cat "$TEMP_JSON")
rm -f "$TEMP_JSON"

# Parse JSON array into bash variables
PRODUCT_IMAGE_1=$(echo "$PRODUCT_IMAGES_JSON" | node -e "const arr = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(arr[0] || '')")
PRODUCT_IMAGE_2=$(echo "$PRODUCT_IMAGES_JSON" | node -e "const arr = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(arr[1] || '')")

echo ""
echo "✅ 使用产品图片 URL（来自 products.yaml）"
echo ""

# Build JSON payload using URLs (not base64)
PROMPT="请基于房间图片和家具产品图片，生成一张现代简约风格的客厅渲染图。将家具产品自然地融入到房间中，保持整体风格协调，布局合理，光线自然"

# Build images array
IMAGES_JSON="["
IMAGES_JSON+="\"$ROOM_IMAGE_URL\""
if [ -n "$PRODUCT_IMAGE_1" ] && [ "$PRODUCT_IMAGE_1" != "null" ]; then
    IMAGES_JSON+=",\"$PRODUCT_IMAGE_1\""
fi
if [ -n "$PRODUCT_IMAGE_2" ] && [ "$PRODUCT_IMAGE_2" != "null" ]; then
    IMAGES_JSON+=",\"$PRODUCT_IMAGE_2\""
fi
IMAGES_JSON+="]"

# Count images
IMAGE_COUNT=$(echo "$IMAGES_JSON" | node -e "console.log(JSON.parse(require('fs').readFileSync(0, 'utf8')).length)")

# Build JSON payload
TEMP_JSON_PAYLOAD=$(mktemp)
cat > "$TEMP_JSON_PAYLOAD" <<EOF
{
  "model": "wan2.5-i2i-preview",
  "input": {
    "prompt": "$PROMPT",
    "images": $IMAGES_JSON
  },
  "parameters": {
    "n": 1
  }
}
EOF

echo "使用 $IMAGE_COUNT 张图片（URL）进行图片合成测试"

echo "发送请求到 wan2.5-i2i-preview（异步调用）..."
echo "注意: 当前账户仅支持异步调用，将使用异步模式"
echo "请求数据:"
cat "$TEMP_JSON_PAYLOAD" | jq '.' 2>/dev/null || cat "$TEMP_JSON_PAYLOAD"
echo ""
echo ""

# Make the API call (asynchronous - required for this account)
START_TIME=$(date +%s)

echo "提交异步任务..."
RESPONSE=$(curl -s -w "\n%{http_code}" --location 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis' \
    -H 'X-DashScope-Async: enable' \
    -H "Authorization: Bearer $DASHSCOPE_API_KEY" \
    -H 'Content-Type: application/json' \
    -d "@$TEMP_JSON_PAYLOAD")

# Clean up temp file
rm -f "$TEMP_JSON_PAYLOAD"

END_TIME=$(date +%s)
RESPONSE_TIME=$((END_TIME - START_TIME))

# Extract HTTP status code (last line)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo ""
echo "响应时间: ${RESPONSE_TIME}秒"
echo "HTTP 状态码: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    echo "✅ 任务提交成功！"
    
    # Extract task ID
    TASK_ID=$(echo "$BODY" | jq -r '.task_id // .output.task_id // empty' 2>/dev/null)
    
    if [ -z "$TASK_ID" ] || [ "$TASK_ID" = "null" ]; then
        echo "❌ 无法获取任务 ID"
        echo "响应内容:"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
        exit 1
    fi
    
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "任务 ID: $TASK_ID"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    echo "开始轮询任务状态（每 3 秒查询一次）..."
    echo ""
    
    # Poll for task completion
    MAX_ATTEMPTS=120  # 最多轮询 120 次（约 6 分钟）
    ATTEMPT=0
    INTERVAL=3  # 每 3 秒查询一次
    LAST_STATUS=""
    
    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        ATTEMPT=$((ATTEMPT + 1))
        
        # Show progress indicator every 10 attempts
        if [ $((ATTEMPT % 10)) -eq 0 ]; then
            echo "[$(date +%H:%M:%S)] 已轮询 $ATTEMPT 次，继续等待..."
        fi
        
        sleep $INTERVAL
        
        TASK_RESPONSE=$(curl -s -w "\n%{http_code}" --location "https://dashscope.aliyuncs.com/api/v1/tasks/$TASK_ID" \
            -H "Authorization: Bearer $DASHSCOPE_API_KEY")
        
        TASK_HTTP_CODE=$(echo "$TASK_RESPONSE" | tail -n1)
        TASK_BODY=$(echo "$TASK_RESPONSE" | sed '$d')
        
        if [ "$TASK_HTTP_CODE" -ge 200 ] && [ "$TASK_HTTP_CODE" -lt 300 ]; then
            TASK_STATUS=$(echo "$TASK_BODY" | jq -r '.output.task_status // .task_status // empty' 2>/dev/null)
            
            # Only print if status changed
            if [ "$TASK_STATUS" != "$LAST_STATUS" ]; then
                echo "[$(date +%H:%M:%S)] [$ATTEMPT] 任务状态: $TASK_STATUS"
                LAST_STATUS="$TASK_STATUS"
            fi
            
            if [ "$TASK_STATUS" = "SUCCEEDED" ]; then
                echo ""
                echo "═══════════════════════════════════════════════════════════"
                echo "✅ 任务完成！"
                echo "═══════════════════════════════════════════════════════════"
                echo ""
                
                # Extract image URL (try multiple possible paths)
                IMAGE_URL=$(echo "$TASK_BODY" | jq -r '
                    .output.results[0].url // 
                    .output.result[0].url // 
                    .output.results[0].image // 
                    .output.result[0].image // 
                    .output.image_url // 
                    .output.choices[0].message.content[0].image // 
                    empty' 2>/dev/null)
                
                if [ -n "$IMAGE_URL" ] && [ "$IMAGE_URL" != "null" ]; then
                    echo "✅ 成功生成图片！"
                    echo "图片 URL: $IMAGE_URL"
                    echo ""
                    
                    # Download and save the image
                    OUTPUT_DIR="$SCRIPT_DIR/output"
                    mkdir -p "$OUTPUT_DIR"
                    OUTPUT_PATH="$OUTPUT_DIR/test_wan25_$(date +%s).png"
                    
                    echo "正在下载图片..."
                    DOWNLOAD_RESPONSE=$(curl -s -w "\n%{http_code}" "$IMAGE_URL" -o "$OUTPUT_PATH")
                    DOWNLOAD_CODE=$(echo "$DOWNLOAD_RESPONSE" | tail -n1)
                    
                    if [ "$DOWNLOAD_CODE" -ge 200 ] && [ "$DOWNLOAD_CODE" -lt 300 ] && [ -f "$OUTPUT_PATH" ]; then
                        FILE_SIZE=$(du -h "$OUTPUT_PATH" | cut -f1)
                        echo "✅ 图片已保存到: $OUTPUT_PATH"
                        echo "   文件大小: $FILE_SIZE"
                        echo "   绝对路径: $(cd "$(dirname "$OUTPUT_PATH")" && pwd)/$(basename "$OUTPUT_PATH")"
                    else
                        echo "⚠️  下载图片失败 (HTTP $DOWNLOAD_CODE)"
                    fi
                    
                    # Calculate total time
                    END_TIME=$(date +%s)
                    TOTAL_TIME=$((END_TIME - START_TIME))
                    echo ""
                    echo "总耗时: ${TOTAL_TIME}秒 ($(($TOTAL_TIME / 60))分$(($TOTAL_TIME % 60))秒)"
                else
                    echo "⚠️  响应中未找到图片 URL"
                    echo "完整响应:"
                    echo "$TASK_BODY" | jq '.' 2>/dev/null || echo "$TASK_BODY"
                fi
                break
            elif [ "$TASK_STATUS" = "FAILED" ]; then
                echo ""
                echo "═══════════════════════════════════════════════════════════"
                echo "❌ 任务失败"
                echo "═══════════════════════════════════════════════════════════"
                echo ""
                echo "错误信息:"
                echo "$TASK_BODY" | jq '.' 2>/dev/null || echo "$TASK_BODY"
                exit 1
            fi
        else
            if [ $((ATTEMPT % 10)) -eq 1 ]; then
                echo "[$(date +%H:%M:%S)] ⚠️  查询任务状态失败 (HTTP $TASK_HTTP_CODE)"
            fi
        fi
    done
    
    if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
        echo ""
        echo "═══════════════════════════════════════════════════════════"
        echo "⚠️  轮询超时（已轮询 $MAX_ATTEMPTS 次，约 $((MAX_ATTEMPTS * INTERVAL / 60)) 分钟）"
        echo "═══════════════════════════════════════════════════════════"
        echo ""
        echo "任务可能仍在处理中，请稍后使用以下命令查询:"
        echo ""
        echo "curl -H \"Authorization: Bearer \$DASHSCOPE_API_KEY\" \\"
        echo "     https://dashscope.aliyuncs.com/api/v1/tasks/$TASK_ID"
        echo ""
        echo "任务 ID: $TASK_ID"
    fi
else
    echo "❌ API 错误响应:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    exit 1
fi

echo ""
echo "✅ 测试完成"
