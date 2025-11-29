import apiClient, { tokenStorage } from '@/lib/api-client';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserResponse,
} from '@/types';

const AUTH_BASE = '/api/v1/auth';

export const authService = {
  /**
   * Register a new user account
   */
  register: async (data: RegisterRequest): Promise<UserResponse> => {
    const response = await apiClient.post<UserResponse>(`${AUTH_BASE}/register`, data);
    return response.data;
  },

  /**
   * Login with username and password
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(`${AUTH_BASE}/login`, data);
    const { accessToken, refreshToken } = response.data;
    tokenStorage.setTokens(accessToken, refreshToken);
    return response.data;
  },

  /**
   * Refresh the access token using refresh token
   */
  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await apiClient.post<AuthResponse>(`${AUTH_BASE}/refresh`, {
      refreshToken,
    });
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    tokenStorage.setTokens(accessToken, newRefreshToken);
    return response.data;
  },

  /**
   * Logout the current user
   */
  logout: (): void => {
    tokenStorage.clearTokens();
  },

  /**
   * Check if user is authenticated (has valid tokens)
   */
  isAuthenticated: (): boolean => {
    return tokenStorage.hasTokens();
  },
};

export default authService;
