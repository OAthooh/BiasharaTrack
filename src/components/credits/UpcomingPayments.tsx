import { Clock, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useTranslation } from 'react-i18next';

interface Payment {
  id: string;
  customerName: string;
  amount: number;
  dueDate: Date;
  isOverdue: boolean;
}

export default function UpcomingPayments() {
  const { t } = useTranslation();
  // Replace with actual data from your API
  const payments: Payment[] = [];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#011627]">{t('credits.upcomingPayments.title')}</h2>
        <Clock className="h-5 w-5 text-[#2EC4B6]" />
      </div>
      <div className="space-y-4">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className={`p-4 rounded-lg ${
              payment.isOverdue ? 'bg-red-50' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-[#011627]">
                  {payment.customerName}
                </h3>
                <p className="text-sm text-gray-500">
                {t('credits.upcomingPayments.due')}: {formatDate(payment.dueDate)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-[#011627]">
                  {formatCurrency(payment.amount)}
                </p>
                {payment.isOverdue && (
                  <div className="flex items-center text-red-600 text-xs mt-1">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {t('credits.upcomingPayments.overdue')}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {payments.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            {t('credits.upcomingPayments.noPayments')}
          </p>
        )}
      </div>
    </div>
  );
}