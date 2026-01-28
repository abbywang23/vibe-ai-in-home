#!/usr/bin/env python3
"""
Qwen 房间分析测试脚本
测试 Qwen-VL 模型是否能正确解析房间图片并返回结构化数据
"""

import os
import json
import re
import requests
from typing import Optional, Dict, Any
from pathlib import Path

# DashScope API 配置
DASHSCOPE_API_BASE = "https://dashscope.aliyuncs.com/compatible-mode/v1"
MODEL_VL = "qwen3-vl-plus"  # 视觉模型
MODEL_TEXT = "qwen-plus"  # 文本模型

# 系统 Prompt（与 TypeScript 版本一致）
SYSTEM_PROMPT = """你是一个专业的室内设计师、家具识别专家和房间分析专家。请全面分析这张房间图片，提供详细的房间信息。

**你的核心任务：**
1. 识别房间类型（living_room/bedroom/dining_room/home_office）
2. 检测所有家具及其精确位置（仅识别系统支持的家具类型）
3. 估计房间尺寸（长×宽×高）
4. 识别房间装饰风格
5. 判断房间是否为空
6. 提供每个分析结果的置信度

**支持的家具类型（仅识别以下类型）：**
- **sofa**：沙发（包括单人沙发、双人沙发、三人沙发、L型沙发、转角沙发等）
- **table**：桌子（包括餐桌、茶几、边桌、咖啡桌等）
- **chair**：椅子（包括餐椅、办公椅、休闲椅、扶手椅等）
- **storage**：储物家具（包括柜子、书架、边柜、电视柜、衣柜、储物柜等）
- **bed**：床（包括单人床、双人床、大床等）
- **desk**：书桌/办公桌（包括办公桌、书桌、电脑桌等）

**重要：家具识别规则**
- 只识别上述6种家具类型，不要识别其他类型（如装饰品、植物、灯具、地毯等）
- 如果图片中有不支持的家具类型，请忽略它们，不要包含在 detectedItems 中
- 对于模糊的家具，优先归类到最接近的6种类型之一
  - 例如：茶几、边桌 → table
  - 例如：电视柜、边柜、书架 → storage
  - 例如：餐椅、办公椅 → chair

**房间类型识别标准：**
- **living_room（客厅）**：主要特征包括沙发、茶几、电视、休闲区域、地毯、书架等。空间通常较大，用于会客和休闲。
- **bedroom（卧室）**：主要特征包括床、衣柜、床头柜、梳妆台、窗帘等。空间相对私密，用于休息。
- **dining_room（餐厅）**：主要特征包括餐桌、餐椅、餐边柜、吊灯、餐具柜等。空间用于用餐。
- **home_office（家庭办公室）**：主要特征包括书桌、办公椅、书架、电脑设备、文件柜、台灯等。空间用于工作。

**房间风格识别标准：**
- **Modern（现代）**：简洁线条、中性色调（黑白灰为主）、金属/玻璃材质、几何形状、功能性设计
- **Nordic（北欧）**：浅色调（白色、浅灰、米色）、大量木质元素、简约设计、自然材质、绿植装饰、舒适感
- **Classic（经典）**：传统家具、深色木材、装饰性元素、对称布局、丰富细节、暖色调
- **Minimalist（极简）**：极简设计、大量留白、功能性优先、中性色调、少装饰、整洁
- **Industrial（工业）**：裸露砖墙、金属元素、复古风格、深色调、粗犷材质、管道外露
- **Contemporary（当代）**：现代与传统的融合、中性色调、舒适感、平衡设计、个性化
- **Traditional（传统）**：经典装饰、对称布局、丰富细节、暖色调、装饰性元素、正式感
- **Bohemian（波西米亚）**：色彩丰富、混搭风格、艺术装饰、自然元素、个性化、自由感

**尺寸估计方法：**
1. 参考标准物体：门高约2米，窗户宽度约1-1.5米，标准沙发长度约2-3米
2. 使用透视原理：根据图片中的透视关系估算实际尺寸
3. 家具比例：根据已知家具尺寸推算房间大小
4. 如果无法准确估计，提供合理范围（如：长度 3-5米）
5. 高度通常为 2.4-3.0米（标准层高）

**置信度评估标准：**
- 90-100：非常确定，特征非常明显
- 70-89：比较确定，特征较为明显
- 50-69：一般确定，有一定特征但不够明显
- 30-49：不太确定，特征不明显
- 0-29：非常不确定，几乎无法判断

**输出要求：**
- 必须返回有效的JSON格式
- 所有字段都必须存在
- 置信度为0-100的整数
- 家具bounding box坐标为0-100的百分比
- 尺寸单位统一（米或英尺）
- 房间类型必须是：living_room, bedroom, dining_room, home_office 之一
- 房间风格从以下选择：Modern, Nordic, Classic, Minimalist, Industrial, Contemporary, Traditional, Bohemian

请严格按照以下JSON格式返回结果：
{
  "isEmpty": boolean,
  "roomType": {
    "value": "living_room" | "bedroom" | "dining_room" | "home_office",
    "confidence": 0-100
  },
  "roomDimensions": {
    "length": number,
    "width": number,
    "height": number,
    "unit": "meters" | "feet",
    "confidence": 0-100
  },
  "roomStyle": {
    "value": "Modern" | "Nordic" | "Classic" | "Minimalist" | "Industrial" | "Contemporary" | "Traditional" | "Bohemian",
    "confidence": 0-100
  },
  "detectedItems": [
    {
      "itemId": "unique_id",
      "furnitureType": "sofa" | "table" | "chair" | "storage" | "bed" | "desk",
      "boundingBox": {
        "x": 0-100,
        "y": 0-100,
        "width": 0-100,
        "height": 0-100
      },
      "confidence": 0-1
    }
  ],
  "furnitureCount": {
    "value": number,
    "confidence": 0-100
  }
}"""


