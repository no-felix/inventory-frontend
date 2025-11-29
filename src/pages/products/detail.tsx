import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Package, Calendar, DollarSign, Hash, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useProduct, useDeleteProduct, useProductStockMovements } from '@/hooks';
import { DeleteProductDialog } from './delete-product-dialog';
import { AdjustStockDialog } from './adjust-stock-dialog';
import { getErrorMessage } from '@/api/client';
import { DataTable, DataTableColumnHeader } from '@/components/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { StockMovementResponse } from '@/api/generated';

// Stock Movement columns for the detail page
const stockMovementColumns: ColumnDef<StockMovementResponse>[] = [
  {
    accessorKey: 'reason',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reason" />
    ),
    cell: ({ row }) => {
      const reason = row.getValue('reason') as string;
      return (
        <Badge variant="outline">
          {reason?.replace(/_/g, ' ') || 'N/A'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'change',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Change" />
    ),
    cell: ({ row }) => {
      const change = row.getValue('change') as number;
      const isPositive = change > 0;
      return (
        <span className={isPositive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
          {isPositive ? '+' : ''}{change}
        </span>
      );
    },
  },
  {
    accessorKey: 'relatedEntityType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Source" />
    ),
    cell: ({ row }) => {
      const type = row.getValue('relatedEntityType') as string;
      return (
        <span className="text-sm">{type?.replace(/_/g, ' ') || '-'}</span>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string;
      if (!date) return '-';
      return (
        <span className="text-sm text-muted-foreground">
          {new Date(date).toLocaleString()}
        </span>
      );
    },
  },
];

function ProductDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);

  const { data: product, isLoading, error } = useProduct(productId);
  const { data: stockMovements, isLoading: movementsLoading } = useProductStockMovements(productId);
  const deleteProductMutation = useDeleteProduct();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAdjustStockDialog, setShowAdjustStockDialog] = useState(false);

  const handleDelete = async () => {
    if (!product?.id) return;

    try {
      await deleteProductMutation.mutateAsync(product.id);
      toast.success(`Product "${product.name}" deleted successfully`);
      navigate('/products');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Product not found</h2>
        <p className="text-muted-foreground mb-4">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const isLowStock = (product.quantityOnHand ?? 0) <= 10;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
              {isLowStock && <Badge variant="destructive">Low Stock</Badge>}
            </div>
            <p className="text-muted-foreground font-mono">{product.sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowAdjustStockDialog(true)}>
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Adjust Stock
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/products/${product.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Basic product details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">SKU</p>
                <p className="font-mono font-medium">{product.sku}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{product.name}</p>
              </div>
            </div>
            {product.description && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{product.description}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock & Pricing</CardTitle>
            <CardDescription>Inventory and financial details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Quantity on Hand</p>
                <p className={`text-2xl font-bold ${isLowStock ? 'text-destructive' : ''}`}>
                  {product.quantityOnHand ?? 0}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Unit Price</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(product.unitPrice ?? 0)}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-lg font-semibold">
                  {formatCurrency((product.quantityOnHand ?? 0) * (product.unitPrice ?? 0))}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm">
                  {product.createdAt ? new Date(product.createdAt).toLocaleString() : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Movements */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Movement History</CardTitle>
          <CardDescription>Recent stock changes for this product</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={stockMovementColumns}
            data={stockMovements ?? []}
            isLoading={movementsLoading}
          />
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <DeleteProductDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        productName={product.name}
        isDeleting={deleteProductMutation.isPending}
      />

      {/* Adjust Stock Dialog */}
      <AdjustStockDialog
        open={showAdjustStockDialog}
        onOpenChange={setShowAdjustStockDialog}
        product={product}
      />
    </div>
  );
}

export default ProductDetailPage;
