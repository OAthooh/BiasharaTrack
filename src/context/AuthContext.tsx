import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuth as useAuthHook } from '../utils/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: {
    id: number;
    fullName: string;
    email: string;
  } | null;
  loading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (credentials: { fullName: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [initialized, setInitialized] = useState(false);
  const { 
    user,
    loading = true,
    error,
    login,
    register,
    logout,
    checkAuth
  } = useAuthHook();

  useEffect(() => {
    const initAuth = async () => {
      checkAuth();
      setInitialized(true);
    };
    initAuth();
  }, []);

  if (!initialized || loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated: !!user,
        user: user ? {
          id: user.id,
          fullName: user.full_name || '',
          email: user.email
        } : null,
        loading,
        error,
        login,
        register,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  console.log("Context", context);
  return context;
};