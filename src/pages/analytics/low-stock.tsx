import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpDown,
  ExternalLink,
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLowStockAlerts } from '@/hooks';
import { useChartColors } from '@/lib/chart-colors';

type SortField = 'name' | 'sku' | 'currentQuantity' | 'deficit';
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

export function LowStockPage() {
  const { data: alerts, isLoading } = useLowStockAlerts();
  const { severity: severityColors } = useChartColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('deficit');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Filter and sort data
  const filteredData = useMemo(() => {
    if (!alerts) return [];

    const filtered = alerts.filter((item) => {
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
        case 'currentQuantity':
          aVal = a.currentQuantity ?? 0;
          bVal = b.currentQuantity ?? 0;
          break;
        case 'deficit':
          aVal = a.deficit ?? 0;
          bVal = b.deficit ?? 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [alerts, searchQuery, sortField, sortDirection]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get severity badge
  const getSeverityBadge = (current: number, threshold: number) => {
    const percentage = (current / threshold) * 100;
    if (percentage <= 25) {
      return (
        <Badge 
          variant="destructive" 
          style={{ backgroundColor: severityColors.critical }}
        >
          Critical
        </Badge>
      );
    } else if (percentage <= 50) {
      return (
        <Badge 
          variant="destructive" 
          style={{ backgroundColor: severityColors.warning }}
        >
          Low
        </Badge>
      );
    } else {
      return <Badge variant="secondary">Warning</Badge>;
    }
  };

  // Summary stats
  const stats = useMemo(() => {
    if (!filteredData.length) return { critical: 0, low: 0, warning: 0 };
    return filteredData.reduce<{ critical: number; low: number; warning: number }>(
      (acc, item) => {
        const percentage = ((item.currentQuantity ?? 0) / (item.threshold ?? 1)) * 100;
        if (percentage <= 25) acc.critical++;
        else if (percentage <= 50) acc.low++;
        else acc.warning++;
        return acc;
      },
      { critical: 0, low: 0, warning: 0 }
    );
  }, [filteredData]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.critical}</div>
            <p className="text-xs text-muted-foreground">≤25% of threshold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-500">Low</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.low}</div>
            <p className="text-xs text-muted-foreground">25-50% of threshold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Warning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.warning}</div>
            <p className="text-xs text-muted-foreground">&gt;50% of threshold</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Low Stock Alerts</CardTitle>
              <CardDescription>
                Products below their reorder threshold requiring attention
              </CardDescription>
            </div>
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
                    <TableHead>Severity</TableHead>
                    <TableHead>
                      <SortButton field="sku" onSort={handleSort}>SKU</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="name" onSort={handleSort}>Name</SortButton>
                    </TableHead>
                    <TableHead className="text-right">
                      <SortButton field="currentQuantity" onSort={handleSort}>Current</SortButton>
                    </TableHead>
                    <TableHead className="text-right">Threshold</TableHead>
                    <TableHead className="text-right">
                      <SortButton field="deficit" onSort={handleSort}>Deficit</SortButton>
                    </TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item, index) => {
                    return (
                      <TableRow key={item.sku ?? index}>
                        <TableCell>
                          {getSeverityBadge(item.currentQuantity ?? 0, item.threshold ?? 1)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {item.sku}
                        </TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right font-medium">
                          {item.currentQuantity?.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {item.threshold?.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium text-destructive">
                          -{item.deficit?.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to="/purchase-orders/new">
                              <ExternalLink className="h-4 w-4" />
                              <span className="sr-only">Create order</span>
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              <div className="text-center">
                <AlertTriangle className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-4">
                  {searchQuery ? 'No matching alerts found' : 'No low stock alerts'}
                </p>
                {!searchQuery && (
                  <p className="text-sm">All products are above their reorder threshold</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default LowStockPage;
