import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import InventoryManagement from './pages/inventory/InventoryManagement';
import FloatingLanguageSwitcher from './components/FloatingLanguageSwitcher';
import SalesManagement from './pages/sales/SalesManagement';

function App() {
  return (
    <Router>
      <FloatingLanguageSwitcher />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/inventory" element={<InventoryManagement />} />
        <Route path="/dashboard/sales" element={<SalesManagement />} />
      </Routes>
    </Router>
  );
}

export default App;