import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';

import { AuthProvider, ThemeProvider, useAuth } from '@/context';
import { ProtectedRoute } from '@/components/auth';
import { AppLayout } from '@/components/layout';
import { AppWrapper } from '@/components/app-wrapper';
import { ErrorBoundary } from '@/components/error-boundary';

// Auth pages (eagerly loaded)
import { LoginPage, RegisterPage } from '@/pages/auth';

// Lazy-loaded pages (code splitting)
const DashboardPage = lazy(() => import('@/pages/dashboard'));
const ProductsPage = lazy(() => import('@/pages/products'));
const ProductDetailPage = lazy(() => import('@/pages/products/detail'));
const CreateProductPage = lazy(() => import('@/pages/products/create'));
const EditProductPage = lazy(() => import('@/pages/products/edit'));
const PurchaseOrdersPage = lazy(() => import('@/pages/purchase-orders'));
const PurchaseOrderDetailPage = lazy(() => import('@/pages/purchase-orders/detail'));
const CreatePurchaseOrderPage = lazy(() => import('@/pages/purchase-orders/create'));
const StockMovementsPage = lazy(() => import('@/pages/stock-movements'));
const AnalyticsPage = lazy(() => import('@/pages/analytics'));
const AnalyticsLayout = lazy(() => import('@/pages/analytics/layout'));
const StockLevelsPage = lazy(() => import('@/pages/analytics/stock-levels'));
const LowStockPage = lazy(() => import('@/pages/analytics/low-stock'));
const SlowMovingPage = lazy(() => import('@/pages/analytics/slow-moving'));
const ValuationPage = lazy(() => import('@/pages/analytics/valuation'));
const SettingsPage = lazy(() => import('@/pages/settings'));
const NotFoundPage = lazy(() => import('@/pages/not-found'));

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
// Loading Fallback for Lazy Routes
// ----------------------------------------------------------

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

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
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
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
            <ErrorBoundary>
              <AuthProvider>
                <AppRoutes />
                <Toaster position="top-right" richColors />
              </AuthProvider>
            </ErrorBoundary>
          </AppWrapper>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
