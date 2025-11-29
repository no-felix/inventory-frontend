import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { authService } from '@/services';
import { tokenStorage } from '@/lib/api-client';
import type { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '@/types';

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
      const response = await authService.login(credentials);
      setState({
        isAuthenticated: true,
        isLoading: false,
        user: null, // Backend doesn't return user info on login
      });
      return response;
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
      const user = await authService.register(userData);
      setState((prev) => ({ ...prev, isLoading: false }));
      return user;
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
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
