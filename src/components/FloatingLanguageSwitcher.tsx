import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function FloatingLanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'sw' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-[#2EC4B6] text-white hover:bg-[#25a093] transition-colors shadow-lg"
      aria-label="Toggle language"
    >
      <Globe className="w-5 h-5" />
      <span>{i18n.language === 'en' ? 'Kiswahili' : 'English'}</span>
    </button>
  );
}