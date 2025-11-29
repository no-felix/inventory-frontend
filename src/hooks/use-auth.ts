import { useMutation } from '@tanstack/react-query';
import { login, register, refreshToken } from '@/api/generated';
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
