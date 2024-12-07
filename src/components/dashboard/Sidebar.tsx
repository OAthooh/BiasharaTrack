import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart2,
  Users,
  FileText,
  Video,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import UserProfile from './UserProfile';
// import { User } from '../../types/user';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Inventory', icon: Package, href: '/dashboard/inventory' },
    { name: 'Sales', icon: ShoppingCart, href: '/dashboard/sales' },
    { name: 'Analytics', icon: BarChart2, href: '/dashboard/analytics' },
    { name: 'Credit', icon: Users, href: '/dashboard/credits' },
    { name: 'Reports', icon: FileText, href: '/dashboard/reports' },
    { name: 'Tutorials', icon: Video, href: '/dashboard/tutorials' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    onClose();
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#011627] transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between h-16 flex-shrink-0 px-4">
        <h1 className="text-2xl font-bold text-[#FDFFFC]">BiasharaTrack</h1>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md text-[#FDFFFC] hover:bg-[#2EC4B6]/10"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="px-3 mb-6">
        {user && <UserProfile user={user} />}
      </div>

      <nav className="mt-2 flex-1 flex flex-col divide-y divide-[#FDFFFC]/10">
        <div className="px-2 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => handleNavigation(item.href)}
              className={`group flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md text-[#FDFFFC] hover:bg-[#2EC4B6] hover:text-white ${
                location.pathname === item.href ? 'bg-[#2EC4B6]' : ''
              }`}
            >
              <item.icon className="mr-4 flex-shrink-0 h-6 w-6" />
              {item.name}
            </Link>
          ))}
        </div>
        <div className="mt-6 pt-6">
          <div className="px-2 space-y-1">
            <button
              onClick={handleLogout}
              className="group flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md text-[#FDFFFC] hover:bg-[#E71D36] hover:text-white w-full"
            >
              <LogOut className="mr-4 flex-shrink-0 h-6 w-6" />
              Sign out
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}