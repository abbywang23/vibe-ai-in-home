import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import {
  Product,
  ProductData,
  ProductsConfig,
  FurnitureDimensions,
  ProductSearchParams,
} from '../models/types';

/**
 * Product Service Client - Loads products from local YAML configuration
 */
export class ProductServiceClient {
  private products: Map<string, Product>;
  private productsArray: Product[];

  constructor() {
    this.products = new Map();
    this.productsArray = [];
    this.loadProducts();
  }

  /**
   * Load product data from local YAML file
   */
  private loadProducts(): void {
    try {
      const configPath = process.env.PRODUCTS_CONFIG_PATH || '../../product/products.yaml';
      const resolvedPath = path.resolve(__dirname, configPath);
      
      console.log(`Loading products from: ${resolvedPath}`);
      
      if (!fs.existsSync(resolvedPath)) {
        console.warn(`Products file not found at ${resolvedPath}, using empty catalog`);
        return;
      }

      const fileContents = fs.readFileSync(resolvedPath, 'utf8');
      const config = yaml.load(fileContents) as ProductsConfig;

      if (!config || !config.products) {
        console.warn('No products found in configuration');
        return;
      }

      // Convert to internal Product format
      config.products.forEach((productData) => {
        const product: Product = {
          id: `product-${productData.index}`,
          name: productData.name,
          description: productData.description,
          detailedDescription: productData.detailed_description,
          price: this.parsePrice(productData.price),
          originalPrice: productData.original_price
            ? this.parsePrice(productData.original_price)
            : undefined,
          currency: 'SGD',
          images: productData.images.map((img) => ({
            url: `/products/${img.local}`,
            alt: img.alt,
          })),
          category: this.inferCategory(productData.name),
          tags: productData.tag ? [productData.tag] : [],
          dimensions: this.inferDimensions(productData.name),
          inStock: true,
          delivery: productData.delivery,
          externalUrl: productData.url,
        };

        this.products.set(product.id, product);
        this.productsArray.push(product);
      });

      console.log(`Loaded ${this.products.size} products successfully`);
    } catch (error) {
      console.error('Failed to load products configuration:', error);
      throw new Error('Failed to initialize product catalog');
    }
  }

  /**
   * Parse price string (e.g., "$1,999") to number
   */
  private parsePrice(priceStr: string): number {
    return parseFloat(priceStr.replace(/[$,]/g, ''));
  }

  /**
   * Infer category from product name
   */
  private inferCategory(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('sofa') || lowerName.includes('sectional')) {
      return 'sofa';
    }
    if (lowerName.includes('chair') || lowerName.includes('armchair')) {
      return 'chair';
    }
    if (lowerName.includes('table') || lowerName.includes('desk')) {
      return 'table';
    }
    if (lowerName.includes('bed')) {
      return 'bed';
    }
    if (lowerName.includes('storage') || lowerName.includes('cabinet')) {
      return 'storage';
    }
    return 'furniture';
  }

  /**
   * Infer dimensions from product name (simplified)
   */
  private inferDimensions(name: string): FurnitureDimensions {
    const lowerName = name.toLowerCase();
    
    // Sectional sofas
    if (lowerName.includes('sectional')) {
      return { width: 2.5, depth: 1.8, height: 0.85, unit: 'meters' };
    }
    
    // 3-seater sofas
    if (lowerName.includes('3 seater') || lowerName.includes('3-seater')) {
      return { width: 2.0, depth: 0.9, height: 0.85, unit: 'meters' };
    }
    
    // 2-seater sofas
    if (lowerName.includes('2 seater') || lowerName.includes('2-seater')) {
      return { width: 1.6, depth: 0.9, height: 0.85, unit: 'meters' };
    }
    
    // Armchairs
    if (lowerName.includes('armchair') || lowerName.includes('chair')) {
      return { width: 0.8, depth: 0.8, height: 0.85, unit: 'meters' };
    }
    
    // Tables
    if (lowerName.includes('table') || lowerName.includes('desk')) {
      return { width: 1.2, depth: 0.6, height: 0.75, unit: 'meters' };
    }
    
    // Default
    return { width: 1.5, depth: 0.8, height: 0.85, unit: 'meters' };
  }

  /**
   * Search products
   */
  async searchProducts(params: ProductSearchParams): Promise<Product[]> {
    let results = [...this.productsArray];

    // Filter by query
    if (params.query) {
      const lowerQuery = params.query.toLowerCase();
      results = results.filter((p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
      );
    }

    // Filter by category
    if (params.categories && params.categories.length > 0) {
      results = results.filter((p) => params.categories!.includes(p.category));
    }

    // Filter by tags (collections)
    if (params.collections && params.collections.length > 0) {
      results = results.filter((p) =>
        p.tags.some((tag) => params.collections!.includes(tag))
      );
    }

    // Filter by price
    if (params.maxPrice) {
      results = results.filter((p) => p.price <= params.maxPrice!);
    }

    // Apply limit
    const limit = params.limit || 10;
    return results.slice(0, limit);
  }

  /**
   * Get products by IDs
   */
  async getProductsByIds(ids: string[]): Promise<Product[]> {
    return ids
      .map((id) => this.products.get(id))
      .filter((p): p is Product => p !== undefined);
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    return this.products.get(id) || null;
  }

  /**
   * Get all products
   */
  async getAllProducts(): Promise<Product[]> {
    return [...this.productsArray];
  }

  /**
   * Get categories with product counts
   */
  async getCategories(): Promise<Array<{ id: string; name: string; productCount: number }>> {
    const categoryMap = new Map<string, number>();
    
    this.productsArray.forEach((product) => {
      const count = categoryMap.get(product.category) || 0;
      categoryMap.set(product.category, count + 1);
    });

    return Array.from(categoryMap.entries()).map(([id, count]) => ({
      id,
      name: this.formatCategoryName(id),
      productCount: count,
    }));
  }

  /**
   * Format category name
   */
  private formatCategoryName(categoryId: string): string {
    const nameMap: Record<string, string> = {
      sofa: 'Sofas',
      chair: 'Chairs',
      table: 'Tables',
      bed: 'Beds',
      storage: 'Storage',
      furniture: 'Furniture',
    };
    return nameMap[categoryId] || categoryId;
  }
}
