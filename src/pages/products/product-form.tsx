import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { ProductResponse } from '@/api/generated';

// Form validation schema
const productFormSchema = z.object({
  sku: z
    .string()
    .min(1, 'SKU is required')
    .max(50, 'SKU must be less than 50 characters')
    .regex(/^[A-Za-z0-9-_]+$/, 'SKU can only contain letters, numbers, hyphens, and underscores'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  quantityOnHand: z
    .number({ message: 'Quantity must be a number' })
    .int('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative'),
  unitPrice: z
    .number({ message: 'Unit price must be a number' })
    .min(0, 'Unit price must be positive')
    .max(1000000, 'Unit price is too high'),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: ProductResponse;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function ProductForm({ product, onSubmit, isSubmitting }: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      sku: product?.sku ?? '',
      name: product?.name ?? '',
      description: product?.description ?? '',
      quantityOnHand: product?.quantityOnHand ?? 0,
      unitPrice: product?.unitPrice ?? 0,
    },
  });

  const handleSubmit = async (data: ProductFormValues) => {
    await onSubmit(data);
  };

  const isEditing = !!product;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., PROD-001"
                  {...field}
                  disabled={isEditing}
                  className={isEditing ? 'bg-muted' : ''}
                />
              </FormControl>
              <FormDescription>
                {isEditing
                  ? 'SKU cannot be changed after creation'
                  : 'Unique identifier for this product'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input placeholder="Product name" {...field} />
              </FormControl>
              <FormDescription>The display name of the product</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Optional product description..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Brief description of the product (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="quantityOnHand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Initial Quantity *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>Starting stock quantity</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unitPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Price *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="pl-7"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </FormControl>
                <FormDescription>Price per unit in USD</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isEditing
                ? 'Saving...'
                : 'Creating...'
              : isEditing
                ? 'Save Changes'
                : 'Create Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
