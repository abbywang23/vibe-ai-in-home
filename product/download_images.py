#!/usr/bin/env python3
import os
import subprocess
from pathlib import Path

# 定义每个商品的图片URL列表
products_images = {
    1: [
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1624965959/crusader/variants/54000008-TL4002/Owen-Left-Chaise-Sectional-Sofa-Pearl_Beige-Front.jpg",
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1624965957/crusader/variants/54000008-TL4002/Owen-Left-Chaise-Sectional-Sofa-Pearl-Beige-D1.jpg",
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1624965963/crusader/variants/54000008-TL4002/Owen-Left-Chaise-Sectional-Sofa-Pearl_Beige-Angle.jpg",
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1624965964/crusader/variants/54000008-TL4002/Owen-Left-Chaise-Sectional-Sofa-Pearl_Beige-Side.jpg",
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1624965964/crusader/variants/54000008-TL4002/Owen-Left-Chaise-Sectional-Sofa-Pearl_Beige-Back.jpg"
    ],
    2: [
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1655431871/crusader/variants/50440780-MC4002/Hamilton-Round-Chaise-Sectional-Sofa-Left-Brilliant-White-Front-1655431869.jpg",
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1655448965/crusader/variants/50440780-MC4002/Hamilton-Left-Round-Chaise-Sectional-Sofa-in-Brilliant-White-Square-Set_1-1655448963.jpg",
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1655437905/crusader/variants/50440780-MC4002/Hamilton-Round-Chaise-Sectional-Sofa-Left-Brilliant-White-Angle-1655437903.jpg",
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1655448965/crusader/variants/50440780-MC4002/Hamilton-Left-Round-Chaise-Sectional-Sofa-in-Brilliant-White-Square-Det_10-1655448962.jpg",
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1655448965/crusader/variants/50440780-MC4002/Hamilton-Round-Chaise-Sectional-Sofa-in-Brilliant-White-Square-Det_1-1655448963.jpg"
    ],
    3: [
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1683792727/crusader/variants/T50441131-CB4001/Auburn-Performance-Boucle-3-Seater-Sofa-Chalk-Front-1683792724.jpg",
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1683794517/crusader/variants/T50441131-CB4001/Auburn-Performance-Boucle-3-Seater-Sofa-Chalk-Square-Set_1-1683794515.jpg",
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1683792727/crusader/variants/T50441131-CB4001/Auburn-Performance-Boucle-3-Seater-Sofa-Chalk-Angle-1683792724.jpg",
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1683792726/crusader/variants/T50441131-CB4001/Auburn-Performance-Boucle-3-Seater-Sofa-Chalk-Side-1683792724.jpg",
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1683792727/crusader/variants/T50441131-CB4001/Auburn-Performance-Boucle-3-Seater-Sofa-Chalk-Back-1683792724.jpg"
    ],
    4: [
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1631157536/crusader/variants/50440750-LE4016/Madison-3-Seater-Sofa-Caramel-Front.jpg",
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1631157809/crusader/variants/50440750-LE4016/Madison-3-Seater-Sofa-Caramel-Angle.jpg",
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1631157921/crusader/variants/50440750-LE4016/Madison-3-Seater-Sofa-Caramel-Side.jpg",
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1631157930/crusader/variants/50440750-LE4016/Madison-3-Seater-Sofa-Caramel-Back.jpg",
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1631157610/crusader/variants/50440750-LE4016/Madison-3-Seater-Sofa-Caramel-Square-Set_4.jpg"
    ],
    5: [
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1710753518/crusader/variants/50440764-LE4021/Hamilton-Leather-Sofa-Ivory-Front-1710753515.jpg",
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1710753518/crusader/variants/50440764-LE4021/Hamilton-Leather-Sofa-Ivory-Angle-1710753515.jpg",
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1710753517/crusader/variants/50440764-LE4021/Hamilton-Leather-Sofa-Ivory-Side-1710753515.jpg",
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1710729394/crusader/variants/50440780-LE4021/Hamilton-Leather-Sofa-Ivory-Det_1-1710729392.jpg",
        "https://res.cloudinary.com/castlery/image/private/w_1995,f_auto,q_auto,b_rgb:F3F3F3,c_fit/v1710729394/crusader/variants/50440780-LE4021/Hamilton-Leather-Sofa-Ivory-Det_2-1710729392.jpg"
    ]
}

def download_image(url, filepath):
    """使用curl下载图片"""
    try:
        result = subprocess.run(['curl', '-s', '-o', str(filepath), url], 
                              capture_output=True, text=True, timeout=30)
        if result.returncode == 0 and filepath.exists() and filepath.stat().st_size > 0:
            return True
        return False
    except Exception as e:
        print(f"下载失败 {url}: {e}")
        return False

# 下载所有图片
base_dir = Path(__file__).parent
downloaded_files = {}

for product_id, urls in products_images.items():
    if not urls:
        continue
    product_files = []
    for idx, url in enumerate(urls, 1):
        filename = f"product{product_id}_img{idx}.jpg"
        filepath = base_dir / filename
        if download_image(url, filepath):
            product_files.append(filename)
            print(f"✓ 下载: {filename}")
    downloaded_files[product_id] = product_files

print(f"\n下载完成! 共下载 {sum(len(files) for files in downloaded_files.values())} 张图片")
