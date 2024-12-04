import React from 'react';
import { Smartphone, BarChart3, Globe2, WifiOff, Calculator, Package } from 'lucide-react';
import FeatureCard from './FeatureCard';
import { colors } from '../utils/colors';
import { useTranslation } from 'react-i18next';

const featureIcons = {
  inventory: Package,
  sales: Smartphone,
  accounting: Calculator,
  multilingual: Globe2,
  offline: WifiOff,
  analytics: BarChart3,
};

export default function Features() {
  const { t } = useTranslation();

  const features = Object.entries(featureIcons).map(([key, Icon]) => ({
    icon: Icon,
    title: t(`features.items.${key}.title`),
    description: t(`features.items.${key}.description`),
  }));

  return (
    <div className="py-24 bg-[#FDFFFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#011627]">
            {t('features.title')}
          </h2>
          <p className="mt-4 text-lg text-[#011627]/70">
            {t('features.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
}