import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { usePurchaseOrders, useReceivePurchaseOrder } from '@/hooks';
import { getPurchaseOrderColumns } from './columns';
import { ReceiveOrderDialog } from './receive-order-dialog';
import type { PurchaseOrderResponse } from '@/api/generated';
import { getErrorMessage } from '@/api/client';

export function PurchaseOrdersPage() {
  const { data: orders, isLoading } = usePurchaseOrders();
  const receiveMutation = useReceivePurchaseOrder();
  
  const [orderToReceive, setOrderToReceive] = useState<PurchaseOrderResponse | null>(null);

  const handleReceiveClick = (order: PurchaseOrderResponse) => {
    setOrderToReceive(order);
  };

  const handleReceiveConfirm = async () => {
    if (!orderToReceive?.id) return;

    try {
      await receiveMutation.mutateAsync(orderToReceive.id);
      toast.success(`Order PO-${String(orderToReceive.id).padStart(5, '0')} received successfully`);
      setOrderToReceive(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const columns = getPurchaseOrderColumns({
    onReceive: handleReceiveClick,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage your purchase orders
          </p>
        </div>
        <Button asChild>
          <Link to="/purchase-orders/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Link>
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={orders ?? []}
        isLoading={isLoading}
        searchKey="supplierName"
        searchPlaceholder="Search by supplier..."
      />

      {/* Receive Confirmation Dialog */}
      <ReceiveOrderDialog
        open={!!orderToReceive}
        onOpenChange={(open) => !open && setOrderToReceive(null)}
        onConfirm={handleReceiveConfirm}
        orderId={orderToReceive?.id}
        isReceiving={receiveMutation.isPending}
      />
    </div>
  );
}

export default PurchaseOrdersPage;
