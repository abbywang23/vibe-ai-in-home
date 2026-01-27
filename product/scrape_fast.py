#!/usr/bin/env python3
"""
快速批量抓取Castlery所有类目的商品信息
使用Playwright进行浏览器自动化
"""

import asyncio
import yaml
from playwright.async_api import async_playwright
from pathlib import Path

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

async def extract_products_from_list(page):
    """从商品列表页面提取5个商品的基本信息"""
    try:
        await page.wait_for_selector('a[href*="/products/"]', timeout=20000)
    except:
        pass  # 即使超时也继续尝试提取
    
    products = await page.evaluate("""
        () => {
            const products = [];
            // 先找到所有商品卡片
            const productCards = Array.from(document.querySelectorAll('article, [class*="product"], [class*="card"]'))
                .filter(card => {
                    const link = card.querySelector('a[href*="/products/"]');
                    const img = card.querySelector('img[src*="cloudinary"]');
                    return link && img;
                })
                .slice(0, 5);
            
            productCards.forEach((card, i) => {
                const link = card.querySelector('a[href*="/products/"]');
                const img = card.querySelector('img[src*="cloudinary"]');
                
                // 尝试多种方式获取商品名称
                let name = '';
                const titleEl = card.querySelector('h2, h3, [class*="title"], [class*="name"]');
                if (titleEl) {
                    name = titleEl.textContent?.trim();
                } else {
                    // 尝试从链接中提取
                    const linkText = link.textContent?.trim();
                    if (linkText && linkText.length > 5 && linkText.length < 100 && !linkText.includes('http')) {
                        name = linkText;
                    } else {
                        // 从URL中提取商品名称
                        const url = link.href || link.getAttribute('href');
                        const urlMatch = url.match(/products\\/([^?]+)/);
                        if (urlMatch) {
                            name = urlMatch[1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                        }
                    }
                }
                
                const priceEl = card.querySelector('[class*="price"], [class*="Price"]');
                const descEl = card.querySelector('[class*="description"], [class*="feature"], [class*="tag"]');
                const tagEl = card.querySelector('[class*="badge"], [class*="tag"], [class*="label"]');
                
                if (link && img) {
                    const url = link.href || link.getAttribute('href');
                    const fullUrl = url.startsWith('http') ? url : 'https://www.castlery.com' + url;
                    products.push({
                        index: i + 1,
                        name: name || 'Unknown',
                        url: fullUrl,
                        price: priceEl?.textContent?.trim() || 'N/A',
                        description: descEl?.textContent?.trim() || '',
                        tag: tagEl?.textContent?.trim() || ''
                    });
                }
            });
            
            // 如果没找到足够的商品，尝试直接从链接提取
            if (products.length < 5) {
                const links = Array.from(document.querySelectorAll('a[href*="/products/"]'))
                    .filter(link => {
                        const card = link.closest('article, [class*="product"], [class*="card"], div');
                        return card && card.querySelector('img[src*="cloudinary"]');
                    })
                    .slice(0, 5);
                
                links.forEach((link, i) => {
                    if (i >= products.length) {
                        const url = link.href || link.getAttribute('href');
                        const fullUrl = url.startsWith('http') ? url : 'https://www.castlery.com' + url;
                        const urlMatch = url.match(/products\\/([^?]+)/);
                        let name = 'Unknown';
                        if (urlMatch) {
                            name = urlMatch[1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                        }
                        products.push({
                            index: i + 1,
                            name: name,
                            url: fullUrl,
                            price: 'N/A',
                            description: '',
                            tag: ''
                        });
                    }
                });
            }
            
            return products;
        }
    """)
    return products

