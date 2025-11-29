import apiClient from '@/lib/api-client';
import type {
  StockMovementResponse,
  StockMovementsQueryParams,
} from '@/types';

const STOCK_MOVEMENTS_BASE = '/api/v1/stock-movements';

export const stockMovementService = {
  /**
   * Get all stock movements with optional filtering
   */
  list: async (params?: StockMovementsQueryParams): Promise<StockMovementResponse[]> => {
    const response = await apiClient.get<StockMovementResponse[]>(STOCK_MOVEMENTS_BASE, { params });
    return response.data;
  },

  /**
   * Get stock movements for a specific product
   */
  getByProduct: async (productId: number): Promise<StockMovementResponse[]> => {
    const response = await apiClient.get<StockMovementResponse[]>(
      `${STOCK_MOVEMENTS_BASE}/product/${productId}`
    );
    return response.data;
  },
};

export default stockMovementService;
