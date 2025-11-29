import { useQuery } from '@tanstack/react-query';
import {
  listStockMovements,
  getStockMovementsByProduct,
} from '@/api/generated';
import type { ListStockMovementsData } from '@/api/generated';

// Query keys for cache management
export const stockMovementKeys = {
  all: ['stockMovements'] as const,
  lists: () => [...stockMovementKeys.all, 'list'] as const,
  list: (params?: ListStockMovementsData['query']) => [...stockMovementKeys.lists(), params] as const,
  byProduct: (productId: number) => [...stockMovementKeys.all, 'product', productId] as const,
};

/**
 * Hook for fetching all stock movements
 */
export function useStockMovements(params?: ListStockMovementsData['query']) {
  return useQuery({
    queryKey: stockMovementKeys.list(params),
    queryFn: async () => {
      const response = await listStockMovements({ query: params });
      if (response.error) throw response.error;
      return response.data;
    },
  });
}

/**
 * Hook for fetching stock movements for a specific product
 */
export function useProductStockMovements(productId: number) {
  return useQuery({
    queryKey: stockMovementKeys.byProduct(productId),
    queryFn: async () => {
      const response = await getStockMovementsByProduct({ path: { productId } });
      if (response.error) throw response.error;
      return response.data;
    },
    enabled: !!productId,
  });
}