async def extract_product_detail(page):
    """从商品详情页提取完整信息"""
    try:
        await page.wait_for_selector('h1', timeout=20000)
    except:
        pass  # 即使超时也继续尝试提取
    
    detail = await page.evaluate("""
        () => {
            const p = {};
            p.name = document.querySelector('h1')?.textContent?.trim() || '';
            p.price = document.querySelector('h3')?.textContent?.trim() || '';
            
            // 提取breadcrumb - 从商品标题上方的breadcrumb区域提取
            let bc = [];
            const productTitle = document.querySelector('h1');
            if (productTitle) {
                let parent = productTitle.parentElement;
                for (let i = 0; i < 5 && parent; i++) {
                    const links = parent.querySelectorAll('a[href*="/sofas/"], a[href*="/tables/"], a[href*="/chairs/"], a[href*="/beds/"], a[href*="/storage/"], a[href*="/furniture-sets/"], a[href*="/outdoor/"], a[href*="/accessories/"]');
                    if (links.length > 0) {
                        links.forEach(link => {
                            const text = link.textContent?.trim();
                            const href = link.getAttribute('href') || link.href || '';
                            if (text && text !== 'Home' && !text.includes('>') && !text.includes('Go to')) {
                                if (!bc.includes(text)) bc.push(text);
                            }
                        });
                        break;
                    }
                    parent = parent.parentElement;
                }
            }
            
            // 如果还是没找到，从URL推断
            if (bc.length === 0) {
                const url = window.location.pathname;
                const categoryMap = {
                    'sofas': 'Sofas',
                    'tables': 'Tables', 
                    'chairs': 'Chairs',
                    'beds': 'Beds',
                    'storage': 'Storage',
                    'furniture-sets': 'Furniture Sets',
                    'outdoor': 'Outdoor',
                    'accessories': 'Accessories'
                };
                for (const [key, value] of Object.entries(categoryMap)) {
                    if (url.includes('/' + key + '/')) {
                        bc.push(value);
                        break;
                    }
                }
            }
            
            // 确定category和collection
            const mainCategories = ['Sofas','Tables','Chairs','Beds','Storage','Furniture Sets','Outdoor','Accessories'];
            p.category = bc.find(b => mainCategories.some(c => b.includes(c))) || '';
            if (bc.length > 1) {
                const categoryIndex = bc.findIndex(b => mainCategories.some(c => b.includes(c)));
                if (categoryIndex >= 0 && categoryIndex < bc.length - 1) {
                    p.collection = bc[bc.length - 1];
                } else if (bc.length > 0) {
                    p.collection = bc[bc.length - 1];
                }
            } else if (bc.length === 1) {
                p.collection = '';
            }
            
            const opts = [];
            const excludeTypes = ['singapore', 'country selector', 'go to', 'pagination', 'stocked', 'view', 'get', 'add-on'];
            
            // 方法1: 从文本中提取（更准确）
            const bodyText = document.body.innerText;
            const patterns = ['Model:', 'material:', 'colour:', 'orientation:', 'table:', 'frame cover:', 'variant:', 'length:', 'size:', 'color:', 'finish:', 'leg color:', 'leg:', 'wood:', 'power recliner qty:', 'bench:', 'chair material:', 'chairs qty:', 'height:', 'width:', 'depth:'];
            
            patterns.forEach(pattern => {
                const regex = new RegExp(pattern + '\\\\s*([^\\\\n]+)', 'i');
                const match = bodyText.match(regex);
                if (match) {
                    const type = pattern.replace(':', '').trim().toLowerCase();
                    // 过滤无关类型
                    if (excludeTypes.some(ex => type.includes(ex))) return;
                    
                    const currentVal = match[1].trim().split('\\\\n')[0].trim();
                    if (currentVal && currentVal.length < 100 && currentVal.length > 0) {
                        const vals = [currentVal];
                        // 查找相关的按钮选项
                        document.querySelectorAll('button[aria-label*="Select"]').forEach(btn => {
                            const v = btn.getAttribute('aria-label')?.replace(/^Select\\\\s+/i, '');
                            if (v && v.toLowerCase().includes(type.toLowerCase()) && !vals.includes(v)) vals.push(v);
                        });
                        // 查找radiogroup选项
                        document.querySelectorAll('radiogroup generic[cursor="pointer"], generic[cursor="pointer"]').forEach(r => {
                            const v = r.textContent?.trim();
                            if (v && v.length < 80 && v.length > 0 && !vals.includes(v) && v !== currentVal) vals.push(v);
                        });
                        if (vals.length > 0) {
                            opts.push({ type: type, values: [...new Set(vals)] });
                        }
                    }
                }
            });
            
            // 方法2: 从DOM结构中提取选项（作为补充，但需要更严格的过滤）
            const optionSections = document.querySelectorAll('[class*="option"], [class*="variant"], [class*="selector"]');
            optionSections.forEach(section => {
                const labelEl = section.querySelector('label, [class*="label"], [aria-label]');
                let label = labelEl?.textContent?.trim() || labelEl?.getAttribute('aria-label') || '';
                label = label.replace(':', '').trim().toLowerCase();
                
                // 严格过滤
                if (!label || excludeTypes.some(ex => label.includes(ex))) return;
                if (label.length < 2 || label.length > 30) return;
                if (opts.find(o => o.type === label)) return;
                
                const values = [];
                const currentEl = section.querySelector('[class*="selected"], [aria-selected="true"]');
                if (currentEl) {
                    const currentVal = currentEl.textContent?.trim() || currentEl.getAttribute('aria-label')?.replace(/^Select\\\\s+/i, '');
                    if (currentVal && currentVal.length < 100) values.push(currentVal);
                }
                
                section.querySelectorAll('button[aria-label*="Select"], button[class*="option"]').forEach(btn => {
                    const v = btn.getAttribute('aria-label')?.replace(/^Select\\\\s+/i, '') || btn.textContent?.trim();
                    if (v && v.length < 100 && !values.includes(v)) values.push(v);
                });
                
                section.querySelectorAll('radiogroup generic[cursor="pointer"], generic[cursor="pointer"]').forEach(r => {
                    const v = r.textContent?.trim();
                    if (v && v.length < 80 && v.length > 0 && !values.includes(v)) values.push(v);
                });
                
                if (label && values.length > 0) {
                    opts.push({ type: label, values: [...new Set(values)] });
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
    """)
    return detail

