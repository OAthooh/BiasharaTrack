import DashboardLayout from '../../components/dashboard/DashboardLayout';
import CreditMetrics from '../../components/credits/CreditMetrics';
import CustomerCreditList from '../../components/credits/CustomerCreditList';
import UpcomingPayments from '../../components/credits/UpcomingPayments';
import CreditTerms from '../../components/credits/CreditTerms';
import { useTranslation } from 'react-i18next';

export default function CreditsManagement() {
  const { t } = useTranslation();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#011627]">{t('creditPanel.title')}</h1>
        {/* <p>Debug: Page is rendering</p> */}
        
        {typeof CreditMetrics === 'function' && <CreditMetrics />}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {typeof CustomerCreditList === 'function' && <CustomerCreditList />}
          </div>
          <div className="space-y-6">
            {typeof UpcomingPayments === 'function' && <UpcomingPayments />}
            {typeof CreditTerms === 'function' && <CreditTerms />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}