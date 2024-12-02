import React from 'react';
import { Quote } from 'lucide-react';
import { colors } from '../utils/colors';

interface TestimonialCardProps {
  quote: string;
  author: string;
  business: string;
}

export default function TestimonialCard({ quote, author, business }: TestimonialCardProps) {
  return (
    <div className="bg-[#FDFFFC] p-8 rounded-xl shadow-lg">
      <Quote className="w-10 h-10 text-[#FF9F1C] mb-4" />
      <p className="text-lg mb-4 text-[#011627]">{quote}</p>
      <div>
        <p className="font-semibold text-[#E71D36]">{author}</p>
        <p className="text-sm text-[#011627]/70">{business}</p>
      </div>
    </div>
  );
}