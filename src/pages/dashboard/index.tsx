import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

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
// Dashboard Page
// ----------------------------------------------------------

export function DashboardPage() {
  // TODO: Replace with actual API calls using React Query
  const isLoading = false;

  // Placeholder data - will be replaced with real API data
  const stats = {
    productCount: 150,
    totalItems: 5000,
    lowStockCount: 12,
    totalValue: 125000,
  };

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
          value={stats.productCount}
          description="from last month"
          icon={<Package className="h-4 w-4" />}
          trend={{ value: 12, isPositive: true }}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Items"
          value={stats.totalItems.toLocaleString()}
          description="items in stock"
          icon={<ShoppingCart className="h-4 w-4" />}
          trend={{ value: 8, isPositive: true }}
          isLoading={isLoading}
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats.lowStockCount}
          description="products need attention"
          icon={<AlertTriangle className="h-4 w-4" />}
          trend={{ value: 5, isPositive: false }}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Value"
          value={formatCurrency(stats.totalValue)}
          description="inventory value"
          icon={<DollarSign className="h-4 w-4" />}
          trend={{ value: 15, isPositive: true }}
          isLoading={isLoading}
        />
      </div>

      {/* Charts Section - Placeholder */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Receipts Overview</CardTitle>
            <CardDescription>
              Incoming stock quantities over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Chart will be displayed here</p>
                <p className="text-sm">Connect to backend to see real data</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
            <CardDescription>Products below threshold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Low stock alerts will appear here</p>
                <p className="text-sm">Connect to backend to see real data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity - Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest stock movements and orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Recent activity will be displayed here</p>
              <p className="text-sm">Connect to backend to see real data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardPage;
