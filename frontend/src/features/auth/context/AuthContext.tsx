import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authService } from '../api/authService';
import type { AuthUser, UserRole } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (accessToken: string, refreshToken: string, email: string, role: UserRole) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  
  useEffect(() => {
    // Check if user is already logged in on app startup
    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole') as UserRole | null;
    
    if (email && role) {
      setUser({ email, role });
    }
  }, []);

  const login = (accessToken: string, refreshToken: string, email: string, role: UserRole) => {
    // Store auth data in localStorage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
    
    // Update auth state
    setUser({ email, role });
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}