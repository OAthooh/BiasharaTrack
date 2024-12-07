import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import InventoryManagement from './pages/inventory/InventoryManagement';
import FloatingLanguageSwitcher from './components/FloatingLanguageSwitcher';
import ProtectedRoute from './context/ProtectedRoute';
import SalesManagement from './pages/sales/SalesManagement';
import CreditsManagement from './pages/credits/CreditsManagement';
import NotFound from './pages/error/NotFound';
import Unauthorized from './pages/error/Unauthorized';
import ServerError from './pages/error/ServerError';
import ErrorBoundary from './components/ErrorBoundary';


function App() {
  return (
    <ErrorBoundary>
      <Router>
        <FloatingLanguageSwitcher />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/inventory" 
            element={
              <ProtectedRoute>
                <InventoryManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/sales" 
            element={
              <ProtectedRoute>
                <SalesManagement />
              </ProtectedRoute>
            } 
          />
        <Route 
            path="/dashboard/credits" 
            element={
              <ProtectedRoute>
                <CreditsManagement />
              </ProtectedRoute>
            } 
          />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/server-error" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;