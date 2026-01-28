#!/usr/bin/env python3
"""
测试 decor8ai API 生成室内设计图像
使用 test-wan25-curl.sh 中的相关数据
"""

import json
import base64
import yaml
import requests
import os
import hashlib
import time
from pathlib import Path
from typing import List, Dict, Any, Optional

# API 配置
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5X3V1aWQiOiI1NzEzMDIzOS1kMzU5LTQzOGEtYjA1Ny0zNjJjYmNmZmY0MjciLCJpYXQiOjE3Njk1NjQ4MjN9.Tn9Z0fpvBzpK4JavWtuPUoR3fsw9CLhwa5Ml7yjVEW8"
API_BASE_URL = "https://api.decor8.ai"

# Cloudinary 配置（用于上传图片）
CLOUDINARY_API_KEY = "117752995173679"
CLOUDINARY_API_SECRET = "OGiujqsUNHsYduK3mg96lEg_L4I"
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "dyurkavye")

# 文件路径
SCRIPT_DIR = Path(__file__).parent
# SCRIPT_DIR = vibe-ai-in-home/construction/unit_2_ai_service
# SCRIPT_DIR.parent.parent = vibe-ai-in-home
# SCRIPT_DIR.parent.parent.parent = ai-in-home (项目根目录)
PROJECT_ROOT = SCRIPT_DIR.parent.parent.parent
ROOM_IMAGE_PATH = PROJECT_ROOT / "Image (2).jpeg"
PRODUCTS_YAML_PATH = PROJECT_ROOT / "vibe-ai-in-home" / "product" / "products.yaml"
OUTPUT_DIR = SCRIPT_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)


def image_to_base64_data_url(image_path: Path) -> str:
    """将图片转换为 base64 data URL"""
    with open(image_path, 'rb') as f:
        image_data = f.read()
        base64_data = base64.b64encode(image_data).decode('utf-8')
        # 根据文件扩展名确定 MIME 类型
        ext = image_path.suffix.lower()
        mime_type = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.heic': 'image/heic',
            '.heif': 'image/heif'
        }.get(ext, 'image/jpeg')
        return f"data:{mime_type};base64,{base64_data}"


def upload_to_cloudinary(image_path: Path, image_name: str = "room") -> Optional[str]:
    """上传图片到 Cloudinary 并返回 URL"""
    try:
        timestamp = int(time.time())
        public_id = f"test_decor8ai_{image_name}_{timestamp}"
        
        # 生成签名
        signature_string = f"public_id={public_id}&timestamp={timestamp}{CLOUDINARY_API_SECRET}"
        signature = hashlib.sha1(signature_string.encode('utf-8')).hexdigest()
        
        # 上传文件
        url = f"https://api.cloudinary.com/v1_1/{CLOUDINARY_CLOUD_NAME}/image/upload"
        with open(image_path, 'rb') as f:
            files = {'file': (image_path.name, f, 'image/jpeg')}
            data = {
                'api_key': CLOUDINARY_API_KEY,
                'timestamp': timestamp,
                'signature': signature,
                'public_id': public_id
            }
            response = requests.post(url, files=files, data=data, timeout=30)
            response.raise_for_status()
            result = response.json()
            return result.get('secure_url') or result.get('url')
    except Exception as e:
        print(f"⚠️  Cloudinary 上传失败: {e}")
        return None


def load_products_from_yaml(yaml_path: Path, max_products: int = 2) -> List[Dict[str, Any]]:
    """从 YAML 文件加载产品信息"""
    with open(yaml_path, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)
    
    products = []
    if 'categories' in data:
        for category in data['categories']:
            if 'products' in category:
                for product in category['products']:
                    if 'images' in product and len(product['images']) > 0:
                        products.append({
                            'name': product.get('name', 'Unknown Product'),
                            'image_url': product['images'][0]['url']
                        })
                        if len(products) >= max_products:
                            break
            if len(products) >= max_products:
                break
    
    return products


