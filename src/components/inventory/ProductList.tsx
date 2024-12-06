import { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Eye } from 'lucide-react';
import { Product } from '../../types/inventory';
import { categories } from '../../data/categories';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { inventoryApi } from '../../utils/api';
import { useTranslation } from 'react-i18next';

export default function ProductList() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      console.log("fetching products");
      try {
        const response = await inventoryApi.getAllProducts();
        console.log("response", response);
        if (response.success) {
          if (!response.data || response.data.length === 0) {
            setProducts([]);
            setLoading(false);
            return;
          }
          const formattedProducts = response.data.map(item => ({
            ...item.product,
            quantity: item.quantity,
            created_at: new Date(item.product.created_at),
            updated_at: new Date(item.product.updated_at)
          }));
          setProducts(formattedProducts);
        } else {
          setError(response.error || 'Failed to fetch products');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred while fetching products');
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    if (!product || !product.name) return false;

    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    const matchesStock = !stockFilter || (
      stockFilter === 'low' ? product.quantity <= product.low_stock_threshold :
      stockFilter === 'out' ? product.quantity === 0 :
      stockFilter === 'in' ? product.quantity > product.low_stock_threshold :
      true
    );
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  if (loading) {
    return <div className="bg-white rounded-lg shadow p-6">Loading products...</div>;
  }

  if (error) {
    return <div className="bg-white rounded-lg shadow p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-[#011627] mb-4">{t('inventory.productList.title')}</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('inventory.productList.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">{t('inventory.productList.allCategories')}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="">{t('inventory.productList.stockFilter.all')}</option>
              <option value="low">{t('inventory.productList.stockFilter.low')}</option>
              <option value="out">{t('inventory.productList.stockFilter.out')}</option>
              <option value="in">{t('inventory.productList.stockFilter.in')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('inventory.productList.tableHeaders.product')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('inventory.productList.tableHeaders.category')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('inventory.productList.tableHeaders.quantity')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('inventory.productList.tableHeaders.price')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('inventory.productList.tableHeaders.lastUpdated')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('inventory.productList.tableHeaders.actions')}
              </th>
            </tr>
          </thead>
          {products.length > 0 && (
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className={
                    product.quantity === 0
                      ? 'bg-red-50'
                      : product.quantity <= product.low_stock_threshold
                      ? 'bg-yellow-50'
                      : ''
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={product.photo_path ? `http://localhost:8080${product.photo_path}` : 'http://localhost:8080/uploads/products/1733344473993716042_github-profile.png'}
                          alt={product.name}
                          onError={(e) => {
                            console.log('Image failed to load:', product.photo_path);
                            (e.target as HTMLImageElement).src = 'http://localhost:8080/uploads/products/1733344473993716042_github-profile.png';
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">{product.barcode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.quantity}</div>
                    <div className="text-xs text-gray-500">
                    {t('inventory.productList.minimum')}: {product.low_stock_threshold}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(product.updated_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        className="text-[#2EC4B6] hover:text-[#28b0a3]"
                        title={t('inventory.productList.actions.view')}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        className="text-[#FF9F1C] hover:text-[#f39200]"
                        title={t('inventory.productList.actions.title')}
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        className="text-[#E71D36] hover:text-[#c91126]"
                        title={t('inventory.productList.actions.delete')}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}