// Auth hooks
export {
  useLogin,
  useRegister,
  useRefreshToken,
} from './use-auth';

// Product hooks
export {
  productKeys,
  useProducts,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from './use-products';

// Purchase order hooks
export {
  purchaseOrderKeys,
  usePurchaseOrders,
  usePurchaseOrder,
  useCreatePurchaseOrder,
  useReceivePurchaseOrder,
} from './use-purchase-orders';

// Stock movement hooks
export {
  stockMovementKeys,
  useStockMovements,
  useProductStockMovements,
} from './use-stock-movements';

// Metrics hooks
export {
  metricsKeys,
  useInventorySummary,
  useStockLevels,
  useReceiptsTimeSeries,
  useLowStockAlerts,
  useSlowMovingItems,
  useValuationByPriceRange,
} from './use-metrics';
