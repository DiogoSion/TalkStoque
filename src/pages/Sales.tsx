import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Sale } from '../types/sale';
import SaleForm from '../components/SaleForm';
import ModalWrapper from '../components/ModalWrapper';
import ConfirmModal from '../components/ConfirmModal';
import AddButton from '../components/AddButton';
import TableWrapper from '../components/TableWrapper';
import ActionButtons from '../components/ActionButtons';

const sampleSales: Sale[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    customerName: 'Cafe Express',
    products: 'Cola Classic (24), Natural Spring Water (48)',
    amount: 89.76,
    paymentMethod: 'Credit Card',
    saleDate: '2024-03-15',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    customerName: 'Downtown Deli',
    products: 'Energy Drink (36), Sparkling Water (24)',
    amount: 156.84,
    paymentMethod: 'Bank Transfer',
    saleDate: '2024-03-14',
  },
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
        invoiceNumber: `INV-2024-${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, '0')}`,
        customerName: data.customerName || '',
        products: data.products || '',
        amount: data.amount || 0,
        paymentMethod: data.paymentMethod || '',
        saleDate: data.saleDate || new Date().toISOString().split('T')[0],
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
        <AddButton
          label="Sale"
          onClick={() => {
            setEditingSale(null);
            setIsModalOpen(true);
          }}
        />
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <TableWrapper columns={['Invoice #', 'Customer', 'Products', 'Amount', 'Payment', 'Date', 'Actions']}>
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
                  <ActionButtons
                    onEdit={() => {
                    setEditingSale(sale);
                    setIsModalOpen(true);
                  }}
                    onDelete={() => setSaleToDelete(sale)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </TableWrapper>

      </div>

      {isModalOpen && (
        <ModalWrapper
          title={editingSale ? 'Edit Sale' : 'Add New Sale'}
          onClose={handleCancel}
        >
          <SaleForm
            initialData={editingSale || {}}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEditing={!!editingSale}
          />
        </ModalWrapper>
      )}

      {saleToDelete && (
        <ConfirmModal
          title="Confirm Deletion"
          message={`Are you sure you want to delete ${saleToDelete.invoiceNumber}?`}
          onCancel={() => setSaleToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
