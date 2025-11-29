import { useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useHealthCheck, useSetupStatus } from '@/hooks';
import ServiceDownPage from '@/pages/service-down';
import SetupPage from '@/pages/setup';

interface AppWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper component that handles:
 * 1. Backend health checking - shows service down page if backend is unreachable
 * 2. Setup status checking - redirects to setup page if no admin exists
 */
export function AppWrapper({ children }: AppWrapperProps) {
  const queryClient = useQueryClient();
  const [isInitialCheck, setIsInitialCheck] = useState(true);
  
  // Health check - always runs
  const { 
    data: healthData, 
    isLoading: healthLoading,
    refetch: refetchHealth,
  } = useHealthCheck(true);
  
  // Setup status - only check when backend is healthy
  const isBackendHealthy = healthData?.status === 'UP';
  const { 
    data: setupData, 
    isLoading: setupLoading,
    isError: setupError,
  } = useSetupStatus();

  // Track if this is the initial health check
  useEffect(() => {
    if (!healthLoading && isInitialCheck) {
      setIsInitialCheck(false);
    }
  }, [healthLoading, isInitialCheck]);

  // Handle retry from service down page
  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['health'] });
    refetchHealth();
  };

  // Show loading spinner during initial check only
  if (isInitialCheck && healthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Connecting to server...</p>
        </div>
      </div>
    );
  }

  // Show service down page if backend is unhealthy
  if (!isBackendHealthy && !healthLoading) {
    return <ServiceDownPage onRetry={handleRetry} />;
  }

  // Show loading while checking setup status
  if (setupLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show setup page if setup is required (no admin exists)
  // Only show if we successfully got the setup status (not on error)
  if (!setupError && setupData?.setupRequired) {
    return <SetupPage />;
  }

  // All checks passed, render the app
  return <>{children}</>;
}
