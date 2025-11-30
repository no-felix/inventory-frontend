// Auth hooks
export {
  useLogin,
  useRegister,
  useRefreshToken,
  useSetupStatus,
  useSetupAdmin,
} from './use-auth';

// Health check hooks
export { useHealthCheck } from './use-health';

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
  useCreateStockMovement,
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


