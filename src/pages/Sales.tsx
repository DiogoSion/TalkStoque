import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Sale } from '../types/sale';
import SaleForm from '../components/SaleForm';

const sampleSales: Sale[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    customerName: 'Cafe Express',
    products: 'Cola Classic (24), Natural Spring Water (48)',
    amount: 89.76,
    paymentMethod: 'Credit Card',
    saleDate: '2024-03-15'
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    customerName: 'Downtown Deli',
    products: 'Energy Drink (36), Sparkling Water (24)',
    amount: 156.84,
    paymentMethod: 'Bank Transfer',
    saleDate: '2024-03-14'
  }
];

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>(sampleSales);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);

  const handleSubmit = (data: Partial<Sale>) => {
    if (editingSale) {
      setSales((prev) =>
        prev.map((sale) =>
          sale.id === editingSale.id ? { ...editingSale, ...data } as Sale : sale
        )
      );
    } else {
      const newSale: Sale = {
        id: Date.now().toString(),
        invoiceNumber: `INV-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        customerName: data.customerName || '',
        products: data.products || '',
        amount: data.amount || 0,
        paymentMethod: data.paymentMethod || '',
        saleDate: data.saleDate || new Date().toISOString().split('T')[0]
      };
      setSales([...sales, newSale]);
    }
    setIsModalOpen(false);
    setEditingSale(null);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingSale(null);
  };

  const confirmDelete = () => {
    if (saleToDelete) {
      setSales((prev) => prev.filter((s) => s.id !== saleToDelete.id));
      setSaleToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Sales Management</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Sale
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3">Invoice #</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Products</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Payment</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td className="px-6 py-4">{sale.invoiceNumber}</td>
                <td className="px-6 py-4">{sale.customerName}</td>
                <td className="px-6 py-4">{sale.products}</td>
                <td className="px-6 py-4">${sale.amount.toFixed(2)}</td>
                <td className="px-6 py-4">{sale.paymentMethod}</td>
                <td className="px-6 py-4">{sale.saleDate}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => {
                        setEditingSale(sale);
                        setIsModalOpen(true);
                      }}
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => setSaleToDelete(sale)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingSale ? 'Edit Sale' : 'Add New Sale'}
            </h3>
            <SaleForm
              initialData={editingSale || {}}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isEditing={!!editingSale}
            />
          </div>
        </div>
      )}

      {saleToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete <strong>{saleToDelete.invoiceNumber}</strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSaleToDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
