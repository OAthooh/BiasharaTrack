import React from 'react';
import TestimonialCard from './TestimonialCard';
import { colors } from '../utils/colors';

const testimonials = [
  {
    quote: "BiasharaTrack has transformed how I manage my shop. The M-PESA integration saves me so much time!",
    author: "Sarah Mwangi",
    business: "Grocery Store Owner, Nairobi"
  },
  {
    quote: "Being able to use the app in Kiswahili has made it so easy for me to track my inventory and sales.",
    author: "John Kamau",
    business: "Hardware Store Owner, Mombasa"
  }
];

export default function Impact() {
  return (
    <div className="bg-[#FDFFFC] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#011627]">
            Making a Real Impact
          </h2>
          <p className="mt-4 text-lg text-[#011627]/70">
            Empowering traders across Kenya to grow their businesses
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </div>
  );
}