def get_user_prompt(room_dimensions: Optional[Dict[str, Any]] = None) -> str:
    """生成用户 Prompt"""
    prompt = """请全面分析这张房间图片，提供以下完整信息：

1. **房间类型**：从 living_room, bedroom, dining_room, home_office 中选择最匹配的类型
2. **家具检测**：仅识别系统支持的家具类型（sofa, table, chair, storage, bed, desk），列出所有检测到的家具，包括类型、位置（bounding box，使用0-100的百分比坐标）、置信度（0-1之间的小数）
   - 注意：只识别上述6种家具类型，忽略装饰品、植物、灯具、地毯等其他物品
3. **房间尺寸**：估计房间的长、宽、高（单位：米或英尺）
4. **房间风格**：识别装饰风格（Modern, Nordic, Classic, Minimalist, Industrial, Contemporary, Traditional, Bohemian等）
5. **是否为空**：判断房间是否为空房间
6. **家具数量**：统计检测到的家具总数（仅统计上述6种类型的家具）

"""
    
    if room_dimensions:
        dims = room_dimensions
        prompt += f"\n用户提供的房间尺寸参考：{dims['length']} × {dims['width']} × {dims['height']} {dims['unit']}\n"
        prompt += "（你可以参考这个信息，但主要基于图片的视觉分析）\n"
    
    prompt += "\n请返回完整的JSON结果，包含所有分析信息和置信度。确保JSON格式正确，可以直接解析。"
    
    return prompt


def image_to_base64(image_path: str) -> str:
    """将图片转换为 base64 编码"""
    import base64
    
    with open(image_path, 'rb') as f:
        image_data = f.read()
        base64_data = base64.b64encode(image_data).decode('utf-8')
        
        # 根据文件扩展名确定 MIME 类型
        ext = Path(image_path).suffix.lower()
        mime_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
        }
        mime_type = mime_types.get(ext, 'image/jpeg')
        
        return f"data:{mime_type};base64,{base64_data}"


def call_qwen_api(
    image_url_or_path: str,
    api_key: str,
    room_dimensions: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """调用 Qwen API 进行房间分析"""
    
    # 判断是 URL 还是本地文件路径
    if image_url_or_path.startswith('http://') or image_url_or_path.startswith('https://'):
        image_data = {"url": image_url_or_path}
    else:
        # 本地文件，转换为 base64
        if not os.path.exists(image_url_or_path):
            raise FileNotFoundError(f"图片文件不存在: {image_url_or_path}")
        image_data = {"url": image_to_base64(image_url_or_path)}
    
    # 构建请求消息
    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": image_data
                },
                {
                    "type": "text",
                    "text": get_user_prompt(room_dimensions)
                }
            ]
        }
    ]
    
    # 构建请求体
    payload = {
        "model": MODEL_VL,
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 2000,
    }
    
    # 发送请求
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }
    
    print(f"📤 正在调用 Qwen API (模型: {MODEL_VL})...")
    print(f"   图片: {image_url_or_path}")
    
    response = requests.post(
        f"{DASHSCOPE_API_BASE}/chat/completions",
        headers=headers,
        json=payload,
        timeout=120  # 120秒超时
    )
    
    if not response.ok:
        error_text = response.text
        raise Exception(f"Qwen API 错误 ({response.status_code}): {error_text}")
    
    return response.json()