def test_authentication() -> bool:
    """测试 API 认证"""
    print("=" * 60)
    print("测试 API 认证...")
    print("=" * 60)
    
    url = f"{API_BASE_URL}/speak_friend_and_enter"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        result = response.json()
        print(f"✅ 认证成功: {result.get('message', 'OK')}")
        print()
        return True
    except Exception as e:
        print(f"❌ 认证失败: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"响应内容: {e.response.text}")
        print()
        return False


def generate_design_with_decor8ai(
    room_image_data_url: str,  # 可以是 HTTPS URL 或 base64 data URL
    decor_items: List[Dict[str, str]],
    room_type: str = "livingroom",
    design_style: str = "minimalist",
    num_images: int = 1,
    scale_factor: int = 2
) -> Dict[str, Any]:
    """调用 decor8ai API 生成设计"""
    print("=" * 60)
    print("调用 decor8ai API 生成设计...")
    print("=" * 60)
    
    url = f"{API_BASE_URL}/generate_designs_for_room"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    # 构建请求数据
    request_data = {
        "input_image_url": room_image_data_url,
        "room_type": room_type,
        "design_style": design_style,
        "num_images": num_images,
        "scale_factor": scale_factor,
        "decor_items": json.dumps(decor_items)
    }
    
    print("\n📤 请求数据:")
    # 显示完整的请求数据（但截断过长的 URL）
    display_data = {
        "input_image_url": room_image_data_url[:80] + "..." if len(room_image_data_url) > 80 else room_image_data_url,
        "room_type": room_type,
        "design_style": design_style,
        "num_images": num_images,
        "scale_factor": scale_factor,
        "decor_items": decor_items
    }
    print(json.dumps(display_data, indent=2, ensure_ascii=False))
    print(f"\n完整 input_image_url: {room_image_data_url}")
    print()
    
    try:
        print("⏳ 正在发送请求（这可能需要一些时间）...")
        # 增加超时时间，并添加重试逻辑
        from requests.adapters import HTTPAdapter
        from urllib3.util.retry import Retry
        
        session = requests.Session()
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("https://", adapter)
        
        response = session.post(url, headers=headers, json=request_data, timeout=600)
        response.raise_for_status()
        result = response.json()
        
        print("\n📥 响应数据:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        print()
        
        return result
    except requests.exceptions.RequestException as e:
        print(f"\n❌ 请求失败: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"响应状态码: {e.response.status_code}")
            print(f"响应内容: {e.response.text}")
        raise


def download_image(image_url: str, output_path: Path) -> bool:
    """下载图片到本地"""
    try:
        response = requests.get(image_url, timeout=30)
        response.raise_for_status()
        with open(output_path, 'wb') as f:
            f.write(response.content)
        return True
    except Exception as e:
        print(f"❌ 下载图片失败: {e}")
        return False


def main():
    """主函数"""
    print("\n" + "=" * 60)
    print("Decor8AI 图像生成测试")
    print("=" * 60)
    print()
    
    # 1. 检查文件是否存在
    if not ROOM_IMAGE_PATH.exists():
        print(f"❌ 错误: 房间图片不存在: {ROOM_IMAGE_PATH}")
        return
    
    if not PRODUCTS_YAML_PATH.exists():
        print(f"❌ 错误: 产品配置文件不存在: {PRODUCTS_YAML_PATH}")
        return
    
    # 2. 测试认证
    if not test_authentication():
        print("❌ API 认证失败，退出")
        return
    
    # 3. 加载房间图片（优先使用 Cloudinary，失败则使用 base64）
    print("=" * 60)
    print("加载房间图片...")
    print("=" * 60)
    print(f"图片路径: {ROOM_IMAGE_PATH}")
    
    # 尝试上传到 Cloudinary
    print("尝试上传到 Cloudinary...")
    room_image_url = upload_to_cloudinary(ROOM_IMAGE_PATH, "room")
    
    if room_image_url:
        print(f"✅ 图片已上传到 Cloudinary: {room_image_url}")
        room_image_input = room_image_url
    else:
        print("⚠️  Cloudinary 上传失败，使用 base64 data URL")
        room_image_input = image_to_base64_data_url(ROOM_IMAGE_PATH)
        print(f"✅ 图片已转换为 base64 data URL (长度: {len(room_image_input)} 字符)")
    print()
    
    # 4. 加载产品信息
    print("=" * 60)
    print("加载产品信息...")
    print("=" * 60)
    products = load_products_from_yaml(PRODUCTS_YAML_PATH, max_products=2)
    if not products:
        print("❌ 未找到产品信息")
        return
    
    print(f"✅ 找到 {len(products)} 个产品:")
    for i, product in enumerate(products, 1):
        print(f"  {i}. {product['name']}")
        print(f"     图片 URL: {product['image_url']}")
    print()
    
    # 5. 构建 decor_items
    decor_items = [
        {
            "url": product['image_url'],
            "name": product['name']
        }
        for product in products
    ]
    
    print("=" * 60)
    print("装饰物品信息:")
    print("=" * 60)
    print(json.dumps(decor_items, indent=2, ensure_ascii=False))
    print()
    
    # 6. 调用 API
    try:
        result = generate_design_with_decor8ai(
            room_image_data_url=room_image_input,
            decor_items=decor_items,
            room_type="livingroom",
            design_style="minimalist",
            num_images=1,
            scale_factor=2
        )
        
        # 7. 处理结果
        if result.get('error'):
            print(f"❌ API 返回错误: {result.get('error')}")
            return
        
        if 'info' in result and 'images' in result['info']:
            images = result['info']['images']
            print("=" * 60)
            print(f"✅ 成功生成 {len(images)} 张图片")
            print("=" * 60)
            
            for i, image_info in enumerate(images, 1):
                image_url = image_info.get('url')
                if image_url:
                    print(f"\n图片 {i}:")
                    print(f"  UUID: {image_info.get('uuid')}")
                    print(f"  尺寸: {image_info.get('width')} x {image_info.get('height')}")
                    print(f"  URL: {image_url}")
                    
                    # 下载图片
                    output_filename = f"decor8ai_output_{i}_{image_info.get('uuid', 'unknown')}.jpg"
                    output_path = OUTPUT_DIR / output_filename
                    
                    print(f"  正在下载到: {output_path}")
                    if download_image(image_url, output_path):
                        file_size = output_path.stat().st_size
                        print(f"  ✅ 下载成功 (大小: {file_size / 1024:.2f} KB)")
                        print(f"  绝对路径: {output_path.absolute()}")
        else:
            print("⚠️  响应中未找到图片信息")
            print(f"完整响应: {json.dumps(result, indent=2, ensure_ascii=False)}")
    
    except Exception as e:
        print(f"\n❌ 发生错误: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)


if __name__ == "__main__":
    main()
