import React from 'react';
import { Smartphone, BarChart3, Globe2, WifiOff, Calculator, Package } from 'lucide-react';
import FeatureCard from './FeatureCard';
import { colors } from '../utils/colors';

const features = [
  {
    icon: Package,
    title: 'Inventory Management',
    description: 'Simplified tracking with photo-based product entry and barcode scanning.',
  },
  {
    icon: Smartphone,
    title: 'Sales Recording',
    description: 'Seamless M-PESA integration and digital receipts for every transaction.',
  },
  {
    icon: Calculator,
    title: 'Basic Accounting',
    description: 'Track profits, losses, and expenses with easy-to-understand reports.',
  },
  {
    icon: Globe2,
    title: 'Multilingual Support',
    description: 'Use the app in Kiswahili, English, or your preferred local language.',
  },
  {
    icon: WifiOff,
    title: 'Offline Mode',
    description: 'Keep working even without internet - your data syncs when you are back online.',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'Get insights on seasonal trends and automated reorder suggestions.',
  },
];

export default function Features() {
  return (
    <div className="py-24 bg-[#FDFFFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#011627]">
            Features That Empower Your Business
          </h2>
          <p className="mt-4 text-lg text-[#011627]/70">
            Everything you need to manage your business efficiently
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