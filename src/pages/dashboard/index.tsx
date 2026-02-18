import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format, subDays, formatDistanceToNow } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInventorySummary, useLowStockAlerts, useReceiptsTimeSeries, usePurchaseOrders } from '@/hooks';
import { useChartColors } from '@/lib/chart-colors';
import type { LowStockAlertResponse, PurchaseOrderResponse } from '@/api/generated';

// ----------------------------------------------------------
// Stat Card Component
// ----------------------------------------------------------

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

function StatCard({ title, value, description, icon, trend, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-20 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {trend && (
              <span
                className={`flex items-center ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(trend.value)}%
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------
// Low Stock Alert Item Component
// ----------------------------------------------------------

interface LowStockItemProps {
  alert: LowStockAlertResponse;
  severityColors: {
    critical: string;
    warning: string;
    good: string;
  };
}

function LowStockItem({ alert, severityColors }: LowStockItemProps) {
  const currentQty = alert.currentQuantity ?? 0;
  const threshold = alert.threshold ?? 1;
  const stockPercentage = (currentQty / threshold) * 100;
  
  // Determine color based on severity - same logic for both text and bar
  const severityColor = stockPercentage <= 25 
    ? severityColors.critical 
    : stockPercentage <= 50 
      ? severityColors.warning 
      : severityColors.good;
  
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{alert.name}</p>
        <p className="text-xs text-muted-foreground">SKU: {alert.sku}</p>
      </div>
      <div className="text-right ml-4">
        <p className="text-sm font-medium" style={{ color: severityColor }}>
          {currentQty} / {threshold}
        </p>
        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ 
              width: `${Math.min(stockPercentage, 100)}%`,
              backgroundColor: severityColor,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------
// Recent Order Item Component
// ----------------------------------------------------------

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  RECEIVED: 'default',
  PENDING: 'secondary',
  CANCELLED: 'destructive',
};

function RecentOrderItem({ order }: { order: PurchaseOrderResponse }) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{order.supplierName}</p>
          <Badge variant={statusVariant[order.status ?? ''] ?? 'outline'} className="text-xs">
            {order.status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {order.createdAt
            ? formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })
            : 'Unknown'}
        </p>
      </div>
      <div className="text-right ml-4">
        <p className="text-sm font-medium">
          {formatCurrency(order.totalAmount ?? 0)}
        </p>
        <p className="text-xs text-muted-foreground">
          {order.lines?.length ?? 0} item{(order.lines?.length ?? 0) !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}

// ----------------------------------------------------------
// Dashboard Page
// ----------------------------------------------------------

export function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useInventorySummary();
  const { data: lowStockAlerts, isLoading: alertsLoading } = useLowStockAlerts();
  const { data: recentOrders, isLoading: ordersLoading } = usePurchaseOrders();
  const { primary: chartColor, severity: severityColors } = useChartColors();
  
  // Get receipts time series for last 30 days
  const dateRange = useMemo(() => {
    const to = new Date();
    const from = subDays(to, 30);
    return {
      from: format(from, 'yyyy-MM-dd'),
      to: format(to, 'yyyy-MM-dd'),
    };
  }, []);
  
  const { data: receiptsData, isLoading: receiptsLoading } = useReceiptsTimeSeries(dateRange);

  // Format chart data
  const chartData = useMemo(() => {
    if (!receiptsData) return [];
    return receiptsData.map((item) => ({
      date: item.date ? format(new Date(item.date), 'MMM d') : '',
      quantity: item.totalQuantity ?? 0,
      orders: item.orderCount ?? 0,
    }));
  }, [receiptsData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your inventory management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value={summary?.productCount ?? 0}
          description="unique products"
          icon={<Package className="h-4 w-4" />}
          isLoading={summaryLoading}
        />
        <StatCard
          title="Total Items"
          value={(summary?.totalItems ?? 0).toLocaleString()}
          description="items in stock"
          icon={<ShoppingCart className="h-4 w-4" />}
          isLoading={summaryLoading}
        />
        <StatCard
          title="Low Stock Alerts"
          value={summary?.lowStockCount ?? 0}
          description="products need attention"
          icon={<AlertTriangle className="h-4 w-4" />}
          isLoading={summaryLoading}
        />
        <StatCard
          title="Total Value"
          value={formatCurrency(summary?.totalValue ?? 0)}
          description="inventory value"
          icon={<DollarSign className="h-4 w-4" />}
          isLoading={summaryLoading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Receipts Overview</CardTitle>
            <CardDescription>
              Incoming stock quantities over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {receiptsLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-md">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: <span className="font-medium text-foreground">{payload[0].value}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Orders: <span className="font-medium text-foreground">{payload[0].payload.orders}</span>
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="quantity"
                    stroke={chartColor}
                    strokeWidth={2}
                    fill="url(#colorQuantity)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No receipt data available</p>
                  <p className="text-sm">Create purchase orders to see data</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Low Stock Items</CardTitle>
              <CardDescription>Products below threshold</CardDescription>
            </div>
            {lowStockAlerts && lowStockAlerts.length > 0 && (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/analytics/low-stock">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {alertsLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : lowStockAlerts && lowStockAlerts.length > 0 ? (
              <ScrollArea className="h-[300px] px-6">
                {lowStockAlerts.slice(0, 10).map((alert) => (
                  <LowStockItem key={alert.productId} alert={alert} severityColors={severityColors} />
                ))}
              </ScrollArea>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No low stock alerts</p>
                  <p className="text-sm">All products are well stocked</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Purchase Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Purchase Orders</CardTitle>
            <CardDescription>Latest orders from suppliers</CardDescription>
          </div>
          {recentOrders && recentOrders.length > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/purchase-orders">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {ordersLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : recentOrders && recentOrders.length > 0 ? (
            <ScrollArea className="max-h-[280px] px-6">
              {recentOrders.slice(0, 5).map((order) => (
                <Link key={order.id} to={`/purchase-orders/${order.id}`} className="block hover:bg-muted/50 rounded-sm transition-colors">
                  <RecentOrderItem order={order} />
                </Link>
              ))}
            </ScrollArea>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No purchase orders yet</p>
                <p className="text-sm">Create your first purchase order</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <Link to="/products">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-base">Products</CardTitle>
                <CardDescription>Manage inventory</CardDescription>
              </div>
            </CardHeader>
          </Link>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <Link to="/purchase-orders/new">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <ShoppingCart className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-base">New Order</CardTitle>
                <CardDescription>Create purchase order</CardDescription>
              </div>
            </CardHeader>
          </Link>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <Link to="/stock-movements">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <ArrowUpRight className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-base">Movements</CardTitle>
                <CardDescription>View stock history</CardDescription>
              </div>
            </CardHeader>
          </Link>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <Link to="/analytics">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-base">Analytics</CardTitle>
                <CardDescription>View reports</CardDescription>
              </div>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;
