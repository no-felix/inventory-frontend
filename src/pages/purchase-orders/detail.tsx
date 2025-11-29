import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  PackageCheck,
  ShoppingCart,
  Calendar,
  Building2,
  DollarSign,
} from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { usePurchaseOrder, useReceivePurchaseOrder } from '@/hooks';
import { ReceiveOrderDialog } from './receive-order-dialog';
import { getErrorMessage } from '@/api/client';

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

function PurchaseOrderDetailSkeleton() {
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

export function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);

  const { data: order, isLoading, error } = usePurchaseOrder(orderId);
  const receiveMutation = useReceivePurchaseOrder();

  const [showReceiveDialog, setShowReceiveDialog] = useState(false);

  const handleReceive = async () => {
    if (!order?.id) return;

    try {
      await receiveMutation.mutateAsync(order.id);
      toast.success(`Order PO-${String(order.id).padStart(5, '0')} received successfully`);
      setShowReceiveDialog(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return <PurchaseOrderDetailSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Order not found</h2>
        <p className="text-muted-foreground mb-4">
          The purchase order you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/purchase-orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </div>
    );
  }

  const isPending = order.status === 'PENDING';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/purchase-orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                PO-{String(order.id).padStart(5, '0')}
              </h1>
              <Badge variant={statusVariants[order.status ?? ''] || 'secondary'}>
                {order.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{order.supplierName}</p>
          </div>
        </div>
        {isPending && (
          <Button onClick={() => setShowReceiveDialog(true)}>
            <PackageCheck className="mr-2 h-4 w-4" />
            Receive Order
          </Button>
        )}
      </div>

      {/* Order Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
            <CardDescription>Basic order details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Supplier</p>
                <p className="font-medium">{order.supplierName}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Items</p>
                <p className="font-medium">
                  {order.lines?.length ?? 0} line item{(order.lines?.length ?? 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(order.totalAmount ?? 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>Order dates and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : '-'}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <PackageCheck className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Received</p>
                <p className="font-medium">
                  {order.receivedAt
                    ? new Date(order.receivedAt).toLocaleString()
                    : 'Not yet received'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
          <CardDescription>Products included in this order</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Line Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.lines?.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <Link
                      to={`/products/${line.productId}`}
                      className="font-medium hover:underline"
                    >
                      {line.productName}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {line.productSku}
                  </TableCell>
                  <TableCell className="text-right">{line.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(line.unitPrice ?? 0)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(line.lineTotal ?? 0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="text-right font-medium">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(order.totalAmount ?? 0)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* Receive Dialog */}
      <ReceiveOrderDialog
        open={showReceiveDialog}
        onOpenChange={setShowReceiveDialog}
        onConfirm={handleReceive}
        orderId={order.id}
        isReceiving={receiveMutation.isPending}
      />
    </div>
  );
}

export default PurchaseOrderDetailPage;
