import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import InventoryManagement from './pages/inventory/InventoryManagement';
import FloatingLanguageSwitcher from './components/FloatingLanguageSwitcher';
import ProtectedRoute from './context/ProtectedRoute';
import SalesManagement from './pages/sales/SalesManagement';

function App() {
  return (
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
      </Routes>
    </Router>
  );
}

export default App;