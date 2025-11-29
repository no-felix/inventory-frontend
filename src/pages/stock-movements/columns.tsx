import type { ColumnDef } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, Package, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

import type { StockMovementResponse, StockMovementReason } from '@/api/generated';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';

// ----------------------------------------------------------
// Reason Badge Component
// ----------------------------------------------------------

const reasonConfig: Record<StockMovementReason, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PO_RECEIPT: { label: 'PO Receipt', variant: 'default' },
  ADJUSTMENT: { label: 'Adjustment', variant: 'secondary' },
  SALE: { label: 'Sale', variant: 'outline' },
  RETURN: { label: 'Return', variant: 'secondary' },
  DAMAGE: { label: 'Damage', variant: 'destructive' },
  TRANSFER: { label: 'Transfer', variant: 'outline' },
};

function ReasonBadge({ reason }: { reason?: StockMovementReason }) {
  if (!reason) return <span className="text-muted-foreground">—</span>;
  
  const config = reasonConfig[reason] || { label: reason, variant: 'outline' as const };
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}

// ----------------------------------------------------------
// Change Display Component
// ----------------------------------------------------------

function ChangeDisplay({ change }: { change?: number }) {
  if (change === undefined || change === null) {
    return <span className="text-muted-foreground">—</span>;
  }
  
  const isPositive = change > 0;
  const Icon = isPositive ? ArrowUp : ArrowDown;
  
  return (
    <div className={`flex items-center gap-1 font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
      <Icon className="h-4 w-4" />
      <span>{isPositive ? `+${change}` : change}</span>
    </div>
  );
}

// ----------------------------------------------------------
// Column Definitions
// ----------------------------------------------------------

export const columns: ColumnDef<StockMovementResponse>[] = [
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string | undefined;
      if (!date) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {format(new Date(date), 'MMM d, yyyy')}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(date), 'h:mm a')}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'productName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) => {
      const productId = row.original.productId;
      const productName = row.getValue('productName') as string | undefined;
      const productSku = row.original.productSku;
      
      return (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            {productId ? (
              <Link 
                to={`/products/${productId}`}
                className="font-medium hover:underline"
              >
                {productName || 'Unknown Product'}
              </Link>
            ) : (
              <span className="font-medium">{productName || 'Unknown Product'}</span>
            )}
            {productSku && (
              <span className="text-xs text-muted-foreground">{productSku}</span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'change',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Change" />
    ),
    cell: ({ row }) => <ChangeDisplay change={row.getValue('change')} />,
  },
  {
    accessorKey: 'reason',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reason" />
    ),
    cell: ({ row }) => <ReasonBadge reason={row.getValue('reason')} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'performedBy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Performed By" />
    ),
    cell: ({ row }) => {
      const performedBy = row.getValue('performedBy') as string | undefined;
      return performedBy || <span className="text-muted-foreground">System</span>;
    },
  },
  {
    accessorKey: 'relatedEntityType',
    header: 'Reference',
    cell: ({ row }) => {
      const entityType = row.original.relatedEntityType;
      const entityId = row.original.relatedEntityId;
      
      if (!entityType || !entityId) {
        return <span className="text-muted-foreground">—</span>;
      }
      
      // Link to purchase order if applicable
      if (entityType === 'PURCHASE_ORDER') {
        return (
          <Button variant="ghost" size="sm" className="h-8 gap-1" asChild>
            <Link to={`/purchase-orders/${entityId}`}>
              <span>PO #{entityId}</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        );
      }
      
      return (
        <span className="text-muted-foreground">
          {entityType} #{entityId}
        </span>
      );
    },
  },
];
