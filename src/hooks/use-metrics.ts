import { useQuery } from '@tanstack/react-query';
import {
  getInventorySummary,
  getStockLevels,
  getReceiptsTimeSeries,
  getLowStockAlerts,
  getSlowMovingItems,
  getValuationByPriceRange,
} from '@/api/generated';
import type { GetReceiptsTimeSeriesData, GetSlowMovingItemsData } from '@/api/generated';

// Query keys for cache management
export const metricsKeys = {
  all: ['metrics'] as const,
  inventorySummary: () => [...metricsKeys.all, 'inventorySummary'] as const,
  stockLevels: () => [...metricsKeys.all, 'stockLevels'] as const,
  receiptsTimeSeries: (params: GetReceiptsTimeSeriesData['query']) => 
    [...metricsKeys.all, 'receiptsTimeSeries', params] as const,
  lowStockAlerts: () => [...metricsKeys.all, 'lowStockAlerts'] as const,
  slowMovingItems: (params?: GetSlowMovingItemsData['query']) => 
    [...metricsKeys.all, 'slowMovingItems', params] as const,
  valuationByPriceRange: () => [...metricsKeys.all, 'valuationByPriceRange'] as const,
};

/**
 * Hook for fetching inventory summary
 */
export function useInventorySummary() {
  return useQuery({
    queryKey: metricsKeys.inventorySummary(),
    queryFn: async () => {
      const response = await getInventorySummary();
      if (response.error) throw response.error;
      return response.data;
    },
  });
}

/**
 * Hook for fetching stock levels
 */
export function useStockLevels() {
  return useQuery({
    queryKey: metricsKeys.stockLevels(),
    queryFn: async () => {
      const response = await getStockLevels();
      if (response.error) throw response.error;
      return response.data;
    },
  });
}

/**
 * Hook for fetching receipts time series
 */
export function useReceiptsTimeSeries(params: GetReceiptsTimeSeriesData['query']) {
  return useQuery({
    queryKey: metricsKeys.receiptsTimeSeries(params),
    queryFn: async () => {
      const response = await getReceiptsTimeSeries({ query: params });
      if (response.error) throw response.error;
      return response.data;
    },
    enabled: !!(params.from && params.to),
  });
}

/**
 * Hook for fetching low stock alerts
 */
export function useLowStockAlerts() {
  return useQuery({
    queryKey: metricsKeys.lowStockAlerts(),
    queryFn: async () => {
      const response = await getLowStockAlerts();
      if (response.error) throw response.error;
      return response.data;
    },
  });
}

/**
 * Hook for fetching slow moving items
 */
export function useSlowMovingItems(params?: GetSlowMovingItemsData['query']) {
  return useQuery({
    queryKey: metricsKeys.slowMovingItems(params),
    queryFn: async () => {
      const response = await getSlowMovingItems({ query: params });
      if (response.error) throw response.error;
      return response.data;
    },
  });
}

/**
 * Hook for fetching valuation by price range
 */
export function useValuationByPriceRange() {
  return useQuery({
    queryKey: metricsKeys.valuationByPriceRange(),
    queryFn: async () => {
      const response = await getValuationByPriceRange();
      if (response.error) throw response.error;
      return response.data;
    },
  });
}
