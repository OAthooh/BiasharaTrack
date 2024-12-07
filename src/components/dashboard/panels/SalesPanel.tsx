import { ShoppingCart, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SalesPanel() {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#011627]">{t('salesPanel.title')}</h2>
        <ShoppingCart className="h-6 w-6 text-[#2EC4B6]" />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{t('salesPanel.totalSales')}</span>
          <span className="text-lg font-medium">KSH 25,450</span>
        </div>
        <div className="flex items-center text-[#2EC4B6]">
          <TrendingUp className="h-5 w-5 mr-2" />
          <span className="text-sm">{t('salesPanel.increase', { percentage: 15 })}</span>
        </div>
        <button className="w-full bg-[#E71D36] text-white py-2 rounded-lg hover:bg-[#c91126] transition-colors">
        {t('salesPanel.button')}
        </button>
      </div>
    </div>
  );
}