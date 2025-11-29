import apiClient from '@/lib/api-client';
import type {
  InventorySummaryResponse,
  StockLevelResponse,
  ReceiptsTimeSeriesResponse,
  ReceiptsTimeSeriesParams,
  LowStockAlertResponse,
  SlowMovingItemResponse,
  SlowMovingItemsParams,
  ValuationByPriceRangeResponse,
} from '@/types';

const METRICS_BASE = '/api/v1/metrics';

export const metricsService = {
  /**
   * Get inventory summary (total products, items, low stock count, total value)
   */
  getInventorySummary: async (): Promise<InventorySummaryResponse> => {
    const response = await apiClient.get<InventorySummaryResponse>(`${METRICS_BASE}/inventory-summary`);
    return response.data;
  },

  /**
   * Get current stock levels for all products
   */
  getStockLevels: async (): Promise<StockLevelResponse[]> => {
    const response = await apiClient.get<StockLevelResponse[]>(`${METRICS_BASE}/stock-levels`);
    return response.data;
  },

  /**
   * Get receipts time series for chart visualization
   */
  getReceiptsTimeSeries: async (params: ReceiptsTimeSeriesParams): Promise<ReceiptsTimeSeriesResponse[]> => {
    const response = await apiClient.get<ReceiptsTimeSeriesResponse[]>(`${METRICS_BASE}/receipts`, { params });
    return response.data;
  },

  /**
   * Get products that are below low stock threshold
   */
  getLowStockAlerts: async (): Promise<LowStockAlertResponse[]> => {
    const response = await apiClient.get<LowStockAlertResponse[]>(`${METRICS_BASE}/low-stock-alerts`);
    return response.data;
  },

  /**
   * Get products with no stock movement in specified days
   */
  getSlowMovingItems: async (params?: SlowMovingItemsParams): Promise<SlowMovingItemResponse[]> => {
    const response = await apiClient.get<SlowMovingItemResponse[]>(`${METRICS_BASE}/slow-moving-items`, { params });
    return response.data;
  },

  /**
   * Get inventory valuation broken down by price ranges
   */
  getValuationByPriceRange: async (): Promise<ValuationByPriceRangeResponse[]> => {
    const response = await apiClient.get<ValuationByPriceRangeResponse[]>(`${METRICS_BASE}/valuation-by-price-range`);
    return response.data;
  },
};

export default metricsService;
