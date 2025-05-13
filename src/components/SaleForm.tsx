import React, { useState } from 'react';
import { Sale } from '../types/sale';

interface Props {
  initialData: Partial<Sale>;
  onSubmit: (data: Partial<Sale>) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export default function SaleForm({ initialData, onSubmit, onCancel, isEditing }: Props) {
  const [formData, setFormData] = useState<Partial<Sale>>(initialData);

  const handleChange = (field: keyof Sale, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
          Customer Name
        </label>
        <input
          type="text"
          id="customerName"
          value={formData.customerName || ''}
          onChange={(e) => handleChange('customerName', e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="products" className="block text-sm font-medium text-gray-700">
          Products
        </label>
        <textarea
          id="products"
          value={formData.products || ''}
          onChange={(e) => handleChange('products', e.target.value)}
          rows={3}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Amount ($)
        </label>
        <input
          type="number"
          id="amount"
          step="0.01"
          value={formData.amount || ''}
          onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
          Payment Method
        </label>
        <select
          id="paymentMethod"
          value={formData.paymentMethod || ''}
          onChange={(e) => handleChange('paymentMethod', e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select payment method</option>
          <option value="Cash">Cash</option>
          <option value="Credit Card">Credit Card</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Check">Check</option>
        </select>
      </div>

      <div>
        <label htmlFor="saleDate" className="block text-sm font-medium text-gray-700">
          Sale Date
        </label>
        <input
          type="date"
          id="saleDate"
          value={formData.saleDate || new Date().toISOString().split('T')[0]}
          onChange={(e) => handleChange('saleDate', e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          {isEditing ? 'Update Sale' : 'Add Sale'}
        </button>
      </div>
    </form>
  );
}
