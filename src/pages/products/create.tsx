import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCreateProduct } from '@/hooks';
import { ProductForm, type ProductFormValues } from './product-form';
import { getErrorMessage } from '@/api/client';

export function CreateProductPage() {
  const navigate = useNavigate();
  const createProductMutation = useCreateProduct();

  const handleSubmit = async (data: ProductFormValues) => {
    try {
      const product = await createProductMutation.mutateAsync({
        sku: data.sku,
        name: data.name,
        description: data.description,
        quantityOnHand: data.quantityOnHand,
        unitPrice: data.unitPrice,
      });
      toast.success(`Product "${data.name}" created successfully`);
      navigate(`/products/${product?.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Product</h1>
          <p className="text-muted-foreground">
            Add a new product to your inventory
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Enter the information for the new product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm
            onSubmit={handleSubmit}
            isSubmitting={createProductMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateProductPage;
