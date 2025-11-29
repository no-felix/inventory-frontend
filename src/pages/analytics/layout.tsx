import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BarChart3, Package, AlertTriangle, Clock, DollarSign } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// ----------------------------------------------------------
// Navigation Items
// ----------------------------------------------------------

const analyticsNavItems = [
  {
    title: 'Overview',
    url: '/analytics',
    icon: BarChart3,
    description: 'Summary of all metrics',
  },
  {
    title: 'Stock Levels',
    url: '/analytics/stock-levels',
    icon: Package,
    description: 'Current stock by product',
  },
  {
    title: 'Low Stock',
    url: '/analytics/low-stock',
    icon: AlertTriangle,
    description: 'Products below threshold',
  },
  {
    title: 'Slow Moving',
    url: '/analytics/slow-moving',
    icon: Clock,
    description: 'Items with no recent movement',
  },
  {
    title: 'Valuation',
    url: '/analytics/valuation',
    icon: DollarSign,
    description: 'Inventory value by price range',
  },
];

// ----------------------------------------------------------
// Analytics Layout Component
// ----------------------------------------------------------

export function AnalyticsLayout() {
  const location = useLocation();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          View inventory analytics and reports
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {analyticsNavItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <Button
              key={item.url}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              asChild
              className={cn('gap-2', !isActive && 'text-muted-foreground')}
            >
              <NavLink to={item.url}>
                <item.icon className="h-4 w-4" />
                {item.title}
              </NavLink>
            </Button>
          );
        })}
      </div>

      <Separator />

      {/* Content */}
      <Outlet />
    </div>
  );
}

export default AnalyticsLayout;
