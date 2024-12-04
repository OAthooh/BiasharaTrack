import React, { useState } from 'react';
import { Upload, Plus, AlertCircle } from 'lucide-react';
import { ProductFormData } from '../../types/inventory';
import { categories } from '../../data/categories';
import { validateProduct } from '../../utils/validation';

export default function AddProduct() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    categoryId: '',
    price: '',
    barcode: '',
    quantity: '',
    lowStockThreshold: '',
    image: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateProduct(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Add API call here
      setSuccess('Product added successfully!');
      setFormData({
        name: '',
        description: '',
        categoryId: '',
        price: '',
        barcode: '',
        quantity: '',
        lowStockThreshold: '',
        image: null,
      });
      setErrors({});
    } catch (error) {
      setErrors({ submit: 'Failed to add product. Please try again.' });
    }
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setFormData({ ...formData, image: file });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-[#011627] mb-4">Add New Product</h2>
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
            Product Name *
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
            Description
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
            Category *
          </label>
          <select
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#011627] mb-1">
              Price (KSH) *
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
              Quantity *
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
              Barcode
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
              Low Stock Threshold *
            </label>
            <input
              type="number"
              required
              min="0"
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent ${
                errors.lowStockThreshold ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
            />
            {errors.lowStockThreshold && (
              <p className="mt-1 text-sm text-red-500">{errors.lowStockThreshold}</p>
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
            Drag and drop your product image here, or{' '}
            <label className="text-[#2EC4B6] cursor-pointer">
              browse
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.files?.[0] || null })
                }
              />
            </label>
          </p>
          {formData.image && (
            <p className="text-sm text-gray-500 mt-2">{formData.image.name}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-[#2EC4B6] text-white py-2 px-4 rounded-lg hover:bg-[#28b0a3] transition-colors flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </button>
      </form>
    </div>
  );
}