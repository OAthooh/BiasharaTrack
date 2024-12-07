import { useState } from 'react';
import { Settings, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CreditTerms {
  maxCreditPeriod: number;
  interestRate: number;
  lateFee: number;
}

export default function CreditTerms() {
  const { t } = useTranslation();
  const [terms, setTerms] = useState<CreditTerms>({
    maxCreditPeriod: 30,
    interestRate: 0,
    lateFee: 0
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // Add API call to save terms
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#011627]">{t('credits.terms.title')}</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-[#2EC4B6] hover:text-[#28b0a3]"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
          {t('credits.terms.maxCreditPeriod')}
          </label>
          {isEditing ? (
            <input
              type="number"
              value={terms.maxCreditPeriod}
              onChange={(e) => setTerms({ ...terms, maxCreditPeriod: parseInt(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
            />
          ) : (
            <p className="text-sm text-[#011627]">{terms.maxCreditPeriod} {t('credits.terms.days')}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
          {t('credits.terms.interestRate')}
          </label>
          {isEditing ? (
            <input
              type="number"
              value={terms.interestRate}
              onChange={(e) => setTerms({ ...terms, interestRate: parseFloat(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
            />
          ) : (
            <p className="text-sm text-[#011627]">{terms.interestRate}%</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
          {t('credits.terms.lateFee')}
          </label>
          {isEditing ? (
            <input
              type="number"
              value={terms.lateFee}
              onChange={(e) => setTerms({ ...terms, lateFee: parseFloat(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
            />
          ) : (
            <p className="text-sm text-[#011627]">KSH {terms.lateFee}</p>
          )}
        </div>
        {isEditing && (
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-[#2EC4B6] text-white py-2 rounded-lg hover:bg-[#28b0a3] transition-colors"
          >
            <Save className="w-4 h-4" />
            {t('credits.terms.saveChanges')}
          </button>
        )}
      </div>
    </div>
  );
}