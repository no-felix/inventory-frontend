import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

interface HealthStatus {
  status: 'UP' | 'DOWN';
}

/**
 * Hook for checking backend health status
 * Uses Spring Boot Actuator health endpoint
 */
export function useHealthCheck(enabled = true) {
  return useQuery({
    queryKey: ['health'],
    queryFn: async (): Promise<HealthStatus> => {
      try {
        const response = await fetch(`${API_BASE_URL}/actuator/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });
        
        if (!response.ok) {
          return { status: 'DOWN' };
        }
        
        const data = await response.json();
        return { status: data.status === 'UP' ? 'UP' : 'DOWN' };
      } catch {
        return { status: 'DOWN' };
      }
    },
    enabled,
    staleTime: 0, // Always check fresh
    refetchInterval: 10000, // Check every 10 seconds
    refetchIntervalInBackground: true,
    retry: false, // Don't retry, we'll use the interval
  });
}