async def scrape_category(browser, category):
    """抓取单个类目的5个商品"""
    print(f"正在处理类目: {category['name']}")
    page = await browser.new_page()
    
    try:
        # 访问类目页面
        await page.goto(category['url'], wait_until='domcontentloaded', timeout=60000)
        await asyncio.sleep(3)  # 等待页面加载
        
        # 提取商品列表
        products = await extract_products_from_list(page)
        print(f"  找到 {len(products)} 个商品")
        
        # 访问每个商品详情页
        detailed_products = []
        for i, product in enumerate(products, 1):
            print(f"  处理商品 {i}/5: {product['name']}")
            try:
                await page.goto(product['url'], wait_until='domcontentloaded', timeout=60000)
                await asyncio.sleep(2)
                
                detail = await extract_product_detail(page)
                
                # 合并信息
                full_product = {
                    'name': detail.get('name') or product['name'],
                    'url': product['url'],
                    'price': detail.get('price') or product['price'],
                    'original_price': None,
                    'description': product.get('description', ''),
                    'category': detail.get('category') or category['name'],
                    'collection': detail.get('collection', ''),
                    'tag': product.get('tag'),
                    'delivery': 'Leaves warehouse by Feb 3',  # 默认值
                    'options': detail.get('options', []),
                    'images': [{'url': url} for url in detail.get('images', [])]
                }
                detailed_products.append(full_product)
            except Exception as e:
                print(f"    错误: {e}")
                # 即使出错也添加基本信息
                detailed_products.append({
                    'name': product['name'],
                    'url': product['url'],
                    'price': product['price'],
                    'original_price': None,
                    'description': product.get('description', ''),
                    'category': category['name'],
                    'collection': '',
                    'tag': product.get('tag'),
                    'delivery': '',
                    'options': [],
                    'images': []
                })
        
        return detailed_products
    finally:
        await page.close()

async def main():
    """主函数"""
    output_file = Path(__file__).parent / 'products.yaml'
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)  # headless=True 更快
        
        all_categories = []
        
        for category in CATEGORIES:
            try:
                products = await scrape_category(browser, category)
                all_categories.append({
                    'name': category['name'],
                    'url': category['url'],
                    'products': products
                })
            except Exception as e:
                print(f"处理类目 {category['name']} 时出错: {e}")
                all_categories.append({
                    'name': category['name'],
                    'url': category['url'],
                    'products': []
                })
        
        await browser.close()
        
        # 保存到YAML文件
        data = {'categories': all_categories}
        with open(output_file, 'w', encoding='utf-8') as f:
            yaml.dump(data, f, allow_unicode=True, default_flow_style=False, sort_keys=False)
        
        print(f"\n完成! 数据已保存到 {output_file}")
        print(f"共处理 {len(all_categories)} 个类目")

if __name__ == '__main__':
    asyncio.run(main())
