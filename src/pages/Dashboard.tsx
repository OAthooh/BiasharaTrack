import DashboardLayout from '../components/dashboard/DashboardLayout';
import InventoryPanel from '../components/dashboard/panels/InventoryPanel';
import SalesPanel from '../components/dashboard/panels/SalesPanel';
import FinancialPanel from '../components/dashboard/panels/FinancialPanel';
import CreditPanel from '../components/dashboard/panels/CreditPanel';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <InventoryPanel />
          <SalesPanel />
          <FinancialPanel />
          <CreditPanel />
        </div>
      </div>
    </DashboardLayout>
  );
}