import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useCreatePurchaseOrder } from '@/hooks';
import { OrderLineItem } from './product-selector';
import { getErrorMessage } from '@/api/client';
import type { ProductResponse } from '@/api/generated';

interface OrderLine {
  id: string;
  productId?: number;
  quantity: number;
  unitPrice: number;
}

const generateLineId = () => Math.random().toString(36).substring(2, 9);

export function CreatePurchaseOrderPage() {
  const navigate = useNavigate();
  const createOrderMutation = useCreatePurchaseOrder();

  const [supplierName, setSupplierName] = useState('');
  const [receiveImmediately, setReceiveImmediately] = useState(false);
  const [lines, setLines] = useState<OrderLine[]>([
    { id: generateLineId(), productId: undefined, quantity: 1, unitPrice: 0 },
  ]);

  const excludeProductIds = useMemo(() => {
    return lines
      .filter((line) => line.productId !== undefined)
      .map((line) => line.productId as number);
  }, [lines]);

  const orderTotal = useMemo(() => {
    return lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  }, [lines]);

  const isValid = useMemo(() => {
    if (!supplierName.trim()) return false;
    if (lines.length === 0) return false;
    return lines.every(
      (line) =>
        line.productId !== undefined &&
        line.quantity > 0 &&
        line.unitPrice >= 0
    );
  }, [supplierName, lines]);

  const handleProductChange = (
    lineId: string,
    productId: number | undefined,
    product?: ProductResponse
  ) => {
    setLines((prev) =>
      prev.map((line) =>
        line.id === lineId
          ? {
              ...line,
              productId,
              unitPrice: product?.unitPrice ?? line.unitPrice,
            }
          : line
      )
    );
  };

  const handleQuantityChange = (lineId: string, quantity: number) => {
    setLines((prev) =>
      prev.map((line) =>
        line.id === lineId ? { ...line, quantity: Math.max(1, quantity) } : line
      )
    );
  };

  const handleUnitPriceChange = (lineId: string, unitPrice: number) => {
    setLines((prev) =>
      prev.map((line) =>
        line.id === lineId ? { ...line, unitPrice: Math.max(0, unitPrice) } : line
      )
    );
  };

  const handleAddLine = () => {
    setLines((prev) => [
      ...prev,
      { id: generateLineId(), productId: undefined, quantity: 1, unitPrice: 0 },
    ]);
  };

  const handleRemoveLine = (lineId: string) => {
    setLines((prev) => prev.filter((line) => line.id !== lineId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      const order = await createOrderMutation.mutateAsync({
        supplierName: supplierName.trim(),
        received: receiveImmediately,
        lines: lines.map((line) => ({
          productId: line.productId!,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
      });
      toast.success(
        receiveImmediately
          ? 'Purchase order created and received!'
          : 'Purchase order created successfully'
      );
      navigate(`/purchase-orders/${order?.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/purchase-orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create Purchase Order
          </h1>
          <p className="text-muted-foreground">
            Order products from your supplier
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Supplier Info */}
            <Card>
              <CardHeader>
                <CardTitle>Supplier Information</CardTitle>
                <CardDescription>
                  Enter the supplier details for this order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="supplierName">Supplier Name *</Label>
                  <Input
                    id="supplierName"
                    placeholder="Enter supplier name"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>
                  Add products to your purchase order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {lines.map((line, index) => (
                  <OrderLineItem
                    key={line.id}
                    index={index}
                    productId={line.productId}
                    quantity={line.quantity}
                    unitPrice={line.unitPrice}
                    excludeProductIds={excludeProductIds.filter(
                      (id) => id !== line.productId
                    )}
                    onProductChange={(productId, product) =>
                      handleProductChange(line.id, productId, product)
                    }
                    onQuantityChange={(qty) =>
                      handleQuantityChange(line.id, qty)
                    }
                    onUnitPriceChange={(price) =>
                      handleUnitPriceChange(line.id, price)
                    }
                    onRemove={() => handleRemoveLine(line.id)}
                    canRemove={lines.length > 1}
                  />
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleAddLine}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Line Item
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items</span>
                  <span>{lines.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Quantity</span>
                  <span>
                    {lines.reduce((sum, line) => sum + line.quantity, 0)}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>${orderTotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Options */}
            <Card>
              <CardHeader>
                <CardTitle>Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="receiveImmediately"
                    checked={receiveImmediately}
                    onCheckedChange={(checked) =>
                      setReceiveImmediately(checked === true)
                    }
                  />
                  <Label
                    htmlFor="receiveImmediately"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Receive immediately
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {receiveImmediately
                    ? 'Stock will be added when order is created'
                    : 'Order will be created in PENDING status'}
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isValid || createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending
                    ? 'Creating...'
                    : receiveImmediately
                      ? 'Create & Receive Order'
                      : 'Create Order'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreatePurchaseOrderPage;
