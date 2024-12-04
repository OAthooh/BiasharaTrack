import { useState, useEffect } from 'react';
import { AlertCircle, Search, Download } from 'lucide-react';
import { StockAlert } from '../../types/inventory';
import { formatDate } from '../../utils/formatters';
import { inventoryApi } from '../../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LowStockAlerts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'resolved' | 'unresolved'>('all');
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      console.log("fetching alerts");
      try {
        setLoading(true);
        const response = await inventoryApi.getLowStockAlerts();
        console.log("response",response);
        if (response.success && Array.isArray(response.data)) {
          console.log("response.data", response.data);
          setAlerts(response.data);
          
          response.data.forEach(alert => {
            if (!alert.resolved) {
              toast.warning(alert.alert_message);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching alerts:', error);
        toast.error('Failed to fetch stock alerts');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const filteredAlerts = Array.isArray(alerts) ? alerts.filter((alert) => {
    const matchesSearch = alert.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'resolved' ? alert.resolved : !alert.resolved);
    return matchesSearch && matchesStatus;
  }) : [];

  const handleExport = () => {
    const csv = [
      ['Product', 'Quantity', 'Threshold', 'Status', 'Created At'],
      ...filteredAlerts.map(alert => [
        alert.product_name,
        alert.current_quantity.toString(),
        alert.stock_threshold.toString(),
        alert.resolved ? 'Resolved' : 'Unresolved',
        formatDate(alert.created_at)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'low-stock-alerts.csv';
    a.click();
  };

  const handleResolve = async (alertId: number) => {
   //TODO: Implement resolve alert
  };

  return (
    <>
      <ToastContainer 
        position="top-right"
        newestOnTop
        className="mt-16"
      />
      
      <div className={`
        bg-white rounded-lg shadow p-4 md:p-6
        w-full md:w-[400px] lg:w-[500px] xl:w-[600px] 2xl:w-[700px]
        md:absolute md:right-6 md:top-26
        mt-4 md:mt-0
        max-h-[calc(100vh-120px)] overflow-y-auto
        transition-all duration-300 ease-in-out
      `}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold text-[#011627]">Low Stock Alerts</h2>
          <button
            onClick={handleExport}
            className="flex items-center text-[#2EC4B6] hover:text-[#28b0a3]"
          >
            <Download className="w-5 h-5 mr-2" />
            Export
          </button>
        </div>

        <div className="flex flex-col gap-4 mb-4">
          <div className="relative">
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

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2EC4B6]"></div>
          </div>
        ) : (
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
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex items-start flex-1 min-w-0">
                    <AlertCircle
                      className={`w-5 h-5 mr-3 flex-shrink-0 ${
                        alert.resolved ? 'text-gray-400' : 'text-[#E71D36]'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-[#011627] truncate">
                        {alert.product_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Quantity: {alert.current_quantity} / Threshold: {alert.stock_threshold}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Created: {formatDate(alert.created_at)}
                      </p>
                    </div>
                  </div>
                  {!alert.resolved && (
                    <button
                      className="text-sm text-[#2EC4B6] hover:text-[#28b0a3] whitespace-nowrap"
                      onClick={() => handleResolve(alert.id)}
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}