import { DollarSign, Users, Clock, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useTranslation } from 'react-i18next';

export default function CreditMetrics() {
  const { t } = useTranslation();

  // Replace with actual data from your API
  const metrics = {
    totalOutstanding: 125000,
    activeAccounts: 45,
    overdueAccounts: 8,
    upcomingPayments: 12
  };

  const cards = [
    {
      title: t('creditMetrics.totalOutstanding'),
      value: formatCurrency(metrics.totalOutstanding),
      icon: DollarSign,
      color: 'text-[#2EC4B6]',
      bgColor: 'bg-[#2EC4B6]/10'
    },
    {
      title: t('creditMetrics.activeAccounts'),
      value: metrics.activeAccounts,
      icon: Users,
      color: 'text-[#FF9F1C]',
      bgColor: 'bg-[#FF9F1C]/10'
    },
    {
      title: t('creditMetrics.overdueAccounts'),
      value: metrics.overdueAccounts,
      icon: AlertTriangle,
      color: 'text-[#E71D36]',
      bgColor: 'bg-[#E71D36]/10'
    },
    {
      title: t('creditMetrics.upcomingPayments'),
      value: metrics.upcomingPayments,
      icon: Clock,
      color: 'text-[#2EC4B6]',
      bgColor: 'bg-[#2EC4B6]/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <p className="mt-1 text-xl font-semibold text-[#011627]">{card.value}</p>
            </div>
            <div className={`${card.bgColor} rounded-full p-3`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}