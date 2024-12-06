import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuth as useAuthHook } from '../utils/auth';
import { User } from '../types/user';  // Import the User interface

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
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
      await checkAuth();
      setInitialized(true);
    };
    initAuth();
  }, [checkAuth]);

  if (!initialized || loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated: !!user,
        user: user ? {
          id: String(user.id),
          name: user.full_name || '',
          email: user.email,
          role: 'owner',
          businessName: 'Default Business', // businessName: user.business_name || 'Default Business', implement real busines name
          imageUrl: ''
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
  return context;
};