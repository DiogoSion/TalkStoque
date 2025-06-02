// src/pages/Inventory.tsx
import React, { useState, useEffect, useCallback } from 'react';
// import { Plus, Pencil, Trash2 } from 'lucide-react'; // Ícones, se usados diretamente ou dentro de ActionButtons
import ProductForm from '../components/ProductForm'; // Componente do formulário para adicionar/editar produtos
import { Product } from '../types/product'; // Tipo do frontend para Produto (sem 'unit', com 'descricao')
import ModalWrapper from '../components/ModalWrapper'; // Componente genérico para modais
import ConfirmModal from '../components/ConfirmModal'; // Modal para confirmações (ex: deletar)
import AddButton from '../components/AddButton'; // Botão para adicionar novo item
import TableWrapper from '../components/TableWrapper'; // Componente para encapsular a tabela
import ActionButtons from '../components/ActionButtons'; // Botões de ação (editar/deletar) para a tabela
import apiClient from '../services/api'; // Cliente Axios configurado para chamadas à API
import {
  ApiProduto,
  ApiProdutoCreate,
  ApiProdutoUpdate
} from '../types/productAPI'; // Interfaces da API

export default function Inventory() {
  // Estado para armazenar a lista de produtos buscada da API e exibida na tabela
  const [products, setProducts] = useState<Product[]>([]);
  // Estado para armazenar os dados do produto que está sendo editado
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  // Estado para controlar a visibilidade do modal de formulário (adicionar/editar produto)
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Estado para armazenar os dados do produto a ser deletado (para o modal de confirmação)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Estados para feedback visual e tratamento de erros
  const [loading, setLoading] = useState<boolean>(true); // Indica se os dados estão sendo carregados
  const [error, setError] = useState<string | null>(null); // Armazena mensagens de erro
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Para mensagens de sucesso

  /**
   * Mapeia os dados de um produto vindos da API (ApiProduto) para o formato do frontend (Product).
   * @param apiProd Objeto do produto vindo da API.
   * @returns Objeto do produto formatado para o frontend.
   */
  const mapApiProdutoToFrontendProduct = (apiProd: ApiProduto): Product => {
    return {
      id: apiProd.id.toString(), // Converte ID (número da API) para string
      name: apiProd.nome,
      descricao: apiProd.descricao, // Mapeia a descrição
      category: apiProd.categoria || '', // Usa a categoria da API ou string vazia como padrão
      price: parseFloat(apiProd.preco), // Converte preço (string da API) para número
      stock: apiProd.quantidade_estoque,
    };
  };

  /**
   * Busca todos os produtos da API e atualiza o estado 'products'.
   * Usa useCallback para otimizar e evitar recriações desnecessárias da função.
   */
  const fetchProducts = useCallback(async () => {
    setLoading(true); // Ativa o indicador de carregamento
    setError(null);   // Limpa erros anteriores
    try {
      const response = await apiClient.get<ApiProduto[]>('/produtos/'); // Chamada à API
      // Mapeia os dados recebidos para o formato do frontend
      setProducts(response.data.map(mapApiProdutoToFrontendProduct)); // Atualiza o estado
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      setError("Falha ao carregar produtos. Tente novamente."); // Define mensagem de erro
    } finally {
      setLoading(false); // Desativa o indicador de carregamento
    }
  }, []); // Array de dependências vazio, pois mapApiProdutoToFrontendProduct não tem dependências externas

  // Efeito para buscar os produtos quando o componente é montado
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); // A dependência fetchProducts garante que rode apenas se a função mudar

  /**
   * Lida com a submissão do formulário de Produto (tanto para criar novo quanto para editar existente).
   * @param formData Dados parciais do produto vindos do ProductForm.
   */
  const handleSaveProduct = async (formData: Partial<Product>) => {
    setIsModalOpen(false); // Fecha o modal do formulário
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (editingProduct) { // Se estiver editando um produto existente
        // Prepara o payload para atualizar o produto
        const payload: ApiProdutoUpdate = {
          nome: formData.name,
          descricao: formData.descricao,
          preco: formData.price, // ProductForm envia price como number, que é aceito pela API
          quantidade_estoque: formData.stock,
          categoria: formData.category,
        };
        // Remove campos undefined do payload para não enviar nulls se não foram alterados
        Object.keys(payload).forEach(key => payload[key as keyof ApiProdutoUpdate] === undefined && delete payload[key as keyof ApiProdutoUpdate]);

        await apiClient.put(`/produtos/${editingProduct.id}`, payload); // Chamada PUT para a API
        setSuccessMessage(`Produto ${payload.nome || editingProduct.name} atualizado com sucesso!`);
      } else { // Se estiver criando um novo produto
        // Validação básica dos campos obrigatórios
        if (!formData.name || formData.price === undefined || formData.stock === undefined) {
          setError("Nome, preço e quantidade em estoque são obrigatórios.");
          setLoading(false);
          setIsModalOpen(true); // Reabre o modal para correção
          return;
        }
        // Prepara o payload para criar o produto
        const payload: ApiProdutoCreate = {
          nome: formData.name,
          descricao: formData.descricao,
          preco: formData.price,
          quantidade_estoque: formData.stock,
          categoria: formData.category,
        };
        await apiClient.post('/produtos/', payload); // Chamada POST para a API
        setSuccessMessage(`Produto ${payload.nome} adicionado com sucesso!`);
      }
      fetchProducts(); // Recarrega a lista de produtos para refletir as mudanças
    } catch (err: any) {
      console.error("Erro ao salvar produto:", err);
      const apiErrorMessage = err.response?.data?.detail || "Erro ao salvar produto. Verifique os dados e tente novamente.";
      if (Array.isArray(apiErrorMessage)) {
        setError(apiErrorMessage.map((e: { msg: string }) => e.msg).join(', '));
      } else {
        setError(apiErrorMessage);
      }
      setIsModalOpen(true); // Reabre o modal em caso de erro na operação
    } finally {
      setLoading(false);
      if (!error && successMessage) { // Se não houve erro e teve sucesso, limpa o estado de edição
        setEditingProduct(null);
      }
    }
  };

  /**
   * Lida com o cancelamento do formulário de produto.
   */
  const handleCancel = () => {
    setIsModalOpen(false); // Fecha o modal
    setEditingProduct(null); // Limpa o estado de edição
    setError(null); // Limpa mensagens de erro
    setSuccessMessage(null); // Limpa mensagens de sucesso
  };

  /**
   * Lida com a confirmação da exclusão de um produto.
   */
  const confirmDelete = async () => {
    if (productToDelete) { // Garante que há um produto selecionado para deletar
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        await apiClient.delete(`/produtos/${productToDelete.id}`); // Chamada DELETE para a API
        setSuccessMessage(`Produto ${productToDelete.name} deletado com sucesso!`);
        fetchProducts(); // Atualiza a lista de produtos
      } catch (err: any) {
        console.error("Erro ao deletar produto:", err);
        const apiErrorMessage = err.response?.data?.detail || "Falha ao deletar produto.";
        if (Array.isArray(apiErrorMessage)) {
          setError(apiErrorMessage.map((e: { msg: string }) => e.msg).join(', '));
        } else {
          setError(apiErrorMessage);
        }
      } finally {
        setLoading(false);
        setProductToDelete(null); // Fecha o modal de confirmação e limpa o estado
      }
    }
  };

  // Renderização condicional enquanto os dados estão carregando
  if (loading && products.length === 0) {
    return <p className="text-center text-gray-500">Carregando inventário...</p>;
  }

  // Renderização condicional se houver erro e nenhum produto carregado (e o modal não estiver aberto)
  if (error && products.length === 0 && !isModalOpen) {
    return <p className="text-center text-red-500">Erro: {error}</p>;
  }

  // Renderização principal do componente
  return (
    <div className="space-y-6">
      {/* Cabeçalho da página com título e botão de adicionar novo produto */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
        <AddButton
          label="Product"
          onClick={() => {
            setEditingProduct(null); // Garante que está no modo de adição
            setError(null);
            setSuccessMessage(null);
            setIsModalOpen(true); // Abre o modal do formulário
          }}
        />
      </div>

      {/* Exibição de mensagens globais de sucesso, erro e carregamento (quando o modal não está aberto) */}
      {successMessage && !isModalOpen && <div className="p-3 my-2 text-sm text-green-700 bg-green-100 rounded-md">{successMessage}</div>}
      {error && !isModalOpen && <div className="p-3 my-2 text-sm text-red-700 bg-red-100 rounded-md">Erro: {error}</div>}
      {loading && <p className="text-sm text-blue-600 text-center my-2">Processando...</p>}

      {/* Tabela para exibir os produtos */}
      {/* Colunas da tabela: Nome, Descrição, Categoria, Preço, Estoque, Ações */}
      <TableWrapper columns={["Product", "Description", "Category", "Price", "Stock", "Actions"]}>
        {products.map((product) => (
          <tr key={product.id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
            {/* Exibe a descrição, com truncamento e tooltip para textos longos */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={product.descricao || ''}>
              {product.descricao || '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.price.toFixed(2)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {product.stock}
            </td>
            {/* Botões de Ação (Editar/Deletar) para cada linha */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div className="flex space-x-2">
                <ActionButtons
                  onEdit={() => {
                    setEditingProduct(product); // Define o produto para edição
                    setError(null);
                    setSuccessMessage(null);
                    setIsModalOpen(true); // Abre o modal do formulário em modo de edição
                  }}
                  onDelete={() => setProductToDelete(product)} // Define o produto a ser deletado, abrindo o modal de confirmação
                />
              </div>
            </td>
          </tr>
        ))}
      </TableWrapper>

      {/* Modal para Adicionar ou Editar um Produto */}
      {isModalOpen && (
        <ModalWrapper
          title={editingProduct ? 'Edit Product' : 'Add New Product'}
          onClose={handleCancel}
        >
          {/* Exibição de erro/sucesso dentro do modal */}
          {error && isModalOpen && <p className="text-sm text-red-600 text-center mb-4">Erro: {error}</p>}
          {successMessage && isModalOpen && <p className="text-sm text-green-600 text-center mb-4">{successMessage}</p>}
          <ProductForm
            initialData={editingProduct || {}} // Se estiver editando, passa os dados do produto, senão, objeto vazio
            // O ProductForm foi atualizado para incluir 'descricao' e remover 'unit'
            onSubmit={handleSaveProduct}
            onCancel={handleCancel}
          // isEditing prop não é usada por ProductForm atualmente, mas poderia ser para lógica condicional no form
          />
        </ModalWrapper>
      )}

      {/* Modal de Confirmação para Deletar Produto */}
      {productToDelete && (
        <ConfirmModal
          title="Confirm Deletion"
          message={`Are you sure you want to delete ${productToDelete.name}? This action cannot be undone.`}
          onCancel={() => setProductToDelete(null)} // Fecha o modal sem deletar
          onConfirm={confirmDelete} // Chama a função para deletar
        />
      )}
    </div>
  );
}
