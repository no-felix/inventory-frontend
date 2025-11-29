import { TrendingUp } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function StockMovementsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stock Movements</h1>
        <p className="text-muted-foreground">
          View stock movement history
        </p>
      </div>

      {/* Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Movements History</CardTitle>
          <CardDescription>
            All stock movements will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Stock movements table will be implemented in Stage 6</p>
              <p className="text-sm">This is a placeholder page</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StockMovementsPage;
