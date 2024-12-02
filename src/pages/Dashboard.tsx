import React from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import InventoryPanel from '../components/dashboard/panels/InventoryPanel';
import SalesPanel from '../components/dashboard/panels/SalesPanel';
import FinancialPanel from '../components/dashboard/panels/FinancialPanel';
import CreditPanel from '../components/dashboard/panels/CreditPanel';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <TopBar />
        <main className="p-4 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InventoryPanel />
            <SalesPanel />
            <FinancialPanel />
            <CreditPanel />
          </div>
        </main>
      </div>
    </div>
  );
}