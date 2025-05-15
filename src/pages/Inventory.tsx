import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import ProductForm from '../components/ProductForm';
import { Product } from '../types/product';
import ModalWrapper from '../components/ModalWrapper';
import ConfirmModal from '../components/ConfirmModal';
import AddButton from '../components/AddButton';
import TableWrapper from '../components/TableWrapper';
import ActionButtons from '../components/ActionButtons';

const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Cola Classic',
    category: 'Soft Drinks',
    price: 2.99,
    stock: 500,
    unit: 'bottles',
  },
  {
    id: '2',
    name: 'Natural Spring Water',
    category: 'Water',
    price: 1.49,
    stock: 1000,
    unit: 'bottles',
  },
];

function Inventory() {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleSaveProduct = (product: Partial<Product>) => {
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...editingProduct, ...product } as Product : p))
      );
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: product.name || '',
        category: product.category || '',
        price: product.price || 0,
        stock: product.stock || 0,
        unit: product.unit || '',
      };
      setProducts([...products, newProduct]);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setProductToDelete(null);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
        <AddButton
          label="Product"
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
        />
      </div>

      <TableWrapper columns={["Product", "Category", "Price", "Stock", "Actions"]}>
        {products.map((product) => (
          <tr key={product.id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.price.toFixed(2)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {product.stock} {product.unit}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div className="flex space-x-2">
                <ActionButtons
                onEdit={() => {
                  setEditingProduct(product);
                  setIsModalOpen(true);
                }}
                onDelete={() => setProductToDelete(product)}
              />
              </div>
            </td>
          </tr>
        ))}
      </TableWrapper>

      {isModalOpen && (
        <ModalWrapper
          title={editingProduct ? 'Edit Product' : 'Add New Product'}
          onClose={handleCancel}
        >
          <ProductForm
            initialData={editingProduct || {}}
            onCancel={handleCancel}
            onSubmit={handleSaveProduct}
          />
        </ModalWrapper>
      )}

      {productToDelete && (
        <ConfirmModal
          title="Confirm Deletion"
          message={`Are you sure you want to delete ${productToDelete.name}?`}
          onCancel={() => setProductToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

export default Inventory;