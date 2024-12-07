import { useState, useEffect } from 'react';
import { Search, MessageCircle, Eye, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { inventoryApi } from '../../utils/api';
import { useTranslation } from 'react-i18next';

interface CreditCustomer {
  id: string;
  name: string;
  phone: string;
  totalCredit: number;
  balanceDue: number;
  lastPaymentDate: string | null;
  status: 'active' | 'overdue' | 'paid';
}

export default function CustomerCreditList() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customers, setCustomers] = useState<CreditCustomer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCreditCustomers = async () => {
      try {
        setLoading(true);
        const response = await inventoryApi.fetchCreditHistory();
        console.log('Credit customers response:', response);

        if (response.success && Array.isArray(response.data)) {
          const validatedCustomers = response.data.map((customer: any) => ({
            id: customer.id || '',
            name: customer.name || '',
            phone: customer.phone || '',
            totalCredit: Number(customer.total_credit) || 0,
            balanceDue: Number(customer.balance_due) || 0,
            lastPaymentDate: customer.last_payment_date || null,
            status: customer.status || 'active'
          }));
          
          setCustomers(validatedCustomers);
        } else {
          setError(response.error || 'Failed to fetch credit customers');
        }
      } catch (err) {
        console.error('Error fetching credit customers:', err);
        setError('An error occurred while fetching credit customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCreditCustomers();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'paid':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-[#011627] mb-4">{t('credits.customerList.title')}</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('credits.customerList.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t('credits.customerList.allStatus')}</option>
            <option value="active">{t('credits.customerList.active')}</option>
            <option value="overdue">{t('credits.customerList.overdue')}</option>
            <option value="paid">{t('credits.customerList.paid')}</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('credits.customerList.tableHeaders.customer')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('credits.customerList.tableHeaders.totalCredit')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('credits.customerList.tableHeaders.balanceDue')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('credits.customerList.tableHeaders.lastPayment')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('credits.customerList.tableHeaders.status')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('credits.customerList.tableHeaders.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                  <div className="text-sm text-gray-500">{customer.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(customer.totalCredit)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(customer.balanceDue)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(customer.lastPaymentDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                    {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      className="text-[#2EC4B6] hover:text-[#28b0a3]"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      className="text-[#FF9F1C] hover:text-[#f39200]"
                      title="Record Payment"
                    >
                      <DollarSign className="w-5 h-5" />
                    </button>
                    <button
                      className="text-[#2EC4B6] hover:text-[#28b0a3]"
                      title="Send Reminder"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}