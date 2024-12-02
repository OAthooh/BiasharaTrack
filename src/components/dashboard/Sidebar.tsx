import React from 'react';
import { Link } from 'react-router-dom';
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

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Inventory', icon: Package, href: '/dashboard/inventory' },
  { name: 'Sales', icon: ShoppingCart, href: '/dashboard/sales' },
  { name: 'Analytics', icon: BarChart2, href: '/dashboard/analytics' },
  { name: 'Credit', icon: Users, href: '/dashboard/credit' },
  { name: 'Reports', icon: FileText, href: '/dashboard/reports' },
  { name: 'Tutorials', icon: Video, href: '/dashboard/tutorials' },
  { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export default function Sidebar() {
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow bg-[#011627] overflow-y-auto">
        <div className="flex items-center h-16 flex-shrink-0 px-4">
          <h1 className="text-2xl font-bold text-[#FDFFFC]">BiasharaTrack</h1>
        </div>
        <nav className="mt-5 flex-1 flex flex-col divide-y divide-[#FDFFFC]/10">
          <div className="px-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="group flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md text-[#FDFFFC] hover:bg-[#2EC4B6] hover:text-white"
              >
                <item.icon className="mr-4 flex-shrink-0 h-6 w-6" />
                {item.name}
              </Link>
            ))}
          </div>
          <div className="mt-6 pt-6">
            <div className="px-2 space-y-1">
              <button
                className="group flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md text-[#FDFFFC] hover:bg-[#E71D36] hover:text-white w-full"
              >
                <LogOut className="mr-4 flex-shrink-0 h-6 w-6" />
                Sign out
              </button>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}