import { useState, useEffect } from 'react';
import { Search, Download, Eye } from 'lucide-react';
import { Sale, SalesTransaction } from '../../types/sales';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { inventoryApi } from '../../utils/api';
import { useTranslation } from 'react-i18next';

export default function SalesHistory() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sales, setSales] = useState<Sale[]>([]);
  useEffect(() => {
    const fetchSales = async () => {
      const response = await inventoryApi.fetchSalesHistory();
     
      if (response.success && Array.isArray(response.data)) {
        const salesData: Sale[] = response.data.map((transaction: SalesTransaction) => {
          console.log("transaction", transaction);
          return {
            id: transaction.id,
            product_name: transaction.product_name,
            product_id: transaction.product_id,
            quantity: transaction.quantity,
            total_amount: transaction.total_amount,
            payment_method: transaction.payment_method.toLowerCase() as "cash" | "mpesa" | "credit",
            customerName: '',
            created_at: new Date(transaction.created_at),
            updated_at: new Date(transaction.updated_at),
          };
        });
        setSales(salesData);
      } else {
        setSales([]);
        console.error('Invalid sales data received:', response);
      }
    };
    fetchSales();
  }, []);

  const filteredSales = sales.filter((sale) => {
    const matchesSearch = sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPayment = paymentFilter === 'all' || sale.payment_method === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  const handleExport = () => {
    // Add export logic here
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#011627]">{t('salesHistory.title')}</h2>
        <button
          onClick={handleExport}
          className="flex items-center text-[#2EC4B6] hover:text-[#28b0a3]"
        >
          <Download className="w-5 h-5 mr-2" />
          {t('salesHistory.export')}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('salesHistory.search.placeholder')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="all">{t('salesHistory.filters.payment.all')}</option>
          <option value="cash">{t('salesHistory.filters.payment.cash')}</option>
          <option value="mpesa">{t('salesHistory.filters.payment.mpesa')}</option>
          <option value="credit">{t('salesHistory.filters.payment.credit')}</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('salesHistory.table.productName')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('salesHistory.table.quantity')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('salesHistory.table.amount')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('salesHistory.table.payment')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('salesHistory.table.date')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('salesHistory.table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSales.map((sale) => (
              <tr key={sale.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.product_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {sale.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(sale.total_amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    sale.payment_method === 'cash'
                      ? 'bg-green-100 text-green-800'
                      : sale.payment_method === 'mpesa'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {sale.payment_method.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(sale.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    className="text-[#2EC4B6] hover:text-[#28b0a3]"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}