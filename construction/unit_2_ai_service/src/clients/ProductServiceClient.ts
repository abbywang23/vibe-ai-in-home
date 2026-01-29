import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import {
  Product,
  ProductData,
  ProductsConfig,
  YamlProductsConfig,
  YamlProduct,
  FurnitureDimensions,
  ProductSearchParams,
} from '../models/types';

/**
 * Product Service Client - Loads products from local YAML configuration
 */
export class ProductServiceClient {
  private products: Map<string, Product>;
  private productsArray: Product[];
  private roomTypeCategories: Map<string, Array<{ id: string; name: string; priority: number }>>;
  private collections: Array<{ id: string; name: string }>;

  constructor() {
    this.products = new Map();
    this.productsArray = [];
    this.roomTypeCategories = new Map();
    this.collections = [];
    this.loadProducts();
  }

  /**
   * Load product data from local YAML file
   */
  private loadProducts(): void {
    try {
      const configPath = process.env.PRODUCTS_CONFIG_PATH || '../../product/products.yaml';
      
      // Resolve path relative to the current working directory, not __dirname
      const resolvedPath = path.isAbsolute(configPath) 
        ? configPath 
        : path.resolve(process.cwd(), configPath);
      
      console.log(`Loading products from: ${resolvedPath}`);
      
      if (!fs.existsSync(resolvedPath)) {
        console.warn(`Products file not found at ${resolvedPath}, using empty catalog`);
        return;
      }

      const fileContents = fs.readFileSync(resolvedPath, 'utf8');
      const config = yaml.load(fileContents) as YamlProductsConfig | ProductsConfig;

      // Load room type categories and collections if available
      if ('room_type_categories' in config && config.room_type_categories) {
        Object.entries(config.room_type_categories).forEach(([roomType, categories]) => {
          this.roomTypeCategories.set(roomType, categories);
        });
        console.log(`Loaded room type categories for ${this.roomTypeCategories.size} room types`);
      }

      if ('collections' in config && config.collections) {
        this.collections = config.collections;
        console.log(`Loaded ${this.collections.length} collections`);
      }

      // Check if it's the new format (categories) or old format (products)
      if ('categories' in config && config.categories) {
        this.loadNewFormat(config as YamlProductsConfig);
      } else if ('products' in config && config.products) {
        this.loadLegacyFormat(config as ProductsConfig);
      } else {
        console.warn('No products found in configuration');
        return;
      }

      console.log(`Loaded ${this.products.size} products successfully`);
    } catch (error) {
      console.error('Failed to load products configuration:', error);
      throw new Error('Failed to initialize product catalog');
    }
  }

  /**
   * Load products from new YAML format (categories-based)
   */
  private loadNewFormat(config: YamlProductsConfig): void {
    let productIndex = 1;

    config.categories.forEach((category) => {
      category.products.forEach((yamlProduct) => {
        const product: Product = {
          id: `product-${productIndex++}`,
          name: yamlProduct.name,
          description: yamlProduct.description || '',
          detailedDescription: yamlProduct.description || '',
          price: this.parsePrice(yamlProduct.price),
          originalPrice: yamlProduct.original_price
            ? this.parsePrice(yamlProduct.original_price)
            : undefined,
          currency: 'SGD',
          images: (yamlProduct.images && Array.isArray(yamlProduct.images) && yamlProduct.images.length > 0)
            ? yamlProduct.images.map((img, index) => ({
                url: img.url,
                alt: `${yamlProduct.name} - Image ${index + 1}`,
              }))
            : [], // Empty array if no images
          category: this.normalizeCategoryName(yamlProduct.category),
          tags: yamlProduct.collection ? [yamlProduct.collection] : [],
          dimensions: this.extractDimensionsFromOptions(yamlProduct.options, yamlProduct.name),
          inStock: true,
          delivery: yamlProduct.delivery,
          externalUrl: yamlProduct.url,
        };

        this.products.set(product.id, product);
        this.productsArray.push(product);
      });
    });
  }

  /**
   * Load products from legacy YAML format
   */
  private loadLegacyFormat(config: ProductsConfig): void {
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
  }

  /**
   * Extract dimensions from product options
   */
  private extractDimensionsFromOptions(options: any[], productName: string): FurnitureDimensions {
    let width = 0, depth = 0, height = 0;

    // Look for dimension information in options
    options.forEach((option) => {
      if (option.type === 'width' && option.values.length > 0) {
        width = this.parseDimension(option.values[0]);
      }
      if (option.type === 'depth' && option.values.length > 0) {
        depth = this.parseDimension(option.values[0]);
      }
      if (option.type === 'height' && option.values.length > 0) {
        height = this.parseDimension(option.values[0]);
      }
      
      // Handle combined dimensions like "W150/200 x D90 x H75cm"
      if (option.type === 'table' && option.values.length > 0) {
        const dimensions = this.parseTableDimensions(option.values[0]);
        if (dimensions) {
          return dimensions;
        }
      }
    });

    // If we found dimensions in options, use them
    if (width > 0 && depth > 0 && height > 0) {
      return { width: width / 100, depth: depth / 100, height: height / 100, unit: 'meters' };
    }

    // Otherwise, infer from product name
    return this.inferDimensions(productName);
  }

