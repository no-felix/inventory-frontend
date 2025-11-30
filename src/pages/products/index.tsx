import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { DataTable, type PaginationState } from '@/components/data-table';
import { useProducts, useDeleteProduct } from '@/hooks';
import { getProductColumns } from './columns';
import { DeleteProductDialog } from './delete-product-dialog';
import type { ProductResponse } from '@/api/generated';
import { getErrorMessage } from '@/api/client';

export function ProductsPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  
  const { data: productsData, isLoading } = useProducts({
    page: pagination.pageIndex,
    size: pagination.pageSize,
  });
  const products = productsData?.content ?? [];
  const deleteProductMutation = useDeleteProduct();
  
  const [productToDelete, setProductToDelete] = useState<ProductResponse | null>(null);

  const handleDeleteClick = (product: ProductResponse) => {
    setProductToDelete(product);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete?.id) return;

    try {
      await deleteProductMutation.mutateAsync(productToDelete.id);
      toast.success(`Product "${productToDelete.name}" deleted successfully`);
      setProductToDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const columns = getProductColumns({
    onDelete: handleDeleteClick,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your inventory products
          </p>
        </div>
        <Button asChild>
          <Link to="/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        emptyState={{
          title: 'No products yet',
          description: 'Get started by adding your first product to the inventory.',
          action: {
            label: 'Add Product',
            href: '/products/new',
          },
        }}
        serverPagination={{
          pageCount: productsData?.totalPages ?? 0,
          totalElements: productsData?.totalElements ?? 0,
          pagination,
          onPaginationChange: setPagination,
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteProductDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
        onConfirm={handleDeleteConfirm}
        productName={productToDelete?.name}
        isDeleting={deleteProductMutation.isPending}
      />
    </div>
  );
}

export default ProductsPage;
