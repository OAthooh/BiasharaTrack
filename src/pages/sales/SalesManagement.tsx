import DashboardLayout from '../../components/dashboard/DashboardLayout';
import SalesEntry from '../../components/sales/SalesEntry';
import SalesHistory from '../../components/sales/SalesHistory';
import SalesInsights from '../../components/sales/SalesInsights';
import { useTranslation } from 'react-i18next';

export default function SalesManagement() {
  const { t } = useTranslation();
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#011627]">{t('salesEntry.title1')}</h1>
        <SalesInsights />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesEntry />
          <SalesHistory />
        </div>
      </div>
    </DashboardLayout>
  );
}