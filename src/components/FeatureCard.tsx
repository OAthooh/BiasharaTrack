import React from 'react';
import { LucideIcon } from 'lucide-react';
import { colors } from '../utils/colors';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-xl border border-[#011627]/10 shadow-sm hover:shadow-md transition-shadow bg-[#FDFFFC]">
      <Icon className="w-12 h-12 text-[#2EC4B6] mb-4" />
      <h3 className="text-xl font-semibold text-[#011627] mb-2">
        {title}
      </h3>
      <p className="text-[#011627]/70">{description}</p>
    </div>
  );
}