import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listStockMovements,
  getStockMovementsByProduct,
  createStockMovement,
} from '@/api/generated';
import type { ListStockMovementsData, StockMovementRequest } from '@/api/generated';
import { productKeys } from './use-products';
import { metricsKeys } from './use-metrics';

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

/**
 * Hook for creating a new stock movement
 */
export function useCreateStockMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StockMovementRequest) => {
      const response = await createStockMovement({ body: data });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate stock movement lists
      queryClient.invalidateQueries({ queryKey: stockMovementKeys.all });
      // Invalidate the specific product's movements
      queryClient.invalidateQueries({ queryKey: stockMovementKeys.byProduct(variables.productId) });
      // Invalidate product data (quantity changed)
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      // Invalidate metrics (inventory summary, stock levels, etc.)
      queryClient.invalidateQueries({ queryKey: metricsKeys.all });
    },
  });
}
