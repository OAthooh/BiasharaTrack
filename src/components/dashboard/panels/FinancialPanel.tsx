import React from 'react';
import { DollarSign, ArrowUpRight } from 'lucide-react';

export default function FinancialPanel() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#011627]">Financial Overview</h2>
        <DollarSign className="h-6 w-6 text-[#2EC4B6]" />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Net Profit</span>
          <span className="text-lg font-medium">KSH 158,000</span>
        </div>
        <div className="flex items-center text-[#2EC4B6]">
          <ArrowUpRight className="h-5 w-5 mr-2" />
          <span className="text-sm">8% increase this month</span>
        </div>
        <button className="w-full bg-[#2EC4B6] text-white py-2 rounded-lg hover:bg-[#28b0a3] transition-colors">
          View Reports
        </button>
      </div>
    </div>
  );
}