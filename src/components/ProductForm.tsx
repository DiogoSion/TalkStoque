import React, { useState, useEffect } from 'react';
import { Product } from '../types/product';

interface ProductFormProps {
  initialData: Partial<Product>;
  onSubmit: (product: Partial<Product>) => void;
  onCancel: () => void;
  // isEditing?: boolean; // Pode ser útil se você quiser lógica específica
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Product>>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (
    field: keyof Product,
    value: string | number | null
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Product Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      {/* Campo Descrição*/}
      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="descricao"
          rows={3}
          value={formData.descricao || ''}
          onChange={(e) => handleChange('descricao', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category"
          value={formData.category || ''}
          onChange={(e) => handleChange('category', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          <option value="">Select a category</option>
          <option value="Soft Drinks">Soft Drinks</option>
          <option value="Water">Water</option>
          <option value="Energy Drinks">Energy Drinks</option>
          <option value="Juices">Juices</option>
        </select>
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price ($)
        </label>
        <input
          type="number"
          id="price"
          step="0.01"
          value={formData.price === undefined ? '' : formData.price} // Lidar com valor inicial undefined
          onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
          Stock Amount
        </label>
        <input
          type="number"
          id="stock"
          value={formData.stock === undefined ? '' : formData.stock} // Lidar com valor inicial undefined
          onChange={(e) => handleChange('stock', parseInt(e.target.value, 10) || 0)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          {initialData.id ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;