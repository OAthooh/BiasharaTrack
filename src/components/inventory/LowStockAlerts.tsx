import React, { useState } from 'react';
import { AlertCircle, Search, Download } from 'lucide-react';
import { StockAlert } from '../../types/inventory';
import { formatDate } from '../../utils/formatters';

export default function LowStockAlerts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'resolved' | 'unresolved'>('all');
  
  // Placeholder data - replace with actual API call
  const alerts: StockAlert[] = [];

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = alert.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'resolved' ? alert.resolved : !alert.resolved);
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    // Add export logic here
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#011627]">Low Stock Alerts</h2>
        <button
          onClick={handleExport}
          className="flex items-center text-[#2EC4B6] hover:text-[#28b0a3]"
        >
          <Download className="w-5 h-5 mr-2" />
          Export
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search alerts..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'resolved' | 'unresolved')}
        >
          <option value="all">All Status</option>
          <option value="resolved">Resolved</option>
          <option value="unresolved">Unresolved</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border ${
              alert.resolved
                ? 'border-gray-200 bg-gray-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <AlertCircle
                  className={`w-5 h-5 mr-3 ${
                    alert.resolved ? 'text-gray-400' : 'text-[#E71D36]'
                  }`}
                />
                <div>
                  <h3 className="text-sm font-medium text-[#011627]">
                    {alert.productName}
                  </h3>
                  <p className="text-sm text-gray-500">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Created: {formatDate(alert.createdAt)}
                  </p>
                </div>
              </div>
              {!alert.resolved && (
                <button
                  className="text-sm text-[#2EC4B6] hover:text-[#28b0a3]"
                  onClick={() => {
                    // Add resolve logic here
                  }}
                >
                  Resolve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}