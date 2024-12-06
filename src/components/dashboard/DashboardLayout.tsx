import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity lg:hidden z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:pl-64">
        <TopBar onMenuClick={toggleSidebar} />
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}