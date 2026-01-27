#!/usr/bin/env python3
"""
测试单个商品的信息提取，验证逻辑正确性
"""

import asyncio
import yaml
from playwright.async_api import async_playwright

async def extract_product_detail(page):
    """从商品详情页提取完整信息"""
    try:
        await page.wait_for_selector('h1', timeout=20000)
    except:
        pass
    
    detail = await page.evaluate("""
        () => {
            const p = {};
            p.name = document.querySelector('h1')?.textContent?.trim() || '';
            p.price = document.querySelector('h3')?.textContent?.trim() || '';
            
            // 提取breadcrumb - 从商品详情页的breadcrumb区域提取
            let bc = [];
            // 查找商品标题上方的breadcrumb区域（通常在generic容器中）
            const productTitle = document.querySelector('h1');
            if (productTitle) {
                // 向上查找breadcrumb容器
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
            // collection是breadcrumb中最后一个，但不是category的那个
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
            // 过滤掉无关的选项类型
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
                // 清理label
                label = label.replace(':', '').trim().toLowerCase();
                
                // 严格过滤
                if (!label || excludeTypes.some(ex => label.includes(ex))) return;
                if (label.length < 2 || label.length > 30) return;
                
                // 检查是否已经存在
                if (opts.find(o => o.type === label)) return;
                
                const values = [];
                // 获取当前选中的值
                const currentEl = section.querySelector('[class*="selected"], [aria-selected="true"]');
                if (currentEl) {
                    const currentVal = currentEl.textContent?.trim() || currentEl.getAttribute('aria-label')?.replace(/^Select\\\\s+/i, '');
                    if (currentVal && currentVal.length < 100) values.push(currentVal);
                }
                
                // 获取所有可选值
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

async def test_single_product():
    """测试单个商品的信息提取"""
    # 测试URL - 使用Tables类目的第一个商品
    test_url = "https://www.castlery.com/sg/products/seb-extendable-dining-set-for-4-6?bench=no_bench&chair_material=wood&chairs_qty=2_chairs"
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        try:
            print(f"正在访问: {test_url}")
            await page.goto(test_url, wait_until='domcontentloaded', timeout=60000)
            await asyncio.sleep(3)
            
            print("正在提取商品信息...")
            detail = await extract_product_detail(page)
            
            print("\n=== 提取到的商品信息 ===")
            print(f"名称: {detail.get('name')}")
            print(f"价格: {detail.get('price')}")
            print(f"类目: {detail.get('category')}")
            print(f"系列: {detail.get('collection')}")
            print(f"\n选项数量: {len(detail.get('options', []))}")
            for opt in detail.get('options', []):
                print(f"  - {opt.get('type')}: {opt.get('values', [])}")
            print(f"\n图片数量: {len(detail.get('images', []))}")
            if detail.get('images'):
                print(f"  第一张图片: {detail.get('images')[0]}")
            
            print("\n=== 完整JSON数据 ===")
            import json
            print(json.dumps(detail, indent=2, ensure_ascii=False))
            
        finally:
            await browser.close()

if __name__ == '__main__':
    asyncio.run(test_single_product())
