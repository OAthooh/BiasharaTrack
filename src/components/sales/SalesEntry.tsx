import React, { useState, useEffect } from 'react';
import { Plus, Scan, AlertCircle, Loader2 } from 'lucide-react';
import { SaleFormData } from '../../types/sales';
import { Product } from '../../types/inventory';
import { formatCurrency } from '../../utils/formatters';

export default function SalesEntry() {
  const [formData, setFormData] = useState<SaleFormData>({
    products: [],
    paymentMethod: 'cash',
    customerName: '',
    customerPhone: '',
    amount: '',
    referenceNumber: '',
  });
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isProcessingMpesa, setIsProcessingMpesa] = useState(false);
  const [mpesaStatus, setMpesaStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [totalAmount, setTotalAmount] = useState(0);

  // Placeholder data - replace with actual API call
  const products: Product[] = [];

  useEffect(() => {
    const total = formData.products.reduce((sum, item) => {
      const product = products.find(p => p.id.toString() === item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
    setTotalAmount(total);
    setFormData(prev => ({ ...prev, amount: total.toString() }));
  }, [formData.products]);

  const handleAddProduct = () => {
    if (!selectedProduct || parseInt(quantity) <= 0) {
      setError('Please select a product and enter a valid quantity');
      return;
    }

    setFormData({
      ...formData,
      products: [
        ...formData.products,
        {
          productId: selectedProduct,
          quantity: parseInt(quantity),
        },
      ],
    });
    setSelectedProduct('');
    setQuantity('1');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.products.length === 0) {
      setError('Please add at least one product');
      return;
    }

    try {
      // Add API call here
      setSuccess('Sale recorded successfully!');
      setFormData({
        products: [],
        paymentMethod: 'cash',
        customerName: '',
        customerPhone: '',
        amount: '',
        referenceNumber: '',
      });
    } catch (error) {
      setError('Failed to record sale. Please try again.');
    }
  };

  const handleMpesaPayment = async () => {
    if (!formData.customerPhone || !formData.amount) {
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
          amount: parseFloat(formData.amount),
          reference: `INV-${Date.now()}`,
          description: `Payment for ${formData.products.length} items`
        })
      });

      const data = await response.json();
      console.log('M-PESA Response:', data); // Add this for debugging

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

  const renderPaymentFields = () => {
    if (formData.paymentMethod === 'mpesa') {
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
                value={formData.customerPhone || ''}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
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
                value={formatCurrency(totalAmount)}
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
    }
    
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-[#011627] mb-4">Record New Sale</h2>
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

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#011627] mb-1">
              Product
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - {formatCurrency(product.price)}
                </option>
              ))}
            </select>
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-[#011627] mb-1">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAddProduct}
              className="p-2 bg-[#2EC4B6] text-white rounded-lg hover:bg-[#28b0a3] transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            className="flex items-center gap-2 text-[#2EC4B6] hover:text-[#28b0a3]"
          >
            <Scan className="w-5 h-5" />
            Scan Barcode
          </button>
        </div>

        {formData.products.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {formData.products.map((item, index) => {
                  const product = products.find((p) => p.id.toString() === item.productId);
                  return (
                    <tr key={index}>
                      <td className="px-4 py-2">{product?.name}</td>
                      <td className="px-4 py-2">{item.quantity}</td>
                      <td className="px-4 py-2 text-right">
                        {formatCurrency((product?.price || 0) * item.quantity)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#011627] mb-1">
              Payment Method
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as 'cash' | 'mpesa' | 'credit' })}
            >
              <option value="cash">Cash</option>
              <option value="mpesa">M-PESA</option>
              <option value="credit">Credit</option>
            </select>
          </div>
        </div>

        {renderPaymentFields()}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#011627] mb-1">
              Customer Name (Optional)
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#011627] mb-1">
              Customer Phone (Optional)
            </label>
            <input
              type="tel"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-[#011627] mb-1">
              Reference Number 
            </label>
            <input
              type="tel"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
              value={formData.referenceNumber}
              onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#E71D36] text-white py-2 px-4 rounded-lg hover:bg-[#c91126] transition-colors flex items-center justify-center"
        >
          Complete Sale
        </button>
      </form>
    </div>
  );
}