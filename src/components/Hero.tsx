import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { colors } from '../utils/colors';

export default function Hero() {
  return (
    <div className="relative min-h-[600px] bg-gradient-to-r from-[#011627] to-[#2EC4B6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-[#FDFFFC] space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Empowering Kenya's Informal Traders with Smart Business Tools
            </h1>
            <p className="text-lg md:text-xl opacity-90">
              Transform your business with our all-in-one solution for inventory management, sales tracking, and financial insights.
            </p>
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 bg-[#E71D36] hover:bg-[#c91126] text-[#FDFFFC] px-8 py-4 rounded-full font-semibold text-lg transition-all"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80"
              alt="Kenyan Market"
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}