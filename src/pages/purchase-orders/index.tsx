import { ShoppingCart, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function PurchaseOrdersPage() {
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

      {/* Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders List</CardTitle>
          <CardDescription>
            Your purchase orders will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
            <div className="text-center">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Purchase orders table will be implemented in Stage 5</p>
              <p className="text-sm">This is a placeholder page</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PurchaseOrdersPage;
