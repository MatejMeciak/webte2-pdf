import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';

// Remove baseURL config, only keep content type header
axios.defaults.headers.post['Content-Type'] = 'application/json';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      // Optionally verify token here
    }
  }, []);

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        firstName,
        lastName
      });
      
      if (response.status === 201) {
        return response.data;
      }
    } catch (error) {
      throw new Error('Registration failed');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data) {
        const { accessToken, role } = response.data;
        if (accessToken) {
          localStorage.setItem('token', accessToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          setIsAuthenticated(true);
          setUserRole(role);
          return response.data;
        }
      }
      throw new Error('Neplatná odpoveď zo servera');
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Nesprávne prihlasovacie údaje');
      }
      console.error('Login error:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Chyba pri prihlásení');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
