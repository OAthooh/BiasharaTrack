import { useState } from 'react';

interface User {
  id: number;
  full_name: string;
  email: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  fullName: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

const API_URL = 'http://localhost:8080';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data: AuthResponse = await response.json();
      setUser(data.user);
      localStorage.setItem('token', data.token);
      
    } catch (err) {
      console.log("Login error", err);
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const data: AuthResponse = await response.json();
      setUser(data.user);
      localStorage.setItem('token', data.token);

    } catch (err) {
      console.log("Register error", err);
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const checkAuth = (): void => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }

    setLoading(true);
    console.log("token", token);
    fetch(`${API_URL}/verify-token`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error(errorData.error || 'Token verification failed');
          });
        }
        return response.json();
      })
      .then(({ user: userData }) => {
        setUser(userData);
      })
      .catch(err => {
        console.log("Token verification error", err);
        setError(err instanceof Error ? err.message : 'Token verification failed');
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth,
  };
};
