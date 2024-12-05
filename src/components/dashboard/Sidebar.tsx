import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart2,
  Users,
  FileText,
  Video,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import UserProfile from './UserProfile';
import { User } from '../../types/user';

// Placeholder user data - replace with actual user data from authentication
const currentUser: User = {
  id: '1',
  name: 'Sarah Mwangi',
  email: 'sarah@biasharatrack.com',
  role: 'owner',
  businessName: 'Mwangi General Store',
};

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useTranslation();

  const navigation = [
    { name: t('dashboard.navigation.dashboard'), icon: LayoutDashboard, href: '/dashboard' },
    { name: t('dashboard.navigation.inventory'), icon: Package, href: '/dashboard/inventory' },
    { name: t('dashboard.navigation.sales'), icon: ShoppingCart, href: '/dashboard/sales' },
    { name: t('dashboard.navigation.analytics'), icon: BarChart2, href: '/dashboard/analytics' },
    { name: t('dashboard.navigation.credit'), icon: Users, href: '/dashboard/credit' },
    { name: t('dashboard.navigation.reports'), icon: FileText, href: '/dashboard/reports' },
    { name: t('dashboard.navigation.tutorials'), icon: Video, href: '/dashboard/tutorials' },
    { name: t('dashboard.navigation.settings'), icon: Settings, href: '/dashboard/settings' },
  ];

  const handleLogout = async () => {
    try {
      logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow bg-[#011627] overflow-y-auto">
        <div className="flex items-center h-16 flex-shrink-0 px-4">
          <h1 className="text-2xl font-bold text-[#FDFFFC]">BiasharaTrack</h1>
        </div>
        <div className="px-3 mb-6">
          <UserProfile user={currentUser} />
        </div>
        <nav className="mt-5 flex-1 flex flex-col divide-y divide-[#FDFFFC]/10">
          <div className="px-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
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
                {t('dashboard.navigation.signOut')}
              </button>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}