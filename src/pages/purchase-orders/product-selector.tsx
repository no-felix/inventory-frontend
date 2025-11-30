import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useProducts } from '@/hooks';
import type { ProductResponse } from '@/api/generated';

interface ProductSelectorProps {
  value?: number;
  onChange: (productId: number | undefined, product?: ProductResponse) => void;
  excludeIds?: number[];
  disabled?: boolean;
}

export function ProductSelector({
  value,
  onChange,
  excludeIds = [],
  disabled,
}: ProductSelectorProps) {
  const [open, setOpen] = useState(false);
  const { data: productsData, isLoading } = useProducts({ size: 1000 });
  const products = productsData?.content ?? [];

  const availableProducts = useMemo(() => {
    return products.filter((p) => !excludeIds.includes(p.id ?? 0));
  }, [products, excludeIds]);

  const selectedProduct = useMemo(() => {
    if (!value) return undefined;
    return products.find((p) => p.id === value);
  }, [value, products]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedProduct ? (
            <span className="truncate">
              {selectedProduct.name} ({selectedProduct.sku})
            </span>
          ) : (
            <span className="text-muted-foreground">Select product...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search products..." />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Loading...' : 'No products found.'}
            </CommandEmpty>
            <CommandGroup>
              {availableProducts.map((product) => (
                <CommandItem
                  key={product.id}
                  value={`${product.name} ${product.sku}`}
                  onSelect={() => {
                    onChange(product.id, product);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === product.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.sku} • ${product.unitPrice?.toFixed(2)}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Line item component for the form
interface OrderLineItemProps {
  index: number;
  productId?: number;
  quantity: number;
  unitPrice: number;
  excludeProductIds: number[];
  onProductChange: (productId: number | undefined, product?: ProductResponse) => void;
  onQuantityChange: (quantity: number) => void;
  onUnitPriceChange: (price: number) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function OrderLineItem({
  index,
  productId,
  quantity,
  unitPrice,
  excludeProductIds,
  onProductChange,
  onQuantityChange,
  onUnitPriceChange,
  onRemove,
  canRemove,
}: OrderLineItemProps) {
  const lineTotal = quantity * unitPrice;

  return (
    <div className="grid gap-4 items-start grid-cols-[1fr,100px,120px,100px,40px] p-4 border rounded-lg">
      <div>
        <label className="text-sm font-medium mb-1.5 block">
          Product {index === 0 && '*'}
        </label>
        <ProductSelector
          value={productId}
          onChange={onProductChange}
          excludeIds={excludeProductIds}
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Qty *</label>
        <input
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Unit Price *</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            $
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={unitPrice}
            onChange={(e) => onUnitPriceChange(parseFloat(e.target.value) || 0)}
            className="flex h-10 w-full rounded-md border border-input bg-background pl-7 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Total</label>
        <div className="h-10 flex items-center font-medium">
          ${lineTotal.toFixed(2)}
        </div>
      </div>
      <div className="pt-7">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={!canRemove}
          className="h-10 w-10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