def parse_ai_response(ai_response: str) -> Optional[Dict[str, Any]]:
    """解析 AI 返回的 JSON 响应"""
    try:
        # 尝试直接解析
        return json.loads(ai_response)
    except json.JSONDecodeError:
        # 如果失败，尝试提取 JSON 部分
        json_match = re.search(r'\{[\s\S]*\}', ai_response)
        if json_match:
            try:
                return json.loads(json_match.group(0))
            except json.JSONDecodeError:
                pass
    
    return None


def validate_analysis_result(result: Dict[str, Any]) -> tuple[bool, list[str]]:
    """验证分析结果是否符合要求"""
    errors = []
    
    # 检查必需字段
    required_fields = ['isEmpty', 'roomType', 'roomDimensions', 'roomStyle', 'detectedItems', 'furnitureCount']
    for field in required_fields:
        if field not in result:
            errors.append(f"缺少必需字段: {field}")
    
    # 检查房间类型
    if 'roomType' in result:
        room_type = result['roomType']
        if 'value' not in room_type:
            errors.append("roomType 缺少 value 字段")
        elif room_type['value'] not in ['living_room', 'bedroom', 'dining_room', 'home_office']:
            errors.append(f"roomType.value 无效: {room_type['value']}")
        if 'confidence' not in room_type:
            errors.append("roomType 缺少 confidence 字段")
        elif not (0 <= room_type['confidence'] <= 100):
            errors.append(f"roomType.confidence 超出范围: {room_type['confidence']}")
    
    # 检查房间尺寸
    if 'roomDimensions' in result:
        dims = result['roomDimensions']
        required_dims = ['length', 'width', 'height', 'unit', 'confidence']
        for field in required_dims:
            if field not in dims:
                errors.append(f"roomDimensions 缺少字段: {field}")
        if 'unit' in dims and dims['unit'] not in ['meters', 'feet']:
            errors.append(f"roomDimensions.unit 无效: {dims['unit']}")
    
    # 检查房间风格
    if 'roomStyle' in result:
        style = result['roomStyle']
        valid_styles = ['Modern', 'Nordic', 'Classic', 'Minimalist', 'Industrial', 'Contemporary', 'Traditional', 'Bohemian']
        if 'value' not in style:
            errors.append("roomStyle 缺少 value 字段")
        elif style['value'] not in valid_styles:
            errors.append(f"roomStyle.value 无效: {style['value']}")
    
    # 检查家具列表
    if 'detectedItems' in result:
        if not isinstance(result['detectedItems'], list):
            errors.append("detectedItems 必须是数组")
        else:
            valid_furniture_types = ['sofa', 'table', 'chair', 'storage', 'bed', 'desk']
            for i, item in enumerate(result['detectedItems']):
                required_item_fields = ['itemId', 'furnitureType', 'boundingBox', 'confidence']
                for field in required_item_fields:
                    if field not in item:
                        errors.append(f"detectedItems[{i}] 缺少字段: {field}")
                # 验证家具类型
                if 'furnitureType' in item:
                    if item['furnitureType'] not in valid_furniture_types:
                        errors.append(f"detectedItems[{i}].furnitureType 无效: {item['furnitureType']} (必须是以下之一: {', '.join(valid_furniture_types)})")
    
    return len(errors) == 0, errors


