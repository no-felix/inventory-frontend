import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Eye, PackageCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { PurchaseOrderResponse } from '@/api/generated';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';

interface PurchaseOrderColumnsProps {
  onReceive: (order: PurchaseOrderResponse) => void;
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'outline',
  RECEIVED: 'default',
  CANCELLED: 'destructive',
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

export const getPurchaseOrderColumns = ({
  onReceive,
}: PurchaseOrderColumnsProps): ColumnDef<PurchaseOrderResponse>[] => [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order #" />
    ),
    cell: ({ row }) => (
      <Link
        to={`/purchase-orders/${row.original.id}`}
        className="font-medium hover:underline"
      >
        PO-{String(row.getValue('id')).padStart(5, '0')}
      </Link>
    ),
  },
  {
    accessorKey: 'supplierName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Supplier" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('supplierName')}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge variant={statusVariants[status] || 'secondary'}>
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'lines',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Items" />
    ),
    cell: ({ row }) => {
      const lines = row.original.lines ?? [];
      return (
        <span className="text-muted-foreground">
          {lines.length} item{lines.length !== 1 ? 's' : ''}
        </span>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => {
      const total = row.getValue('totalAmount') as number;
      return <span className="font-medium">{formatCurrency(total)}</span>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string;
      if (!date) return <span className="text-muted-foreground">-</span>;
      return (
        <span className="text-sm text-muted-foreground">
          {new Date(date).toLocaleDateString()}
        </span>
      );
    },
  },
  {
    accessorKey: 'receivedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Received" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('receivedAt') as string;
      if (!date) return <span className="text-muted-foreground">-</span>;
      return (
        <span className="text-sm text-muted-foreground">
          {new Date(date).toLocaleDateString()}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const order = row.original;
      const isPending = order.status === 'PENDING';

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to={`/purchase-orders/${order.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            {isPending && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onReceive(order)}>
                  <PackageCheck className="mr-2 h-4 w-4" />
                  Receive Order
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
