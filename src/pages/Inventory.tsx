import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react'; // Não estão sendo usados diretamente aqui
import ProductForm from '../components/ProductForm';
import { Product } from '../types/product'; // Seu tipo Product do frontend
import ModalWrapper from '../components/ModalWrapper';
import ConfirmModal from '../components/ConfirmModal';
import AddButton from '../components/AddButton';
import TableWrapper from '../components/TableWrapper';
import ActionButtons from '../components/ActionButtons';
import apiClient from '../services/api';
import {
  ApiProduto,
  ApiProdutoCreate,
  ApiProdutoUpdate
} from '../types/productAPI';

function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const mapApiProdutoToFrontendProduct = (apiProd: ApiProduto): Product => {
    return {
      id: apiProd.id.toString(),
      name: apiProd.nome,
      descricao: apiProd.descricao, // Mapeado
      category: apiProd.categoria || '',
      price: parseFloat(apiProd.preco),
      stock: apiProd.quantidade_estoque,
      // 'unit' removido
    };
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ApiProduto[]>('/produtos/');
      setProducts(response.data.map(mapApiProdutoToFrontendProduct));
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      setError("Falha ao carregar produtos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSaveProduct = async (formData: Partial<Product>) => {
    setIsModalOpen(false);
    setLoading(true);
    setError(null);

    try {
      if (editingProduct) {
        const payload: ApiProdutoUpdate = {
          nome: formData.name,
          descricao: formData.descricao, // Adicionado
          preco: formData.price,
          quantidade_estoque: formData.stock,
          categoria: formData.category,
        };
        Object.keys(payload).forEach(key => payload[key as keyof ApiProdutoUpdate] === undefined && delete payload[key as keyof ApiProdutoUpdate]);
        await apiClient.put(`/produtos/${editingProduct.id}`, payload);
      } else {
        if (!formData.name || formData.price === undefined || formData.stock === undefined) {
          setError("Nome, preço e quantidade em estoque são obrigatórios.");
          setLoading(false);
          setIsModalOpen(true);
          return;
        }
        const payload: ApiProdutoCreate = {
          nome: formData.name,
          descricao: formData.descricao, // Adicionado
          preco: formData.price,
          quantidade_estoque: formData.stock,
          categoria: formData.category,
        };
        await apiClient.post('/produtos/', payload);
      }
      fetchProducts();
    } catch (err: any) {
      console.error("Erro ao salvar produto:", err);
      const apiErrorMessage = err.response?.data?.detail || "Erro ao salvar produto. Verifique os dados e tente novamente.";
      if (Array.isArray(apiErrorMessage)) {
        setError(apiErrorMessage.map((e: { msg: string }) => e.msg).join(', '));
      } else {
        setError(apiErrorMessage);
      }
      setIsModalOpen(true);
    } finally {
      setLoading(false);
      if (!error) {
        setEditingProduct(null);
      }
    }
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      setLoading(true);
      setError(null);
      try {
        await apiClient.delete(`/produtos/${productToDelete.id}`);
        fetchProducts();
      } catch (err) {
        console.error("Erro ao deletar produto:", err);
        setError("Falha ao deletar produto.");
      } finally {
        setLoading(false);
        setProductToDelete(null);
      }
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setError(null);
  };

  if (loading && products.length === 0) {
    return <p className="text-center text-gray-500">Carregando inventário...</p>;
  }

  if (error && products.length === 0) {
    return <p className="text-center text-red-500">Erro: {error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
        <AddButton
          label="Product"
          onClick={() => {
            setEditingProduct(null);
            setError(null);
            setIsModalOpen(true);
          }}
        />
      </div>

      {error && !isModalOpen && <p className="text-sm text-red-600 text-center my-2">Erro: {error}</p>}
      {loading && <p className="text-sm text-blue-600 text-center my-2">Processando...</p>}

      {/* Colunas da tabela atualizadas */}
      <TableWrapper columns={["Product", "Description", "Category", "Price", "Stock", "Actions"]}>
        {products.map((product) => (
          <tr key={product.id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={product.descricao || ''}>
              {product.descricao || '-'}
            </td> {/* Coluna Descrição adicionada */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.price.toFixed(2)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {product.stock} {/* 'unit' removido da exibição do estoque */}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div className="flex space-x-2">
                <ActionButtons
                  onEdit={() => {
                    setEditingProduct(product);
                    setError(null);
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
          {error && isModalOpen && <p className="text-sm text-red-600 text-center mb-4">{error}</p>}
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
          message={`Are you sure you want to delete ${productToDelete.name}? This action cannot be undone.`}
          onCancel={() => setProductToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

export default Inventory;