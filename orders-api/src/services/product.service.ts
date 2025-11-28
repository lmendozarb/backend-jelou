import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { createLogger } from '../../libs/common/src/utils/logger';

const logger = createLogger('ProductService');

export class ProductService {
  constructor(private readonly repo = new ProductRepository()) {}

  async createProduct(dto: CreateProductDto) {
    logger.info({ dto }, 'Creating new product');
    
    try {
      const product = await this.repo.create(dto);
      logger.info({ productId: product.id, sku: product.sku }, 'Product created successfully');
      return product;
    } catch (error) {
      logger.error({ error, dto }, 'Failed to create product');
      throw error;
    }
  }

  async getProduct(id: number) {
    logger.debug({ productId: id }, 'Fetching product by ID');
    
    try {
      const product = await this.repo.findById(id);
      if (!product) {
        logger.warn({ productId: id }, 'Product not found');
      }
      return product;
    } catch (error) {
      logger.error({ error, productId: id }, 'Failed to fetch product');
      throw error;
    }
  }

  async searchProducts(search = '', cursor?: number, limit?: number) {
    logger.debug({ search, cursor, limit }, 'Searching products');
    
    try {
      const result = await this.repo.search(search, cursor, limit);
      logger.info('Products search completed');
      return result;
    } catch (error) {
      logger.error({ error, search }, 'Failed to search products');
      throw error;
    }
  }

  async updateProduct(id: number, dto: UpdateProductDto) {
    logger.info({ productId: id, dto }, 'Updating product');
    
    try {
      const product = await this.repo.update(id, dto);
      logger.info({ productId: id }, 'Product updated successfully');
      return product;
    } catch (error) {
      logger.error({ error, productId: id, dto }, 'Failed to update product');
      throw error;
    }
  }
}
