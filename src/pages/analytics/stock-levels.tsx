import { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Download,
  Package,
  Search,
} from 'lucide-react';

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useStockLevels } from '@/hooks';

type SortField = 'name' | 'sku' | 'quantity' | 'totalValue';
type SortDirection = 'asc' | 'desc';

export function StockLevelsPage() {
  const { data: stockLevels, isLoading } = useStockLevels();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('quantity');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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
    if (!stockLevels) return [];

    let filtered = stockLevels.filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        item.name?.toLowerCase().includes(query) ||
        item.sku?.toLowerCase().includes(query)
      );
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortField) {
        case 'name':
          aVal = a.name?.toLowerCase() ?? '';
          bVal = b.name?.toLowerCase() ?? '';
          break;
        case 'sku':
          aVal = a.sku?.toLowerCase() ?? '';
          bVal = b.sku?.toLowerCase() ?? '';
          break;
        case 'quantity':
          aVal = a.quantity ?? 0;
          bVal = b.quantity ?? 0;
          break;
        case 'totalValue':
          aVal = a.totalValue ?? 0;
          bVal = b.totalValue ?? 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [stockLevels, searchQuery, sortField, sortDirection]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Export to CSV
  const handleExport = () => {
    if (!filteredData.length) return;

    const headers = ['SKU', 'Name', 'Quantity', 'Unit Price', 'Total Value'];
    const rows = filteredData.map((item) => [
      item.sku ?? '',
      item.name ?? '',
      item.quantity ?? 0,
      item.unitPrice ?? 0,
      item.totalValue ?? 0,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stock-levels-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Calculate totals
  const totals = useMemo(() => {
    if (!filteredData.length) return { quantity: 0, value: 0 };
    return filteredData.reduce<{ quantity: number; value: number }>(
      (acc, item) => ({
        quantity: acc.quantity + (item.quantity ?? 0),
        value: acc.value + (item.totalValue ?? 0),
      }),
      { quantity: 0, value: 0 }
    );
  }, [filteredData]);

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Stock Levels</CardTitle>
              <CardDescription>
                Current inventory quantities and values for all products
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={handleExport} disabled={!filteredData.length}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
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
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <SortButton field="sku">SKU</SortButton>
                      </TableHead>
                      <TableHead>
                        <SortButton field="name">Name</SortButton>
                      </TableHead>
                      <TableHead className="text-right">
                        <SortButton field="quantity">Quantity</SortButton>
                      </TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">
                        <SortButton field="totalValue">Total Value</SortButton>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item, index) => (
                      <TableRow key={item.sku ?? index}>
                        <TableCell className="font-mono text-sm">
                          {item.sku}
                        </TableCell>
                        <TableCell>
                          {item.name}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.quantity?.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unitPrice ?? 0)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.totalValue ?? 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex justify-end">
                <div className="rounded-lg border bg-muted/50 px-4 py-3">
                  <div className="flex gap-8 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Items:</span>{' '}
                      <span className="font-medium">{totals.quantity.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Value:</span>{' '}
                      <span className="font-medium">{formatCurrency(totals.value)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Package className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-4">No stock data found</p>
                {searchQuery && (
                  <p className="text-sm">Try adjusting your search</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default StockLevelsPage;
