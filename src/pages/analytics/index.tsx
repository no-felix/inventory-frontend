import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  useInventorySummary,
  useStockLevels,
  useLowStockAlerts,
  useSlowMovingItems,
  useValuationByPriceRange,
} from '@/hooks';
import { useChartColors } from '@/lib/chart-colors';

// ----------------------------------------------------------
// Analytics Overview Page
// ----------------------------------------------------------

export function AnalyticsPage() {
  const { data: summary, isLoading: summaryLoading } = useInventorySummary();
  const { data: stockLevels, isLoading: stockLoading } = useStockLevels();
  const { data: lowStockAlerts, isLoading: lowStockLoading } = useLowStockAlerts();
  const { data: slowMoving, isLoading: slowMovingLoading } = useSlowMovingItems({ days: 30 });
  const { data: valuation, isLoading: valuationLoading } = useValuationByPriceRange();
  const { colors: chartColors, primary: primaryColor } = useChartColors();

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Top 10 stock levels for chart (sorted by highest quantity)
  const topStockData = useMemo(() => {
    if (!stockLevels) return [];
    return [...stockLevels]
      .sort((a, b) => (b.quantity ?? 0) - (a.quantity ?? 0))
      .slice(0, 10)
      .map((item) => ({
        name: item.name?.substring(0, 15) || 'Unknown',
        quantity: item.quantity ?? 0,
        value: item.totalValue ?? 0,
      }));
  }, [stockLevels]);

  // Valuation pie chart data
  const valuationData = useMemo(() => {
    if (!valuation) return [];
    return valuation.map((item, index) => ({
      name: item.priceRange || 'Unknown',
      value: item.totalValue ?? 0,
      count: item.productCount ?? 0,
      fill: chartColors[index % chartColors.length],
    }));
  }, [valuation, chartColors]);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{summary?.productCount ?? 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {lowStockLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold text-destructive">
                {lowStockAlerts?.length ?? 0}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slow Moving (30d)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {slowMovingLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{slowMoving?.length ?? 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(summary?.totalValue ?? 0)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Stock Levels Bar Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top 10 Stock Levels</CardTitle>
              <CardDescription>Products with highest quantity</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/analytics/stock-levels">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stockLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : topStockData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topStockData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-md">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: <span className="font-medium text-foreground">{data.quantity}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Value: <span className="font-medium text-foreground">{formatCurrency(data.value)}</span>
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="quantity" fill={primaryColor} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                <p>No stock data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Valuation Pie Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Valuation by Price Range</CardTitle>
              <CardDescription>Inventory value distribution</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/analytics/valuation">
                View details <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {valuationLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : valuationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={valuationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {valuationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-md">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Value: <span className="font-medium text-foreground">{formatCurrency(data.value)}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Products: <span className="font-medium text-foreground">{data.count}</span>
                          </p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                <p>No valuation data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/analytics/stock-levels">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Stock Levels
              </CardTitle>
              <CardDescription>
                View current stock quantities and values for all products
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/analytics/low-stock">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Low Stock Alerts
              </CardTitle>
              <CardDescription>
                {lowStockAlerts?.length ?? 0} products below threshold need attention
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/analytics/slow-moving">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                Slow Moving
              </CardTitle>
              <CardDescription>
                {slowMoving?.length ?? 0} items with no movement in 30 days
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/analytics/valuation">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Valuation Report
              </CardTitle>
              <CardDescription>
                Inventory value breakdown by price ranges
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export default AnalyticsPage;
