import React from 'react';
import { Users, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CreditPanel() {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#011627]">{t('creditPanel.title')}</h2>
        <Users className="h-6 w-6 text-[#2EC4B6]" />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{t('creditPanel.outstanding')}</span>
          <span className="text-lg font-medium">KSH 45,200</span>
        </div>
        <div className="flex items-center text-[#FF9F1C]">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="text-sm">{t('creditPanel.paymentsdue', { count: 2 })}</span>
        </div>
        <button className="w-full bg-[#2EC4B6] text-white py-2 rounded-lg hover:bg-[#28b0a3] transition-colors">
        {t('creditPanel.button')}
        </button>
      </div>
    </div>
  );
}