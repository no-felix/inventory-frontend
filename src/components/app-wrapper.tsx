import { useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useHealthCheck, useSetupStatus } from '@/hooks';
import ServiceDownPage from '@/pages/service-down';
import SetupPage from '@/pages/setup';

// ----------------------------------------------------------
// Setup Completion Cache
// ----------------------------------------------------------

const SETUP_COMPLETE_KEY = 'inventory_setup_complete';

export const setupCache = {
  isComplete: (): boolean => localStorage.getItem(SETUP_COMPLETE_KEY) === 'true',
  markComplete: (): void => localStorage.setItem(SETUP_COMPLETE_KEY, 'true'),
  clear: (): void => localStorage.removeItem(SETUP_COMPLETE_KEY),
};

interface AppWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper component that handles:
 * 1. Backend health checking - shows service down page if backend is unreachable
 * 2. Setup status checking - redirects to setup page if no admin exists
 *    (only checks once, cached in localStorage after setup is complete)
 */
export function AppWrapper({ children }: AppWrapperProps) {
  const queryClient = useQueryClient();
  const [isInitialCheck, setIsInitialCheck] = useState(true);
  
  // Check if setup was already completed (cached in localStorage)
  const [setupAlreadyComplete] = useState(() => setupCache.isComplete());
  
  // Health check - always runs
  const { 
    data: healthData, 
    isLoading: healthLoading,
    refetch: refetchHealth,
  } = useHealthCheck(true);
  
  // Setup status - only check when backend is healthy AND setup not already cached as complete
  const isBackendHealthy = healthData?.status === 'UP';
  const shouldCheckSetup = isBackendHealthy && !setupAlreadyComplete;
  
  const { 
    data: setupData, 
    isLoading: setupLoading,
    isError: setupError,
  } = useSetupStatus(shouldCheckSetup);

  // Track if this is the initial health check
  useEffect(() => {
    if (!healthLoading && isInitialCheck) {
      setIsInitialCheck(false);
    }
  }, [healthLoading, isInitialCheck]);

  // Cache setup completion when we confirm it's not required
  useEffect(() => {
    if (setupData && !setupData.setupRequired && !setupAlreadyComplete) {
      setupCache.markComplete();
    }
  }, [setupData, setupAlreadyComplete]);

  // Handle retry from service down page
  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['health'] });
    refetchHealth();
  };

  // Handle setup completion - cache and reload
  const handleSetupComplete = () => {
    setupCache.markComplete();
    queryClient.invalidateQueries({ queryKey: ['setup-status'] });
    window.location.href = '/login';
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

  // If setup is already cached as complete, skip setup checks
  if (setupAlreadyComplete) {
    return <>{children}</>;
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
    return <SetupPage onSetupComplete={handleSetupComplete} />;
  }

  // All checks passed, render the app
  return <>{children}</>;
}
