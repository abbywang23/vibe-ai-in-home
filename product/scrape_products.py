#!/usr/bin/env python3
"""
脚本说明：通过浏览器MCP访问Castlery网站，抓取每个类目的5个商品信息
"""

# 主要类目列表
CATEGORIES = [
    {"name": "Sofas", "url": "https://www.castlery.com/sg/sofas/all-sofas"},
    {"name": "Tables", "url": "https://www.castlery.com/sg/tables/all-tables"},
    {"name": "Chairs", "url": "https://www.castlery.com/sg/chairs/all-chairs"},
    {"name": "Beds", "url": "https://www.castlery.com/sg/beds/all-bedroom"},
    {"name": "Storage", "url": "https://www.castlery.com/sg/storage/all-storage"},
    {"name": "Furniture Sets", "url": "https://www.castlery.com/sg/furniture-sets/all-furniture-sets"},
    {"name": "Outdoor", "url": "https://www.castlery.com/sg/outdoor/all-outdoor"},
    {"name": "Accessories", "url": "https://www.castlery.com/sg/accessories/all-accessories"},
]

# 这个脚本需要配合浏览器MCP工具使用
# 实际的数据抓取将通过浏览器MCP工具完成
