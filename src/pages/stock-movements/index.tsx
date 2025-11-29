import { useState } from 'react';
import { TrendingUp, ArrowDown, ArrowUp } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/data-table';
import { useStockMovements } from '@/hooks';
import type { StockMovementReason } from '@/api/generated';
import { columns } from './columns';

// ----------------------------------------------------------
// Reason Options
// ----------------------------------------------------------

const reasonOptions: { value: StockMovementReason | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Reasons' },
  { value: 'PO_RECEIPT', label: 'PO Receipt' },
  { value: 'ADJUSTMENT', label: 'Adjustment' },
  { value: 'SALE', label: 'Sale' },
  { value: 'RETURN', label: 'Return' },
  { value: 'DAMAGE', label: 'Damage' },
  { value: 'TRANSFER', label: 'Transfer' },
];

// ----------------------------------------------------------
// Stock Movements Page
// ----------------------------------------------------------

export function StockMovementsPage() {
  const [reasonFilter, setReasonFilter] = useState<StockMovementReason | 'ALL'>('ALL');
  
  const { data: movements, isLoading, error } = useStockMovements({
    reason: reasonFilter === 'ALL' ? undefined : reasonFilter,
  });

  // Calculate stats
  const stats = {
    total: movements?.length ?? 0,
    incoming: movements?.filter(m => (m.change ?? 0) > 0).reduce((sum, m) => sum + (m.change ?? 0), 0) ?? 0,
    outgoing: Math.abs(movements?.filter(m => (m.change ?? 0) < 0).reduce((sum, m) => sum + (m.change ?? 0), 0) ?? 0),
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Movements</h1>
          <p className="text-muted-foreground">View stock movement history</p>
        </div>
        <Card>
          <CardContent className="flex h-[400px] items-center justify-center">
            <div className="text-center text-destructive">
              <p>Failed to load stock movements</p>
              <p className="text-sm text-muted-foreground">Please try again later</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Movements</h1>
          <p className="text-muted-foreground">View stock movement history</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Movements</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All recorded movements
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incoming</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{stats.incoming}</div>
            <p className="text-xs text-muted-foreground">
              Units added to stock
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outgoing</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{stats.outgoing}</div>
            <p className="text-xs text-muted-foreground">
              Units removed from stock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={reasonFilter}
          onValueChange={(value) => setReasonFilter(value as StockMovementReason | 'ALL')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by reason" />
          </SelectTrigger>
          <SelectContent>
            {reasonOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Movement History</CardTitle>
          <CardDescription>
            Complete history of all stock movements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={movements ?? []}
            isLoading={isLoading}
            searchKey="productName"
            searchPlaceholder="Search by product name..."
            emptyState={{
              title: 'No stock movements yet',
              description: 'Stock movements will appear here as inventory is received, sold, or adjusted.',
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default StockMovementsPage;
