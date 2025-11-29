import { client } from '@/api/generated/client.gen';
import { refreshToken as refreshTokenApi } from '@/api/generated';
import type { ProblemDetail } from '@/api/generated';

// ----------------------------------------------------------
// Token Storage
// ----------------------------------------------------------

const ACCESS_TOKEN_KEY = 'inventory_access_token';
const REFRESH_TOKEN_KEY = 'inventory_refresh_token';

export const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),

  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  hasTokens: (): boolean => {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },
};

// ----------------------------------------------------------
// API Client Configuration
// ----------------------------------------------------------

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Configure the base URL
client.setConfig({
  baseUrl: API_BASE_URL,
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// ----------------------------------------------------------
// Request Interceptor - Add Auth Token
// ----------------------------------------------------------

client.interceptors.request.use((request) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`);
  }
  return request;
});

// ----------------------------------------------------------
// Response Interceptor - Handle Token Refresh
// ----------------------------------------------------------

client.interceptors.response.use(async (response, request) => {
  // If response is OK, return as-is
  if (response.ok) {
    return response;
  }

  // If not 401, return the response
  if (response.status !== 401) {
    return response;
  }

  // Skip refresh for auth endpoints
  const url = request.url || '';
  if (url.includes('/auth/')) {
    return response;
  }

  // Handle 401 with token refresh
  const storedRefreshToken = tokenStorage.getRefreshToken();
  if (!storedRefreshToken) {
    tokenStorage.clearTokens();
    window.location.href = '/login';
    return response;
  }

  if (isRefreshing) {
    // If already refreshing, queue this request
    return new Promise((resolve, reject) => {
      failedQueue.push({
        resolve: async (token: string) => {
          request.headers.set('Authorization', `Bearer ${token}`);
          try {
            const retryResponse = await fetch(request);
            resolve(retryResponse);
          } catch (err) {
            reject(err);
          }
        },
        reject: () => reject(response),
      });
    });
  }

  isRefreshing = true;

  try {
    const refreshResponse = await refreshTokenApi({
      body: { refreshToken: storedRefreshToken },
    });

    if (refreshResponse.data?.accessToken && refreshResponse.data?.refreshToken) {
      tokenStorage.setTokens(
        refreshResponse.data.accessToken,
        refreshResponse.data.refreshToken
      );

      processQueue(null, refreshResponse.data.accessToken);

      // Retry the original request with new token
      request.headers.set('Authorization', `Bearer ${refreshResponse.data.accessToken}`);
      return fetch(request);
    } else {
      throw new Error('Invalid refresh response');
    }
  } catch (refreshError) {
    processQueue(refreshError, null);
    tokenStorage.clearTokens();
    window.location.href = '/login';
    return response;
  } finally {
    isRefreshing = false;
  }
});

// ----------------------------------------------------------
// Error Helper
// ----------------------------------------------------------

export const getErrorMessage = (error: unknown): string => {
  // Handle hey-api error structure
  if (error && typeof error === 'object') {
    const err = error as { 
      error?: ProblemDetail; 
      response?: Response;
      detail?: string;
      title?: string;
      status?: number;
    };
    
    // Handle ProblemDetail thrown directly (from auth context)
    if (err.detail) return err.detail;
    if (err.title) return err.title;
    
    // Handle wrapped error structure
    if (err.error) {
      if (err.error.detail) return err.error.detail;
      if (err.error.title) return err.error.title;
    }
    
    // Handle fetch error
    if ('message' in error && typeof (error as { message: string }).message === 'string') {
      return (error as { message: string }).message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export { client };
