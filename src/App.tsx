import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';

import { AuthProvider, ThemeProvider, useAuth } from '@/context';
import { ProtectedRoute } from '@/components/auth';
import { AppLayout } from '@/components/layout';
import { AppWrapper } from '@/components/app-wrapper';

// Pages
import { LoginPage, RegisterPage } from '@/pages/auth';
import DashboardPage from '@/pages/dashboard';
import ProductsPage from '@/pages/products';
import ProductDetailPage from '@/pages/products/detail';
import CreateProductPage from '@/pages/products/create';
import EditProductPage from '@/pages/products/edit';
import PurchaseOrdersPage from '@/pages/purchase-orders';
import PurchaseOrderDetailPage from '@/pages/purchase-orders/detail';
import CreatePurchaseOrderPage from '@/pages/purchase-orders/create';
import StockMovementsPage from '@/pages/stock-movements';
import AnalyticsPage from '@/pages/analytics';
import AnalyticsLayout from '@/pages/analytics/layout';
import StockLevelsPage from '@/pages/analytics/stock-levels';
import LowStockPage from '@/pages/analytics/low-stock';
import SlowMovingPage from '@/pages/analytics/slow-moving';
import ValuationPage from '@/pages/analytics/valuation';
import SettingsPage from '@/pages/settings';
import NotFoundPage from '@/pages/not-found';

// ----------------------------------------------------------
// Query Client Configuration
// ----------------------------------------------------------

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ----------------------------------------------------------
// Public Route Guard (redirects authenticated users)
// ----------------------------------------------------------

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// ----------------------------------------------------------
// App Routes Component
// ----------------------------------------------------------

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<CreateProductPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="products/:id/edit" element={<EditProductPage />} />
        <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
        <Route path="purchase-orders/new" element={<CreatePurchaseOrderPage />} />
        <Route path="purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
        <Route path="stock-movements" element={<StockMovementsPage />} />
        <Route path="analytics" element={<AnalyticsLayout />}>
          <Route index element={<AnalyticsPage />} />
          <Route path="stock-levels" element={<StockLevelsPage />} />
          <Route path="low-stock" element={<LowStockPage />} />
          <Route path="slow-moving" element={<SlowMovingPage />} />
          <Route path="valuation" element={<ValuationPage />} />
        </Route>
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

// ----------------------------------------------------------
// Main App Component
// ----------------------------------------------------------

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="inventory-theme">
        <BrowserRouter>
          <AppWrapper>
            <AuthProvider>
              <AppRoutes />
              <Toaster position="top-right" richColors />
            </AuthProvider>
          </AppWrapper>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
