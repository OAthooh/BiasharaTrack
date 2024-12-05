import React, { useState } from 'react';
import { Upload, Plus, AlertCircle } from 'lucide-react';
import { ProductFormData } from '../../types/inventory';
import { categories } from '../../data/categories';
import { inventoryApi } from '../../utils/api';
import { useTranslation } from 'react-i18next';

export default function AddProduct() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category: '',
    price: '',
    barcode: '',
    quantity: '',
    low_stock_threshold: '',
    photo_path: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitize numeric values
    const price = parseFloat(formData.price.replace(/[^0-9.]/g, ''));
    const quantity = parseInt(formData.quantity.replace(/[^0-9]/g, ''), 10);
    
    // Create FormData object
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('price', price.toString());
    formDataToSend.append('barcode', formData.barcode);
    formDataToSend.append('quantity', quantity.toString());
    formDataToSend.append('low_stock_threshold', formData.low_stock_threshold);
    
    if (formData.photo_path) {
      formDataToSend.append('image', formData.photo_path);
    }

    // Validate numbers
    if (isNaN(price) || isNaN(quantity)) {
        setErrors({
            ...errors,
            price: isNaN(price) ? 'Invalid price format' : '',
            quantity: isNaN(quantity) ? 'Invalid quantity format' : ''
        });
        return;
    }
    console.log(formData);
    try {
        const response = await inventoryApi.createProduct({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            price: price,
            barcode: formData.barcode,
            quantity: quantity,
            image: formData.photo_path,
            low_stock_threshold: formData.low_stock_threshold
        });
        
        if (!response.success) {
            throw new Error(response.error);
        }

        setSuccess(t('inventory.addProduct.success'));
        setFormData({
            name: '',
            description: '',
            category: '',
            price: '',
            barcode: '',
            quantity: '',
            low_stock_threshold: '',
            photo_path: null,
        });
        setErrors({});
    } catch (error) {
        setErrors({ submit: error instanceof Error ? error.message : t('inventory.addProduct.title') });
    }
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setFormData({ ...formData, photo_path: file });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-[#011627] mb-4">{t('inventory.addProduct.title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {errors.submit}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-500 p-3 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#011627] mb-1">
          {t('inventory.addProduct.productName')} *
          </label>
          <input
            type="text"
            required
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#011627] mb-1">
          {t('inventory.addProduct.description')}
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#011627] mb-1">
          {t('inventory.addProduct.category')} *
          </label>
          <select
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="">{t('inventory.addProduct.selectCategory')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#011627] mb-1">
            {t('inventory.addProduct.price')} *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-500">{errors.price}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#011627] mb-1">
            {t('inventory.addProduct.quantity')} *
            </label>
            <input
              type="number"
              required
              min="0"
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent ${
                errors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#011627] mb-1">
            {t('inventory.addProduct.barcode')}
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#011627] mb-1">
            {t('inventory.addProduct.lowStockThreshold')} *
            </label>
            <input
              type="number"
              required
              min="0"
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent ${
                errors.low_stock_threshold ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.low_stock_threshold}
              onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
            />
            {errors.low_stock_threshold && (
              <p className="mt-1 text-sm text-red-500">{errors.low_stock_threshold}</p>
            )}
          </div>
        </div>

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleImageDrop}
        >
          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">
          {t('inventory.addProduct.uploadImage')}{' '}
            <label className="text-[#2EC4B6] cursor-pointer">
            {t('inventory.addProduct.browse')}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) =>
                  setFormData({ ...formData, photo_path: e.target.files?.[0] || null })
                }
              />
            </label>
          </p>
          {formData.photo_path && (
            <p className="text-sm text-gray-500 mt-2">{formData.photo_path.name}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-[#2EC4B6] text-white py-2 px-4 rounded-lg hover:bg-[#28b0a3] transition-colors flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('inventory.addProduct.addButton')}
        </button>
      </form>
    </div>
  );
}