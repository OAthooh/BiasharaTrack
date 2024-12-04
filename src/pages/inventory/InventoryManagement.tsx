import DashboardLayout from '../../components/dashboard/DashboardLayout';
import AddProduct from '../../components/inventory/AddProduct';
import ProductList from '../../components/inventory/ProductList';
import LowStockAlerts from '../../components/inventory/LowStockAlerts';

export default function InventoryManagement() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#011627]">Inventory Management</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AddProduct />
          <LowStockAlerts />
        </div>
        <ProductList />
      </div>
    </DashboardLayout>
  );
}