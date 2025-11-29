import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { login as loginApi, register as registerApi } from '@/api/generated';
import { tokenStorage } from '@/api/client';
import type { LoginRequest, RegisterRequest, AuthResponse, UserResponse } from '@/api/generated';

// ----------------------------------------------------------
// Types
// ----------------------------------------------------------

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserResponse | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  register: (userData: RegisterRequest) => Promise<UserResponse>;
  logout: () => void;
}

// ----------------------------------------------------------
// Context
// ----------------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ----------------------------------------------------------
// Provider
// ----------------------------------------------------------

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = () => {
      const hasTokens = tokenStorage.hasTokens();
      setState({
        isAuthenticated: hasTokens,
        isLoading: false,
        user: null, // We could decode JWT to get user info if needed
      });
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<AuthResponse> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await loginApi({ body: credentials });
      
      if (response.error) {
        throw response.error;
      }
      
      if (response.data?.accessToken && response.data?.refreshToken) {
        tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
      }
      
      setState({
        isAuthenticated: true,
        isLoading: false,
        user: null, // Backend doesn't return user info on login
      });
      return response.data as AuthResponse;
    } catch (error) {
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
      throw error;
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest): Promise<UserResponse> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await registerApi({ body: userData });
      
      if (response.error) {
        throw response.error;
      }
      
      setState((prev) => ({ ...prev, isLoading: false }));
      return response.data as UserResponse;
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clearTokens();
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ----------------------------------------------------------
// Hook
// ----------------------------------------------------------

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
