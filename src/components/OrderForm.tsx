import React, { useState } from 'react';
import { Order } from '../types/order';

interface Props {
  initialData: Partial<Order>;
  onSubmit: (data: Partial<Order>) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export default function OrderForm({ initialData, onSubmit, onCancel, isEditing }: Props) {
  const [formData, setFormData] = useState<Partial<Order>>(initialData);

  const handleChange = (field: keyof Order, value: string | number) => {
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
        <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700">
          Total Amount ($)
        </label>
        <input
          type="number"
          id="totalAmount"
          step="0.01"
          value={formData.totalAmount || ''}
          onChange={(e) => handleChange('totalAmount', parseFloat(e.target.value))}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          value={formData.status || ''}
          onChange={(e) => handleChange('status', e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div>
        <label htmlFor="orderDate" className="block text-sm font-medium text-gray-700">
          Order Date
        </label>
        <input
          type="date"
          id="orderDate"
          value={formData.orderDate || new Date().toISOString().split('T')[0]}
          onChange={(e) => handleChange('orderDate', e.target.value)}
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
          {isEditing ? 'Update Order' : 'Add Order'}
        </button>
      </div>
    </form>
  );
}
