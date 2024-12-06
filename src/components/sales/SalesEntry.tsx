import { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, Scan, AlertCircle, Search } from 'lucide-react';
import { SaleFormData } from '../../types/sales';
import { Product } from '../../types/inventory';
import { formatCurrency } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';



// interface ProductSearchResult extends Product {
//   matchType: 'name' | 'sku' | 'barcode';
// }

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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const debouncedSearch = useDebounce(searchQuery, 300);
  // Add new state for cart total
  const [cartTotal, setCartTotal] = useState(0);

  // Placeholder data - replace with actual API call
  const products: Product[] = [];

  useEffect(() => {
    const searchProducts = async () => {
      if (!debouncedSearch) {
        return;
      }

      setIsSearching(true);
      try {
        // Replace with actual API call
        const response = await fetch(`/api/products/search?q=${debouncedSearch}`);
        const results = await response.json();
        setSearchResults(results);
      } catch (error) {
        console.error('Failed to search products:', error);
      } finally {
        setIsSearching(false);
      }
    };

    searchProducts();
  }, [debouncedSearch]);

  // Enhanced product selection handler
  const handleProductSelect = (product: Product, quantity: number = 1) => {
    const existingProduct = formData.products.find(
      (p) => p.productId === product.id.toString()
    );

    if (existingProduct) {
      handleQuantityChange(product.id.toString(), existingProduct.quantity + quantity);
    } else {
      setFormData({
        ...formData,
        products: [
          ...formData.products,
          {
            productId: product.id.toString(),
            quantity,
          },
        ],
      });
    }
    setSearchQuery('');
  };

   // New quantity adjustment handler
   const handleQuantityChange = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id.toString() === productId);
    
    if (product && newQuantity > product.quantity) {
      setError(`Only ${product.quantity} units available in stock`);
      return;
    }

    setFormData({
      ...formData,
      products: formData.products.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      ),
    });
    updateCartTotal();
  };

  // New remove item handler
  const handleRemoveItem = (productId: string) => {
    setFormData({
      ...formData,
      products: formData.products.filter(item => item.productId !== productId),
    });
    updateCartTotal();
  };

  // Calculate cart total
  const updateCartTotal = () => {
    const total = formData.products.reduce((sum, item) => {
      const product = products.find(p => p.id.toString() === item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
    setCartTotal(total);
  };

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

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        // Toggle barcode scanner mode
      }
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-sm text-gray-500 mb-4">
        <span className="font-medium">Keyboard shortcuts:</span>
        <span className="ml-2">Ctrl+F: Focus search</span>
        <span className="ml-2">Ctrl+B: Barcode mode</span>
      </div>
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

        {/* Product Search Section */}
        <div className="relative">
          <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#2EC4B6] focus-within:border-transparent">
            <Search className="w-5 h-5 text-gray-400 ml-3" />
            <input
              type="text"
              className="w-full p-2 border-none focus:ring-0"
              placeholder="Search by product name, SKU, or barcode"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Search Results Dropdown */}
          {isSearching && <div className="text-gray-500">Searching...</div>}
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((product) => (
                <div 
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">{formatCurrency(product.price)}</div>
                      <div className="text-sm text-gray-500">Stock: {product.quantity}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Product Details */}
        {selectedProduct && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#011627] mb-1">
                  Quantity (Available: {products.find(p => p.id.toString() === selectedProduct)?.quantity})
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
                  value={quantity}
                  onChange={(e) => {
                    const newQuantity = parseInt(e.target.value);
                    const product = products.find(p => p.id.toString() === selectedProduct);
                    if (product && newQuantity > product.quantity) {
                      setError(`Only ${product.quantity} units available in stock`);
                    } else {
                      setError(null);
                      setQuantity(e.target.value);
                    }
                  }}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="p-2 bg-[#2EC4B6] text-white rounded-lg hover:bg-[#28b0a3] transition-colors"
                  disabled={!!error}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

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
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {formData.products.map((item) => {
                  const product = products.find((p) => p.id.toString() === item.productId);
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
                  <td colSpan={3} className="px-4 py-2 text-right">Total:</td>
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

          {/* Conditional Fields Based on Payment Method */}
          {formData.paymentMethod === 'mpesa' && (
            <div>
              <label className="block text-sm font-medium text-[#011627] mb-1">
                M-PESA Transaction Reference
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

        {/* Customer Details (Required for Credit) */}
        {formData.paymentMethod === 'credit' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#011627] mb-1">
                Customer Name
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
                Customer Phone
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