  /**
   * Parse table dimensions string like "W150/200 x D90 x H75cm"
   */
  private parseTableDimensions(dimensionStr: string): FurnitureDimensions | null {
    const match = dimensionStr.match(/W(\d+)(?:\/\d+)?\s*x\s*D(\d+)\s*x\s*H(\d+)cm/i);
    if (match) {
      return {
        width: parseInt(match[1]) / 100, // Convert cm to meters
        depth: parseInt(match[2]) / 100,
        height: parseInt(match[3]) / 100,
        unit: 'meters'
      };
    }
    return null;
  }

  /**
   * Parse dimension from string like "269cm" or "52cm (floor to arm)"
   */
  private parseDimension(dimensionStr: string): number {
    const match = dimensionStr.match(/(\d+)cm/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Normalize category name to match our internal categories
   */
  private normalizeCategoryName(categoryName: string): string {
    const lowerCategory = categoryName.toLowerCase();
    if (lowerCategory.includes('sofa')) return 'sofa';
    if (lowerCategory.includes('chair')) return 'chair';
    if (lowerCategory.includes('table')) return 'table';
    if (lowerCategory.includes('bed')) return 'bed';
    if (lowerCategory.includes('desk')) return 'table'; // Desks are tables
    if (lowerCategory.includes('storage')) return 'storage';
    return 'furniture';
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

    // Filter by product IDs (if specified)
    if (params.productIds && params.productIds.length > 0) {
      results = results.filter((p) => params.productIds!.includes(p.id));
    }

    // Filter by query
    if (params.query) {
      const lowerQuery = params.query.toLowerCase();
      results = results.filter((p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
      );
    }

    // Filter by category (case-insensitive and normalize)
    if (params.categories && params.categories.length > 0) {
      const normalizedCategories = params.categories.map(cat => 
        cat.toLowerCase().trim()
      );
      results = results.filter((p) => {
        const productCategory = p.category.toLowerCase().trim();
        return normalizedCategories.some(cat => 
          productCategory === cat || 
          productCategory.includes(cat) || 
          cat.includes(productCategory)
        );
      });
    }

    // Filter by tags (collections) - case-insensitive and normalize spaces/underscores
    if (params.collections && params.collections.length > 0) {
      const normalizedCollections = params.collections.map(col => 
        col.toLowerCase().replace(/_/g, ' ').trim()
      );
      results = results.filter((p) =>
        p.tags.some((tag) => {
          const normalizedTag = tag.toLowerCase().replace(/_/g, ' ').trim();
          return normalizedCollections.some(col => 
            normalizedTag === col || 
            normalizedTag.includes(col) || 
            col.includes(normalizedTag)
          );
        })
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
      desk: 'Desks',
    };
    return nameMap[categoryId] || categoryId;
  }

  /**
   * Get categories by room type
   */
  async getCategoriesByRoomType(roomType: string): Promise<Array<{ id: string; name: string; priority: number }>> {
    const categories = this.roomTypeCategories.get(roomType);
    if (categories) {
      return categories;
    }
    // Fallback to default if room type not found
    return [];
  }

  /**
   * Get all collections
   */
  async getCollections(): Promise<Array<{ id: string; name: string }>> {
    return [...this.collections];
  }

  /**
   * Get next product in category (for Swap Item feature)
   * Returns the next product in the same category, cycling back to the first if at the end
   * Excludes products in the excludeProductIds list
   */
  async getNextProductInCategory(
    category: string, 
    productName: string, 
    excludeProductIds?: string[]
  ): Promise<Product | null> {
    // Normalize category name
    const normalizedCategory = this.normalizeCategoryName(category).toLowerCase().trim();
    
    // Filter products by category (maintain original order from productsArray)
    const categoryProducts = this.productsArray.filter(p => 
      p.category.toLowerCase().trim() === normalizedCategory
    );
    
    if (categoryProducts.length === 0) {
      return null;
    }
    
    // Filter out excluded products
    const excludeIds = excludeProductIds || [];
    const availableProducts = categoryProducts.filter(p => 
      !excludeIds.includes(p.id)
    );
    
    if (availableProducts.length === 0) {
      // All products are excluded, return null
      return null;
    }
    
    // Find the current product by name (case-insensitive) in the full category list
    const currentIndex = categoryProducts.findIndex(p => 
      p.name.toLowerCase().trim() === productName.toLowerCase().trim()
    );
    
    if (currentIndex === -1) {
      // Product not found in category, return null
      return null;
    }
    
    // Find the next available product starting from the next position
    // Start searching from the next product after currentIndex
    let searchIndex = currentIndex + 1;
    let cycles = 0;
    const maxCycles = categoryProducts.length; // Prevent infinite loop
    
    while (cycles < maxCycles) {
      // Wrap around if we've reached the end
      if (searchIndex >= categoryProducts.length) {
        searchIndex = 0;
      }
      
      const candidateProduct = categoryProducts[searchIndex];
      
      // Check if this product is not in the exclude list
      if (!excludeIds.includes(candidateProduct.id)) {
        return candidateProduct;
      }
      
      searchIndex++;
      cycles++;
    }
    
    // Should not reach here, but return null as fallback
    return null;
  }
}
