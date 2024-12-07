import { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Trash2, AlertCircle, Search, Loader2 } from 'lucide-react';
import { SaleFormData } from '../../types/sales';
import { Product } from '../../types/inventory';
import { formatCurrency } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';
import { inventoryApi } from '../../utils/api';
import { useTranslation } from 'react-i18next';
// import { motion } from "framer-motion"

export default function SalesEntry() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<SaleFormData>({
    products: [],
    paymentMethod: 'cash',
    customerName: '',
    customerPhone: '',
    referenceNumber: '',
    amount: 0,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [cartTotal, setCartTotal] = useState(0);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isProcessingMpesa, setIsProcessingMpesa] = useState(false);
  const [mpesaStatus, setMpesaStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');

  useEffect(() => {
    const searchProducts = async () => {
      if (!debouncedSearch) {
        return;
      }

      setIsSearching(true);
      try {
        const response = await inventoryApi.searchProducts(debouncedSearch);
        console.log('Search response:', response);
        if (!response.success) {
          setError('Failed to search products');
        } else {
          setSearchResults(response.data || []);
        }
      } catch (error) {
        console.error('Failed to search products:', error);
      } finally {
        setIsSearching(false);
      }
    };

    searchProducts();
  }, [debouncedSearch]);

  const handleProductSelect = (product: Product, quantity: number = 1) => {
    if (!product.id) {
      setError('Invalid product selected');
      return;
    }

    const existingProduct = formData.products.find(
      (p) => p.productId === product.id
    );

    if (existingProduct) {
      handleQuantityChange(product.id, existingProduct.quantity + quantity);
    } else {
      setFormData(prev => ({
        ...prev,
        products: [
          ...prev.products,
          {
            productId: product.id,
            quantity,
            amount: product.price * quantity,
          },
        ],
      }));
      setSelectedProducts(prev => [...prev, product]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    const product = selectedProducts.find(p => p.id === productId);

    if (product && newQuantity > product.quantity) {
      setError(`Only ${product.quantity} units available in stock`);
      return;
    }

    if (newQuantity < 1) return;

    const updatedProducts = formData.products.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity, amount: product ? product.price * newQuantity : item.amount }
        : item
    );

    setFormData(prev => ({
      ...prev,
      products: updatedProducts
    }));

    const newTotal = updatedProducts.reduce((sum, item) => {
      const prod = selectedProducts.find(p => p.id === item.productId);
      if (prod) {
        return sum + (prod.price * item.quantity);
      }
      return sum;
    }, 0);
    
    setCartTotal(newTotal);
  };

  const handleRemoveItem = (productId: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(item => item.productId !== productId),
    }));
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  useEffect(() => {
    const newTotal = formData.products.reduce((sum, item) => {
      const product = selectedProducts.find(p => p.id === item.productId);
      if (product) {
        return sum + (product.price * item.quantity);
      }
      return sum;
    }, 0);
    setCartTotal(newTotal);
  }, [formData.products, selectedProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.products.length === 0) {
      setError('Please add at least one product');
      return;
    }

    try {
      const saleData = {
        ...formData,
        payment_method: formData.paymentMethod,
        products: formData.products.map(product => ({
          ...product,
          product_id: product.productId,
        })),
      };

      console.log('Submitting sale data:', saleData);
      const response = await inventoryApi.recordSale(saleData);
      if (response.success) {
        setSuccess(t('salesEntry.messages.success'));
        setFormData({
          products: [],
          paymentMethod: 'cash',
          customerName: '',
          customerPhone: '',
          referenceNumber: '',
          amount: 0,
        });
        setSelectedProducts([]);
        setCartTotal(0);
      } else {
        setError(t('salesEntry.messages.error'));
      }
    } catch (error) {
      setError(t('salesEntry.messages.error'));
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
      }
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMpesaPayment = async () => {
    setError(null);

    if (!formData.customerPhone || !cartTotal) {
      setError('Phone number and amount are required for M-PESA payments');
      return;
    }

    const phoneRegex = /^(?:254|\+254|0)?(7\d{8})$/;
    if (!phoneRegex.test(formData.customerPhone)) {
      setError('Please enter a valid Kenyan phone number');
      return;
    }

    setIsProcessingMpesa(true);
    setMpesaStatus('pending');

    try {
      const formattedPhone = formData.customerPhone.startsWith('254') 
        ? formData.customerPhone 
        : `254${formData.customerPhone.replace(/^0|^\+254|^254/, '')}`;

      const response = await fetch('http://localhost:8080/api/mpesa/initiate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: formattedPhone,
          amount: cartTotal,
          reference: `INV-${Date.now()}`,
          description: `Payment for ${formData.products.length} items
`        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to initiate payment');
      }

      setMpesaStatus('success');
      setFormData(prev => ({ 
        ...prev, 
        referenceNumber: data.data?.CheckoutRequestID || data.data?.MerchantRequestID || 'PENDING'
      }));
      setSuccess('M-PESA payment initiated. Please check your phone to complete the payment.');
    } catch (error) {
      console.error('M-PESA payment error:', error);
      setMpesaStatus('failed');
      setError(error instanceof Error ? error.message : 'Failed to initiate M-PESA payment');
    } finally {
      setIsProcessingMpesa(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    if (error?.includes('phone number') || error?.includes('Phone number')) {
      setError(null);
    }
    setFormData(prev => ({ ...prev, customerPhone: value }));
  };

  const renderPaymentFields = () => {
    switch (formData.paymentMethod) {
      case 'mpesa':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#011627] mb-1">
                  M-PESA Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="254XXXXXXXXX"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent ${
                    !formData.customerPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.customerPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                />
                {!formData.customerPhone && (
                  <p className="mt-1 text-sm text-red-500">Phone number is required</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#011627] mb-1">
                  Amount (KES)
                </label>
                <input
                  type="text"
                  readOnly
                  className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg"
                  value={formatCurrency(cartTotal)}
                />
              </div>
            </div>
            
            <button
              type="button"
              disabled={isProcessingMpesa || mpesaStatus === 'success' || !formData.customerPhone}
              onClick={handleMpesaPayment}
              className="w-full bg-[#2EC4B6] text-white py-2 px-4 rounded-lg hover:bg-[#28b0a3] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessingMpesa ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing M-PESA...
                </>
              ) : mpesaStatus === 'success' ? (
                'Payment Initiated ✓'
              ) : (
                'Initiate M-PESA Payment'
              )}
            </button>

            {mpesaStatus === 'success' && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700">
                  Please check your phone to complete the M-PESA payment. Once completed, click "Complete Sale" below.
                </p>
              </div>
            )}
          </div>
        );

      case 'credit':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#011627] mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#011627] mb-1">
                  Customer Phone *
                </label>
                <input
                  type="tel"
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
                  value={formData.customerPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#011627] mb-1">
                  Total Amount
                </label>
                <input
                  type="text"
                  readOnly
                  className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg"
                  value={formatCurrency(cartTotal)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#011627] mb-1">
                  Amount Paid *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max={cartTotal}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
                  value={formData.amount || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (value > cartTotal) {
                      setError('Amount paid cannot exceed total amount');
                      return;
                    }
                    setFormData(prev => ({ ...prev, amount: value }));
                    setError(null);
                  }}
                />
              </div>
            </div>

            {formData.amount !== undefined && formData.amount < cartTotal && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-700">
                  Remaining Balance: {formatCurrency(cartTotal - formData.amount)}
                </p>
              </div>
            )}
          </div>
        );

      case 'cash':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#011627] mb-1">
              {t('salesEntry.payment.amount')}
              </label>
              <input
                type="text"
                readOnly
                className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg"
                value={formatCurrency(cartTotal)}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-sm text-gray-500 mb-4">
        <span className="font-medium">{t('salesEntry.shortcuts.title')}</span>
        <span className="ml-2">Ctrl+F: {t('salesEntry.shortcuts.focusSearch')}</span>
        <span className="ml-2">Ctrl+B: {t('salesEntry.shortcuts.barcodeMode')}</span>
      </div>
      <h2 className="text-xl font-semibold text-[#011627] mb-4">{t('salesEntry.title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-500 p-3 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {success}
          </div>
        )}

        <div className="relative">
          <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#2EC4B6] focus-within:border-transparent">
            <Search className="w-5 h-5 text-gray-400 ml-3" />
            <input
              type="text"
              className="w-full p-2 border-none focus:ring-0"
              placeholder={t('salesEntry.search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isSearching && <div className="text-gray-500">{t('salesEntry.search.searching')}</div>}
          {searchResults.length > 0 && (
            <div
              ref={searchResultsRef}
              className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto"
              style={{ maxHeight: '200px' }}
            >
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                      {product.photo_path && (
                        <img 
                          src={product.photo_path} 
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">{t('salesEntry.product.category')}: {product.category}</div>
                        <div className="text-sm text-gray-500">{t('salesEntry.product.barcode')}: {product.barcode}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">{formatCurrency(product.price)}</div>
                      {product.quantity !== undefined && (
                        <div className="text-sm text-gray-500">{t('salesEntry.product.stock')}: {product.quantity}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {formData.products.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('salesEntry.table.product')}</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">{t('salesEntry.table.quantity')}</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('salesEntry.table.price')}</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('salesEntry.table.subtotal')}</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">{t('salesEntry.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {formData.products.map((item) => {
                  const product = selectedProducts.find((p) => p.id === item.productId);
                  return (
                    <tr key={item.productId}>
                      <td className="px-4 py-2">{product?.name}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right">{formatCurrency(product?.price || 0)}</td>
                      <td className="px-4 py-2 text-right">
                        {formatCurrency((product?.price || 0) * item.quantity)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.productId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={3} className="px-4 py-2 text-right">{t('salesEntry.table.total')}:</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(cartTotal)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#011627] mb-1">
            {t('salesEntry.payment.method')}
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
              value={formData.paymentMethod}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as 'cash' | 'mpesa' | 'credit' }))}
            >
              <option value="cash">{t('salesEntry.payment.methods.cash')}</option>
              <option value="mpesa">{t('salesEntry.payment.methods.mpesa')}</option>
              <option value="credit">{t('salesEntry.payment.methods.credit')}</option>
            </select>
          </div>

          {formData.paymentMethod === 'mpesa' && (
            <div>
              <label className="block text-sm font-medium text-[#011627] mb-1">
              {t('salesEntry.payment.mpesaRef')}
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                required
              />
            </div>
          )}
        </div>

        {renderPaymentFields()}
        {formData.paymentMethod === 'credit' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#011627] mb-1">
              {t('salesEntry.customer.name')}
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#011627] mb-1">
              {t('salesEntry.customer.phone')}
              </label>
              <input
                type="tel"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                required
              />
            </div>
          </div>
        )}

        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#011627] mb-1">
              Amount (Kshs)
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>
        </div> */}

        <button
          type="submit"
          className="w-full bg-[#E71D36] text-white py-2 px-4 rounded-lg hover:bg-[#c91126] transition-colors flex items-center justify-center"
        >
          {t('salesEntry.buttons.completeSale')}
        </button>
      </form>
    </div>
  );
}