import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Minus } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { useCreateStockMovement } from '@/hooks';
import { getErrorMessage } from '@/api/client';
import type { ProductResponse } from '@/api/generated';

// ----------------------------------------------------------
// Schema
// ----------------------------------------------------------

const MOVEMENT_REASONS = [
  { value: 'ADJUSTMENT', label: 'Adjustment', description: 'General inventory correction' },
  { value: 'SALE', label: 'Sale', description: 'Sold to customer' },
  { value: 'RETURN', label: 'Return', description: 'Customer return or supplier return' },
  { value: 'DAMAGE', label: 'Damage', description: 'Damaged or defective items' },
  { value: 'TRANSFER', label: 'Transfer', description: 'Moved to/from another location' },
] as const;

const adjustStockSchema = z.object({
  direction: z.enum(['increase', 'decrease']),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  reason: z.enum(['ADJUSTMENT', 'SALE', 'RETURN', 'DAMAGE', 'TRANSFER']),
  notes: z.string().optional(),
});

type AdjustStockFormData = z.infer<typeof adjustStockSchema>;

// ----------------------------------------------------------
// Props
// ----------------------------------------------------------

interface AdjustStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductResponse;
}

// ----------------------------------------------------------
// Component
// ----------------------------------------------------------

export function AdjustStockDialog({
  open,
  onOpenChange,
  product,
}: AdjustStockDialogProps) {
  const createMutation = useCreateStockMovement();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AdjustStockFormData>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: {
      direction: 'decrease',
      quantity: 1,
      reason: 'ADJUSTMENT',
      notes: '',
    },
  });

  const onSubmit = async (data: AdjustStockFormData) => {
    if (!product.id) return;
    
    setIsSubmitting(true);
    try {
      // Calculate actual change based on direction
      const change = data.direction === 'increase' ? data.quantity : -data.quantity;
      
      await createMutation.mutateAsync({
        productId: product.id,
        change,
        reason: data.reason,
        notes: data.notes || undefined,
      });

      toast.success(
        `Stock ${data.direction === 'increase' ? 'increased' : 'decreased'} by ${data.quantity} for ${product.name}`
      );
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset({
        direction: 'decrease',
        quantity: 1,
        reason: 'ADJUSTMENT',
        notes: '',
      });
    }
    onOpenChange(open);
  };

  const direction = form.watch('direction');
  const quantity = form.watch('quantity');
  const currentStock = product.quantityOnHand ?? 0;
  const newStock = direction === 'increase' 
    ? currentStock + Number(quantity) 
    : currentStock - Number(quantity);
  const isInsufficientStock = direction === 'decrease' && Number(quantity) > currentStock;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Adjust the quantity for <span className="font-medium">{product.name}</span> ({product.sku})
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/50 p-4 mb-4">
          <div className="text-sm text-muted-foreground">Current Stock</div>
          <div className="text-2xl font-bold">{currentStock} units</div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Direction Toggle */}
            <FormField
              control={form.control}
              name="direction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Direction</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="single"
                      value={field.value}
                      onValueChange={(value) => {
                        if (value) field.onChange(value);
                      }}
                      className="justify-start"
                    >
                      <ToggleGroupItem value="decrease" aria-label="Decrease stock">
                        <Minus className="h-4 w-4 mr-2" />
                        Decrease
                      </ToggleGroupItem>
                      <ToggleGroupItem value="increase" aria-label="Increase stock">
                        <Plus className="h-4 w-4 mr-2" />
                        Increase
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantity */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Enter quantity"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription className={isInsufficientStock ? 'text-destructive' : ''}>
                    {isInsufficientStock
                      ? `Warning: This exceeds current stock (${currentStock})`
                      : `New stock will be: ${newStock} units`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOVEMENT_REASONS.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          <div className="flex flex-col">
                            <span>{reason.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {MOVEMENT_REASONS.find(r => r.value === field.value)?.description}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adjusting...' : 'Adjust Stock'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AdjustStockDialog;
