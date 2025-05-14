import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import ProductForm from '../components/ProductForm';
import { Product } from '../types/product';
import ModalWrapper from '../components/ModalWrapper';
import ConfirmModal from '../components/ConfirmModal';

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
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Product
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
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
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => {
                        setEditingProduct(product);
                        setIsModalOpen(true);
                      }}
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => setProductToDelete(product)}
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
          title={editingProduct ? 'Edit Product' : 'Add New Product'}
          onClose={handleCancel}
        >
          <ProductForm
              initialData={editingProduct || {}}
              onCancel={() => {
                setIsModalOpen(false);
                setEditingProduct(null);
              }}
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