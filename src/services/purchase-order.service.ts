import apiClient from '@/lib/api-client';
import type {
  PurchaseOrderRequest,
  PurchaseOrderResponse,
  PurchaseOrdersQueryParams,
} from '@/types';

const PURCHASE_ORDERS_BASE = '/api/v1/purchase-orders';

export const purchaseOrderService = {
  /**
   * Get all purchase orders with optional pagination and filtering
   */
  list: async (params?: PurchaseOrdersQueryParams): Promise<PurchaseOrderResponse[]> => {
    const response = await apiClient.get<PurchaseOrderResponse[]>(PURCHASE_ORDERS_BASE, { params });
    return response.data;
  },

  /**
   * Get a single purchase order by ID
   */
  getById: async (id: number): Promise<PurchaseOrderResponse> => {
    const response = await apiClient.get<PurchaseOrderResponse>(`${PURCHASE_ORDERS_BASE}/${id}`);
    return response.data;
  },

  /**
   * Create a new purchase order
   */
  create: async (data: PurchaseOrderRequest): Promise<PurchaseOrderResponse> => {
    const response = await apiClient.post<PurchaseOrderResponse>(PURCHASE_ORDERS_BASE, data);
    return response.data;
  },

  /**
   * Mark a purchase order as received
   */
  receive: async (id: number): Promise<PurchaseOrderResponse> => {
    const response = await apiClient.post<PurchaseOrderResponse>(`${PURCHASE_ORDERS_BASE}/${id}/receive`);
    return response.data;
  },
};

export default purchaseOrderService;
