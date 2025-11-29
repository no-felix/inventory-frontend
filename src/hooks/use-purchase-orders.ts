import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  receivePurchaseOrder,
} from '@/api/generated';
import type { PurchaseOrderRequest, ListPurchaseOrdersData } from '@/api/generated';

// Query keys for cache management
export const purchaseOrderKeys = {
  all: ['purchaseOrders'] as const,
  lists: () => [...purchaseOrderKeys.all, 'list'] as const,
  list: (params?: ListPurchaseOrdersData['query']) => [...purchaseOrderKeys.lists(), params] as const,
  details: () => [...purchaseOrderKeys.all, 'detail'] as const,
  detail: (id: number) => [...purchaseOrderKeys.details(), id] as const,
};

/**
 * Hook for fetching all purchase orders
 */
export function usePurchaseOrders(params?: ListPurchaseOrdersData['query']) {
  return useQuery({
    queryKey: purchaseOrderKeys.list(params),
    queryFn: async () => {
      const response = await listPurchaseOrders({ query: params });
      if (response.error) throw response.error;
      return response.data;
    },
  });
}

/**
 * Hook for fetching a single purchase order by ID
 */
export function usePurchaseOrder(id: number) {
  return useQuery({
    queryKey: purchaseOrderKeys.detail(id),
    queryFn: async () => {
      const response = await getPurchaseOrderById({ path: { id } });
      if (response.error) throw response.error;
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook for creating a new purchase order
 */
export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PurchaseOrderRequest) => {
      const response = await createPurchaseOrder({ body: data });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
    },
  });
}

/**
 * Hook for receiving a purchase order
 */
export function useReceivePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await receivePurchaseOrder({ path: { id } });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(id) });
    },
  });
}
