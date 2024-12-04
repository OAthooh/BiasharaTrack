import React from 'react';
import TestimonialCard from './TestimonialCard';
import { colors } from '../utils/colors';
import { useTranslation } from 'react-i18next';

export default function Impact() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#FDFFFC] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#011627]">
            {t('impact.title')}
          </h2>
          <p className="mt-4 text-lg text-[#011627]/70">
            {t('impact.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {['testimonial1', 'testimonial2'].map((key) => (
            <TestimonialCard
              key={key}
              quote={t(`impact.testimonials.${key}.quote`)}
              author={t(`impact.testimonials.${key}.author`)}
              business={t(`impact.testimonials.${key}.business`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}