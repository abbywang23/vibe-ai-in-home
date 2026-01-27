#!/usr/bin/env python3
"""
批量抓取Castlery所有类目的商品信息
使用浏览器MCP工具进行自动化抓取
"""

import json
import yaml
from pathlib import Path

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

# JavaScript函数用于提取商品列表
EXTRACT_PRODUCTS_JS = """
() => {
  const products = [];
  const links = Array.from(document.querySelectorAll('a[href*="/products/"]'))
    .filter(link => {
      const card = link.closest('article, [class*="product"], [class*="card"], div');
      return card && card.querySelector('img[src*="cloudinary"]');
    })
    .slice(0, 5);
  
  links.forEach((link, i) => {
    const card = link.closest('article, [class*="product"], [class*="card"], div') || link.parentElement.parentElement;
    const img = card.querySelector('img[src*="cloudinary"]');
    const titleEl = card.querySelector('h2, h3, [class*="title"], [class*="name"]') || link;
    const priceEl = card.querySelector('[class*="price"], [class*="Price"]');
    const descEl = card.querySelector('[class*="description"], [class*="feature"], [class*="tag"]');
    const tagEl = card.querySelector('[class*="badge"], [class*="tag"], [class*="label"]');
    
    if (link && img) {
      const url = link.href || link.getAttribute('href');
      const fullUrl = url.startsWith('http') ? url : 'https://www.castlery.com' + url;
      products.push({
        index: i + 1,
        name: titleEl?.textContent?.trim() || 'Unknown',
        url: fullUrl,
        imageUrl: img.src || img.getAttribute('src') || '',
        price: priceEl?.textContent?.trim() || 'N/A',
        description: descEl?.textContent?.trim() || '',
        tag: tagEl?.textContent?.trim() || ''
      });
    }
  });
  return products;
}
"""

# JavaScript函数用于提取商品详情
EXTRACT_PRODUCT_DETAIL_JS = """
() => {
  const p = {};
  p.name = document.querySelector('h1')?.textContent?.trim() || '';
  p.price = document.querySelector('h3')?.textContent?.trim() || '';
  
  const bcLinks = Array.from(document.querySelectorAll('nav[aria-label*="breadcrumb"] a'));
  const bc = bcLinks.map(a => a.textContent?.trim()).filter(Boolean);
  p.category = bc.find(b => ['Sofas','Tables','Chairs','Beds','Storage','Furniture Sets','Outdoor','Accessories'].some(c => b.includes(c))) || '';
  p.collection = bc.length > 1 ? bc[bc.length - 1] : '';
  
  const opts = [];
  const bodyText = document.body.innerText;
  const patterns = ['Model:', 'material:', 'colour:', 'orientation:', 'table:', 'frame cover:', 'variant:', 'length:', 'size:', 'color:', 'finish:', 'leg color:', 'leg:', 'wood:', 'power recliner qty:'];
  
  patterns.forEach(pattern => {
    const regex = new RegExp(pattern + '\\\\s*([^\\\\n]+)', 'i');
    const match = bodyText.match(regex);
    if (match) {
      const type = pattern.replace(':', '').trim();
      const currentVal = match[1].trim().split('\\\\n')[0].trim();
      if (currentVal && currentVal.length < 100) {
        const vals = [currentVal];
        document.querySelectorAll('button[aria-label*="Select"]').forEach(btn => {
          const v = btn.getAttribute('aria-label')?.replace(/^Select\\\\s+/i, '');
          if (v && v.toLowerCase().includes(type.toLowerCase()) && !vals.includes(v)) vals.push(v);
        });
        document.querySelectorAll('radiogroup generic[cursor="pointer"], generic[cursor="pointer"]').forEach(r => {
          const v = r.textContent?.trim();
          if (v && v.length < 80 && !vals.includes(v) && v !== currentVal) vals.push(v);
        });
        if (vals.length > 0) opts.push({ type: type, values: [...new Set(vals)] });
      }
    }
  });
  p.options = opts;
  
  const imgs = Array.from(document.querySelectorAll('img[src*="cloudinary"][src*="crusader/variants"]'))
    .filter(img => !img.src.includes('swatch') && !img.src.includes('icon') && !img.src.includes('UGC') && !img.src.includes('Social') && !img.src.includes('video'))
    .map(img => img.src)
    .filter(Boolean);
  p.images = [...new Set(imgs)].slice(0, 10);
  
  return p;
}
"""

def main():
    """主函数 - 需要配合浏览器MCP工具使用"""
    print("此脚本需要配合浏览器MCP工具使用")
    print("请使用以下步骤:")
    print("1. 访问每个类目页面")
    print("2. 使用EXTRACT_PRODUCTS_JS提取商品列表")
    print("3. 访问每个商品详情页")
    print("4. 使用EXTRACT_PRODUCT_DETAIL_JS提取商品详情")
    print("5. 将所有数据整理到YAML文件")
    
    # 输出JavaScript函数供使用
    print("\n=== 提取商品列表的JavaScript函数 ===")
    print(EXTRACT_PRODUCTS_JS)
    print("\n=== 提取商品详情的JavaScript函数 ===")
    print(EXTRACT_PRODUCT_DETAIL_JS)

if __name__ == '__main__':
    main()
