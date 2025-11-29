import { useMutation, useQuery } from '@tanstack/react-query';
import { login, register, refreshToken, checkSetupStatus, setupAdmin } from '@/api/generated';
import { tokenStorage } from '@/api/client';
import type { LoginRequest, RegisterRequest } from '@/api/generated';

/**
 * Hook for user login mutation
 */
export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await login({ body: credentials });
      
      if (response.error) {
        throw response.error;
      }
      
      if (response.data?.accessToken && response.data?.refreshToken) {
        tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
      }
      
      return response.data;
    },
  });
}

/**
 * Hook for user registration mutation
 */
export function useRegister() {
  return useMutation({
    mutationFn: async (userData: RegisterRequest) => {
      const response = await register({ body: userData });
      
      if (response.error) {
        throw response.error;
      }
      
      return response.data;
    },
  });
}

/**
 * Hook for token refresh mutation
 */
export function useRefreshToken() {
  return useMutation({
    mutationFn: async () => {
      const storedRefreshToken = tokenStorage.getRefreshToken();
      
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await refreshToken({ 
        body: { refreshToken: storedRefreshToken } 
      });
      
      if (response.error) {
        throw response.error;
      }
      
      if (response.data?.accessToken && response.data?.refreshToken) {
        tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
      }
      
      return response.data;
    },
  });
}

/**
 * Hook for checking if admin setup is required
 */
export function useSetupStatus() {
  return useQuery({
    queryKey: ['setup-status'],
    queryFn: async () => {
      const response = await checkSetupStatus();
      
      if (response.error) {
        throw response.error;
      }
      
      return response.data;
    },
    staleTime: 0, // Always check fresh
    retry: false, // Don't retry if backend is down
  });
}

/**
 * Hook for creating the initial admin account
 */
export function useSetupAdmin() {
  return useMutation({
    mutationFn: async (userData: RegisterRequest) => {
      const response = await setupAdmin({ body: userData });
      
      if (response.error) {
        throw response.error;
      }
      
      return response.data;
    },
  });
}
