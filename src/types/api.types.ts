// ============================================================
// API Type Definitions
// Generated from inventory-backend-api.yaml OpenAPI Specification
// ============================================================

// ----------------------------------------------------------
// Constants (Type-safe alternatives to enums)
// ----------------------------------------------------------

export const PurchaseOrderStatus = {
  PENDING: 'PENDING',
  RECEIVED: 'RECEIVED',
  CANCELLED: 'CANCELLED',
} as const;

export type PurchaseOrderStatus = (typeof PurchaseOrderStatus)[keyof typeof PurchaseOrderStatus];

export const StockMovementReason = {
  PO_RECEIPT: 'PO_RECEIPT',
  ADJUSTMENT: 'ADJUSTMENT',
  SALE: 'SALE',
  RETURN: 'RETURN',
  DAMAGE: 'DAMAGE',
  TRANSFER: 'TRANSFER',
} as const;

export type StockMovementReason = (typeof StockMovementReason)[keyof typeof StockMovementReason];

export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// ----------------------------------------------------------
// Authentication Types
// ----------------------------------------------------------

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

// ----------------------------------------------------------
// Product Types
// ----------------------------------------------------------

export interface ProductRequest {
  sku: string;
  name: string;
  description?: string;
  quantityOnHand: number;
  unitPrice: number;
}

export interface ProductResponse {
  id: number;
  sku: string;
  name: string;
  description?: string;
  quantityOnHand: number;
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------
// Purchase Order Types
// ----------------------------------------------------------

export interface PurchaseOrderLineRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrderRequest {
  supplierName: string;
  lines: PurchaseOrderLineRequest[];
  received?: boolean;
}

export interface PurchaseOrderLineResponse {
  id: number;
  productId: number;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface PurchaseOrderResponse {
  id: number;
  supplierName: string;
  status: PurchaseOrderStatus;
  lines: PurchaseOrderLineResponse[];
  totalAmount: number;
  createdAt: string;
  receivedAt?: string;
}

// ----------------------------------------------------------
// Stock Movement Types
// ----------------------------------------------------------

export interface StockMovementResponse {
  id: number;
  productId: number;
  productSku: string;
  productName: string;
  change: number;
  reason: StockMovementReason;
  relatedEntityType?: string;
  relatedEntityId?: number;
  performedBy?: string;
  createdAt: string;
}

// ----------------------------------------------------------
// Metrics Types
// ----------------------------------------------------------

export interface InventorySummaryResponse {
  productCount: number;
  totalItems: number;
  lowStockCount: number;
  totalValue: number;
}

export interface StockLevelResponse {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
}

export interface ReceiptsTimeSeriesResponse {
  date: string;
  totalQuantity: number;
  orderCount: number;
}

export interface LowStockAlertResponse {
  productId: number;
  sku: string;
  name: string;
  currentQuantity: number;
  threshold: number;
  deficit: number;
}

export interface SlowMovingItemResponse {
  productId: number;
  sku: string;
  name: string;
  quantityOnHand: number;
  totalValue: number;
  lastMovementDate: string;
  daysSinceLastMovement: number;
}

export interface ValuationByPriceRangeResponse {
  priceRange: string;
  productCount: number;
  totalQuantity: number;
  totalValue: number;
}

// ----------------------------------------------------------
// Error Types
// ----------------------------------------------------------

export interface ProblemDetail {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
}

// ----------------------------------------------------------
// Pagination & Query Types
// ----------------------------------------------------------

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface ProductsQueryParams extends PaginationParams {
  search?: string;
}

export interface PurchaseOrdersQueryParams extends PaginationParams {
  status?: PurchaseOrderStatus;
}

export interface StockMovementsQueryParams extends PaginationParams {
  productId?: number;
  reason?: StockMovementReason;
  from?: string;
  to?: string;
}

export interface ReceiptsTimeSeriesParams {
  from: string;
  to: string;
}

export interface SlowMovingItemsParams {
  days?: number;
}
