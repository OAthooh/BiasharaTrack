import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'sw' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-4 py-2 rounded-full bg-[#2EC4B6] text-white hover:bg-[#25a093] transition-colors"
    >
      {i18n.language === 'en' ? 'Kiswahili' : 'English'}
    </button>
  );
}