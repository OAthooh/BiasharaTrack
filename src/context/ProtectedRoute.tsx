import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: JSX.Element;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator
  }

  if (!isAuthenticated) {
    console.log("Not authenticated", isAuthenticated);
    return <Navigate to="/login" />;
  }

  return children;
} 