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

interface JwtPayload {
  sub: string; // username
  role: 'USER' | 'ADMIN';
  exp: number;
  iat: number;
}

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
// JWT Decoder Helper
// ----------------------------------------------------------

function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

function getUserFromToken(token: string | null): UserResponse | null {
  if (!token) return null;
  
  const payload = decodeJwt(token);
  if (!payload) return null;
  
  return {
    username: payload.sub,
    role: payload.role,
  };
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
      const token = tokenStorage.getAccessToken();
      const user = getUserFromToken(token);
      
      setState({
        isAuthenticated: hasTokens,
        isLoading: false,
        user,
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
      
      const user = getUserFromToken(response.data?.accessToken ?? null);
      
      setState({
        isAuthenticated: true,
        isLoading: false,
        user,
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
