import { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Calendar,
  Download,
  Package,
  Search,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSlowMovingItems } from '@/hooks';

type SortField = 'name' | 'sku' | 'quantityOnHand' | 'lastMovementDate';
type SortDirection = 'asc' | 'desc';

function SortButton({ field, onSort, children }: { field: SortField; onSort: (field: SortField) => void; children: React.ReactNode }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={() => onSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function SlowMovingPage() {
  const [days, setDays] = useState(30);
  const { data: items, isLoading } = useSlowMovingItems({ days });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('lastMovementDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Filter and sort data
  const filteredData = useMemo(() => {
    if (!items) return [];

    const filtered = items.filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        item.name?.toLowerCase().includes(query) ||
        item.sku?.toLowerCase().includes(query)
      );
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | number | Date;
      let bVal: string | number | Date;

      switch (sortField) {
        case 'name':
          aVal = a.name?.toLowerCase() ?? '';
          bVal = b.name?.toLowerCase() ?? '';
          break;
        case 'sku':
          aVal = a.sku?.toLowerCase() ?? '';
          bVal = b.sku?.toLowerCase() ?? '';
          break;
        case 'quantityOnHand':
          aVal = a.quantityOnHand ?? 0;
          bVal = b.quantityOnHand ?? 0;
          break;
        case 'lastMovementDate':
          aVal = a.lastMovementDate ? new Date(a.lastMovementDate).getTime() : 0;
          bVal = b.lastMovementDate ? new Date(b.lastMovementDate).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [items, searchQuery, sortField, sortDirection]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Export to CSV
  const handleExport = () => {
    if (!filteredData.length) return;

    const headers = ['SKU', 'Name', 'Quantity', 'Total Value', 'Last Movement', 'Days Idle'];
    const rows = filteredData.map((item) => [
      item.sku ?? '',
      item.name ?? '',
      item.quantityOnHand ?? 0,
      item.totalValue ?? 0,
      item.lastMovementDate ? format(parseISO(item.lastMovementDate), 'yyyy-MM-dd') : 'Never',
      item.daysSinceLastMovement ?? 'N/A',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `slow-moving-${days}days-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Calculate totals
  const totals = useMemo(() => {
    if (!filteredData.length) return { count: 0, value: 0 };
    return {
      count: filteredData.length,
      value: filteredData.reduce((acc, item) => acc + (item.totalValue ?? 0), 0),
    };
  }, [filteredData]);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Slow Moving Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.count}</div>
            <p className="text-xs text-muted-foreground">No movement in {days} days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Capital Tied Up</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.value)}</div>
            <p className="text-xs text-muted-foreground">Value of slow moving inventory</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Slow Moving Items</CardTitle>
              <CardDescription>
                Products with no stock movement in the selected period
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-8 w-full sm:w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={days.toString()} onValueChange={(v) => setDays(Number(v))}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="60">Last 60 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport} disabled={!filteredData.length}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredData.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <SortButton field="sku" onSort={handleSort}>SKU</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="name" onSort={handleSort}>Name</SortButton>
                    </TableHead>
                    <TableHead className="text-right">
                      <SortButton field="quantityOnHand" onSort={handleSort}>Quantity</SortButton>
                    </TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                    <TableHead>
                      <SortButton field="lastMovementDate" onSort={handleSort}>Last Movement</SortButton>
                    </TableHead>
                    <TableHead className="text-right">Days Idle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item, index) => (
                    <TableRow key={item.sku ?? index}>
                      <TableCell className="font-mono text-sm">
                        {item.sku}
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right font-medium">
                        {item.quantityOnHand?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.totalValue ?? 0)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.lastMovementDate
                          ? format(parseISO(item.lastMovementDate), 'MMM d, yyyy')
                          : 'Never'}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {item.daysSinceLastMovement ?? '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Package className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-4">
                  {searchQuery ? 'No matching items found' : 'No slow moving items'}
                </p>
                {!searchQuery && (
                  <p className="text-sm">All products have had movement in the last {days} days</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SlowMovingPage;
