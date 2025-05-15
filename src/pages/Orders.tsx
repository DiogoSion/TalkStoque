import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Order } from '../types/order';
import OrderForm from '../components/OrderForm';
import ModalWrapper from '../components/ModalWrapper';
import ConfirmModal from '../components/ConfirmModal';
import AddButton from '../components/AddButton';
import TableWrapper from '../components/TableWrapper';
import ActionButtons from '../components/ActionButtons';

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
        <AddButton
          label="Order"
          onClick={() => {
            setEditingOrder(null);
            setIsModalOpen(true);
          }}
        />
      </div>

      <TableWrapper columns={["Order #", "Customer", "Products", "Total", "Status", "Date", "Actions"]}>
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
                <ActionButtons
                onEdit={() => {
                  setEditingOrder(order);
                  setIsModalOpen(true);
                }}
                onDelete={() => setOrderToDelete(order)}
                />                
              </div>
            </td>
          </tr>
        ))}
      </TableWrapper>

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