def print_analysis_result(result: Dict[str, Any]):
    """美化打印分析结果"""
    print("\n" + "="*60)
    print("📊 房间分析结果")
    print("="*60)
    
    # 房间类型
    if 'roomType' in result:
        rt = result['roomType']
        print(f"\n🏠 房间类型: {rt.get('value', 'N/A')}")
        print(f"   置信度: {rt.get('confidence', 0)}%")
    
    # 房间尺寸
    if 'roomDimensions' in result:
        rd = result['roomDimensions']
        print(f"\n📐 房间尺寸: {rd.get('length', 0)} × {rd.get('width', 0)} × {rd.get('height', 0)} {rd.get('unit', 'meters')}")
        print(f"   置信度: {rd.get('confidence', 0)}%")
    
    # 房间风格
    if 'roomStyle' in result:
        rs = result['roomStyle']
        print(f"\n🎨 房间风格: {rs.get('value', 'N/A')}")
        print(f"   置信度: {rs.get('confidence', 0)}%")
    
    # 是否为空
    print(f"\n📦 是否为空: {'是' if result.get('isEmpty', False) else '否'}")
    
    # 家具数量
    if 'furnitureCount' in result:
        fc = result['furnitureCount']
        print(f"\n🪑 家具数量: {fc.get('value', 0)}")
        print(f"   置信度: {fc.get('confidence', 0)}%")
    
    # 检测到的家具
    if 'detectedItems' in result and result['detectedItems']:
        print(f"\n🪑 检测到的家具 ({len(result['detectedItems'])} 件):")
        for i, item in enumerate(result['detectedItems'], 1):
            print(f"   {i}. {item.get('furnitureType', 'N/A')}")
            bbox = item.get('boundingBox', {})
            print(f"      位置: ({bbox.get('x', 0)}, {bbox.get('y', 0)}) 尺寸: {bbox.get('width', 0)}×{bbox.get('height', 0)}")
            print(f"      置信度: {item.get('confidence', 0)*100:.1f}%")
    
    print("\n" + "="*60)


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='测试 Qwen 房间分析功能')
    parser.add_argument('image', help='图片路径或URL')
    parser.add_argument('--api-key', help='DashScope API Key (或设置环境变量 DASHSCOPE_API_KEY)')
    parser.add_argument('--length', type=float, help='房间长度（参考值）')
    parser.add_argument('--width', type=float, help='房间宽度（参考值）')
    parser.add_argument('--height', type=float, help='房间高度（参考值）')
    parser.add_argument('--unit', default='meters', choices=['meters', 'feet'], help='尺寸单位')
    parser.add_argument('--save', help='保存结果到JSON文件')
    
    args = parser.parse_args()
    
    # 获取 API Key
    api_key = args.api_key or os.getenv('DASHSCOPE_API_KEY')
    if not api_key:
        print("❌ 错误: 未找到 API Key")
        print("   请设置环境变量 DASHSCOPE_API_KEY 或使用 --api-key 参数")
        return 1
    
    if not api_key.startswith('sk-'):
        print("⚠️  警告: API Key 格式可能不正确（应以 'sk-' 开头）")
    
    # 构建房间尺寸参考（如果提供）
    room_dimensions = None
    if args.length and args.width and args.height:
        room_dimensions = {
            'length': args.length,
            'width': args.width,
            'height': args.height,
            'unit': args.unit
        }
        print(f"📏 使用房间尺寸参考: {room_dimensions['length']} × {room_dimensions['width']} × {room_dimensions['height']} {room_dimensions['unit']}")
    
    try:
        # 调用 API
        response = call_qwen_api(args.image, api_key, room_dimensions)
        
        # 提取 AI 响应内容
        if 'choices' not in response or not response['choices']:
            print("❌ API 响应格式错误: 缺少 choices 字段")
            return 1
        
        ai_content = response['choices'][0]['message']['content']
        print(f"\n📥 收到 AI 响应 (长度: {len(ai_content)} 字符)")
        
        # 解析 JSON
        print("\n🔍 正在解析 JSON...")
        result = parse_ai_response(ai_content)
        
        if not result:
            print("❌ 无法解析 JSON 响应")
            print("\n原始响应:")
            print(ai_content)
            return 1
        
        # 验证结果
        print("\n✅ JSON 解析成功")
        is_valid, errors = validate_analysis_result(result)
        
        if not is_valid:
            print("\n⚠️  验证失败，发现以下问题:")
            for error in errors:
                print(f"   - {error}")
        else:
            print("✅ 验证通过，所有字段符合要求")
        
        # 打印结果
        print_analysis_result(result)
        
        # 保存结果（如果指定）
        if args.save:
            with open(args.save, 'w', encoding='utf-8') as f:
                json.dump({
                    'raw_response': ai_content,
                    'parsed_result': result,
                    'validation': {
                        'is_valid': is_valid,
                        'errors': errors
                    }
                }, f, ensure_ascii=False, indent=2)
            print(f"\n💾 结果已保存到: {args.save}")
        
        return 0 if is_valid else 1
        
    except Exception as e:
        print(f"\n❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    exit(main())
