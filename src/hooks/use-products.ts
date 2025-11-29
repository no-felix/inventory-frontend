import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/api/generated';
import type { ProductRequest, ListProductsData } from '@/api/generated';

// Query keys for cache management
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: ListProductsData['query']) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
};

/**
 * Hook for fetching all products
 */
export function useProducts(params?: ListProductsData['query']) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: async () => {
      const response = await listProducts({ query: params });
      if (response.error) throw response.error;
      return response.data;
    },
  });
}

/**
 * Hook for fetching a single product by ID
 */
export function useProduct(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const response = await getProductById({ path: { id } });
      if (response.error) throw response.error;
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook for creating a new product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProductRequest) => {
      const response = await createProduct({ body: data });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

/**
 * Hook for updating a product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductRequest }) => {
      const response = await updateProduct({ path: { id }, body: data });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
    },
  });
}

/**
 * Hook for deleting a product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteProduct({ path: { id } });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
