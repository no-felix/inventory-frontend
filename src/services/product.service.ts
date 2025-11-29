import apiClient from '@/lib/api-client';
import type {
  ProductRequest,
  ProductResponse,
  ProductsQueryParams,
} from '@/types';

const PRODUCTS_BASE = '/api/v1/products';

export const productService = {
  /**
   * Get all products with optional pagination and filtering
   */
  list: async (params?: ProductsQueryParams): Promise<ProductResponse[]> => {
    const response = await apiClient.get<ProductResponse[]>(PRODUCTS_BASE, { params });
    return response.data;
  },

  /**
   * Get a single product by ID
   */
  getById: async (id: number): Promise<ProductResponse> => {
    const response = await apiClient.get<ProductResponse>(`${PRODUCTS_BASE}/${id}`);
    return response.data;
  },

  /**
   * Create a new product
   */
  create: async (data: ProductRequest): Promise<ProductResponse> => {
    const response = await apiClient.post<ProductResponse>(PRODUCTS_BASE, data);
    return response.data;
  },

  /**
   * Update an existing product
   */
  update: async (id: number, data: ProductRequest): Promise<ProductResponse> => {
    const response = await apiClient.put<ProductResponse>(`${PRODUCTS_BASE}/${id}`, data);
    return response.data;
  },

  /**
   * Delete a product
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${PRODUCTS_BASE}/${id}`);
  },
};

export default productService;
