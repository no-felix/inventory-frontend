import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
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
import { useProduct, useUpdateProduct } from '@/hooks';
import { ProductForm, type ProductFormValues } from './product-form';
import { getErrorMessage } from '@/api/client';

function EditProductSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);

  const { data: product, isLoading, error } = useProduct(productId);
  const updateProductMutation = useUpdateProduct();

  const handleSubmit = async (data: ProductFormValues) => {
    if (!product?.id) return;

    try {
      await updateProductMutation.mutateAsync({
        id: product.id,
        data: {
          sku: data.sku,
          name: data.name,
          description: data.description,
          quantityOnHand: data.quantityOnHand,
          unitPrice: data.unitPrice,
        },
      });
      toast.success(`Product "${data.name}" updated successfully`);
      navigate(`/products/${product.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return <EditProductSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Product not found</h2>
        <p className="text-muted-foreground mb-4">
          The product you're trying to edit doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/products/${product.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">
            Modify {product.name} ({product.sku})
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Update the product information below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm
            product={product}
            onSubmit={handleSubmit}
            isSubmitting={updateProductMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default EditProductPage;
