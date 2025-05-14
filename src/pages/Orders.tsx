import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Order } from '../types/order';
import OrderForm from '../components/OrderForm';
import ModalWrapper from '../components/ModalWrapper';
import ConfirmModal from '../components/ConfirmModal';

const sampleOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customerName: 'Cafe Express',
    products: 'Cola Classic (24), Natural Spring Water (48)',
    totalAmount: 89.76,
    status: 'Pending',
    orderDate: '2024-03-15'
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customerName: 'Downtown Deli',
    products: 'Energy Drink (36), Sparkling Water (24)',
    totalAmount: 156.84,
    status: 'Delivered',
    orderDate: '2024-03-14'
  }
];

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>(sampleOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const handleSubmit = (data: Partial<Order>) => {
    if (editingOrder) {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === editingOrder.id ? { ...editingOrder, ...data } as Order : order
        )
      );
    } else {
      const newOrder: Order = {
        id: Date.now().toString(),
        orderNumber: `ORD-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        customerName: data.customerName || '',
        products: data.products || '',
        totalAmount: data.totalAmount || 0,
        status: data.status || 'Pending',
        orderDate: data.orderDate || new Date().toISOString().split('T')[0]
      };
      setOrders([...orders, newOrder]);
    }
    setEditingOrder(null);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setEditingOrder(null);
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (orderToDelete) {
      setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
      setOrderToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Order
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3">Order #</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Products</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4">{order.orderNumber}</td>
                <td className="px-6 py-4">{order.customerName}</td>
                <td className="px-6 py-4">{order.products}</td>
                <td className="px-6 py-4">${order.totalAmount.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                    order.status === 'Delivered'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">{order.orderDate}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => {
                        setEditingOrder(order);
                        setIsModalOpen(true);
                      }}
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => setOrderToDelete(order)}
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
        <ModalWrapper
          title={editingOrder ? 'Edit Order' : 'Add New Order'}
          onClose={handleCancel}
        >
          <OrderForm
            initialData={editingOrder || {}}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEditing={!!editingOrder}
          />
        </ModalWrapper>
      )}

      {orderToDelete && (
        <ConfirmModal
          title="Confirm Deletion"
          message={`Are you sure you want to delete ${orderToDelete.orderNumber}?`}
          onCancel={() => setOrderToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
      
    </div>
  );
}
