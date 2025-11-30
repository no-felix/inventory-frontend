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

import { useProducts, useCreateStockMovement } from '@/hooks';
import { getErrorMessage } from '@/api/client';

// ----------------------------------------------------------
// Schema
// ----------------------------------------------------------

const MOVEMENT_REASONS = [
  { value: 'ADJUSTMENT', label: 'Adjustment' },
  { value: 'SALE', label: 'Sale' },
  { value: 'RETURN', label: 'Return' },
  { value: 'DAMAGE', label: 'Damage' },
  { value: 'TRANSFER', label: 'Transfer' },
] as const;

const stockMovementSchema = z.object({
  productId: z.number().min(1, 'Please select a product'),
  direction: z.enum(['increase', 'decrease']),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  reason: z.enum(['ADJUSTMENT', 'SALE', 'RETURN', 'DAMAGE', 'TRANSFER']),
  notes: z.string().optional(),
});

type StockMovementFormData = z.infer<typeof stockMovementSchema>;

// ----------------------------------------------------------
// Props
// ----------------------------------------------------------

interface CreateStockMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProductId?: number;
}

// ----------------------------------------------------------
// Component
// ----------------------------------------------------------

export function CreateStockMovementDialog({
  open,
  onOpenChange,
  defaultProductId,
}: CreateStockMovementDialogProps) {
  // Fetch a reasonable number of products for the selector
  const { data: productsData } = useProducts({ size: 200 });
  const products = productsData?.content ?? [];
  const createMutation = useCreateStockMovement();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<StockMovementFormData>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      productId: defaultProductId ?? 0,
      direction: 'decrease',
      quantity: 1,
      reason: undefined,
      notes: '',
    },
  });

  const onSubmit = async (data: StockMovementFormData) => {
    setIsSubmitting(true);
    try {
      // Calculate actual change based on direction
      const change = data.direction === 'increase' ? data.quantity : -data.quantity;
      
      await createMutation.mutateAsync({
        productId: data.productId,
        change,
        reason: data.reason,
        notes: data.notes || undefined,
      });

      const product = products.find(p => p.id === data.productId);
      toast.success(
        `Stock ${data.direction === 'increase' ? 'increased' : 'decreased'} by ${data.quantity} for ${product?.name ?? 'product'}`
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
        productId: defaultProductId ?? 0,
        direction: 'decrease',
        quantity: 1,
        reason: undefined,
        notes: '',
      });
    }
    onOpenChange(open);
  };

  const selectedProduct = products.find(p => p.id === form.watch('productId'));
  const direction = form.watch('direction');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Stock Movement</DialogTitle>
          <DialogDescription>
            Record a manual stock adjustment, sale, return, damage, or transfer.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Product Selection */}
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString() || ''}
                    disabled={!!defaultProductId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id!.toString()}>
                          {product.sku} - {product.name} (Qty: {product.quantityOnHand})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedProduct && (
                    <FormDescription>
                      Current stock: {selectedProduct.quantityOnHand} units
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  <FormDescription>
                    {direction === 'increase' 
                      ? 'Add stock to inventory (returns, adjustments)' 
                      : 'Remove stock from inventory (sales, damage)'}
                  </FormDescription>
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
                  {selectedProduct && direction === 'decrease' && (
                    <FormDescription className={
                      Number(field.value) > (selectedProduct.quantityOnHand ?? 0)
                        ? 'text-destructive'
                        : ''
                    }>
                      {Number(field.value) > (selectedProduct.quantityOnHand ?? 0)
                        ? `Warning: This exceeds current stock (${selectedProduct.quantityOnHand})`
                        : `New stock will be: ${(selectedProduct.quantityOnHand ?? 0) - Number(field.value)}`}
                    </FormDescription>
                  )}
                  {selectedProduct && direction === 'increase' && (
                    <FormDescription>
                      New stock will be: {(selectedProduct.quantityOnHand ?? 0) + Number(field.value)}
                    </FormDescription>
                  )}
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
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      placeholder="Add any additional notes about this movement..."
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
                {isSubmitting ? 'Creating...' : 'Create Movement'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateStockMovementDialog;
