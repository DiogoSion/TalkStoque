// src/pages/Orders.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Order, OrderItemDetail } from '../types/order'; // Tipos do frontend para Pedido e Item de Pedido
import OrderForm from '../components/OrderForm'; // Componente do formulário para adicionar/editar pedidos
import ModalWrapper from '../components/ModalWrapper'; // Componente genérico para modais
import ConfirmModal from '../components/ConfirmModal'; // Modal para confirmações
import AddButton from '../components/AddButton'; // Botão para adicionar novo item
import TableWrapper from '../components/TableWrapper'; // Componente para encapsular a tabela
import ActionButtons from '../components/ActionButtons'; // Botões de ação (editar/deletar) para a tabela
import apiClient from '../services/api'; // Cliente Axios configurado para chamadas à API
import { ApiCliente, ApiPedidoItem, ApiPedido, ApiPedidoCreate, ApiPedidoUpdate } from '../types/orderAPI'; // Tipos relevantes para a API

export default function Orders() {
  // Estado para armazenar a lista de pedidos buscados da API e exibidos na tabela
  const [orders, setOrders] = useState<Order[]>([]);
  // Estado para controlar a visibilidade do modal de formulário (adicionar/editar pedido)
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Estado para armazenar os dados do pedido que está sendo editado
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  // Estado para armazenar os dados do pedido a ser deletado (para o modal de confirmação)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // Estados para feedback visual e tratamento de erros
  const [loading, setLoading] = useState<boolean>(true); // Indica se os dados estão sendo carregados
  const [error, setError] = useState<string | null>(null); // Armazena mensagens de erro
  // const [successMessage, setSuccessMessage] = useState<string | null>(null); // Para mensagens de sucesso, se necessário

  /**
   * Mapeia os dados de um pedido vindos da API (ApiPedido) para o formato do frontend (Order).
   * @param apiOrder Objeto do pedido vindo da API.
   * @returns Objeto do pedido formatado para o frontend.
   */
  const mapApiPedidoToFrontendOrder = useCallback((apiOrder: ApiPedido): Order => {
    // Mapeia cada item do pedido da API para o formato OrderItemDetail do frontend
    const frontendItems: OrderItemDetail[] = apiOrder.itens.map(item => ({
      productId: item.produto_id,
      // Usa o nome_produto diretamente da API (que agora deve ser fornecido pelo backend).
      // Se nome_produto não vier, usa um fallback para o ID do produto.
      productName: item.nome_produto || `Produto ID ${item.produto_id}`,
      quantity: item.quantidade,
      unitPrice: parseFloat(item.preco_unitario), // Converte preço (string da API) para número
    }));

    // Retorna o objeto Order formatado
    return {
      id: apiOrder.id.toString(), // Converte ID (número da API) para string
      customerName: apiOrder.cliente?.nome || 'Cliente Desconhecido', // Usa o nome do cliente aninhado
      customerId: apiOrder.cliente_id,
      items: frontendItems, // Lista de itens formatada
      totalAmount: parseFloat(apiOrder.total), // Converte total (string da API) para número
      status: apiOrder.status || 'Pendente', // Usa o status da API ou 'Pendente' como padrão
      orderDate: new Date(apiOrder.data_pedido).toISOString().split('T')[0], // Formata a data para YYYY-MM-DD
    };
  }, []); // useCallback para otimizar, pois esta função é dependência de fetchOrders

  /**
   * Busca todos os pedidos da API e atualiza o estado 'orders'.
   */
  const fetchOrders = useCallback(async () => {
    setLoading(true); // Ativa o indicador de carregamento
    setError(null);   // Limpa erros anteriores
    try {
      const response = await apiClient.get<ApiPedido[]>('/pedidos/'); // Chamada à API
      // Mapeia os dados recebidos para o formato do frontend
      const mappedOrders = response.data.map(order => mapApiPedidoToFrontendOrder(order));
      setOrders(mappedOrders); // Atualiza o estado com os pedidos mapeados
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
      setError("Falha ao carregar pedidos. Tente novamente."); // Define mensagem de erro
    } finally {
      setLoading(false); // Desativa o indicador de carregamento
    }
  }, [mapApiPedidoToFrontendOrder]); // Depende de mapApiPedidoToFrontendOrder

  // Efeito para buscar os pedidos quando o componente é montado
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]); // A dependência fetchOrders garante que rode apenas se a função mudar (o que não deve acontecer devido ao useCallback)

  /**
   * Lida com a submissão do formulário de Pedido (tanto para criar novo quanto para editar existente).
   * @param formData Dados parciais do pedido vindos do OrderForm.
   */
  const handleSubmit = async (formData: Partial<Order>) => {
    setIsModalOpen(false); // Fecha o modal do formulário
    setLoading(true);
    setError(null);
    // setSuccessMessage(null); // Limpa mensagem de sucesso, se estiver usando

    // Mapeia os itens do formulário do frontend para o formato esperado pela API de criação
    const itemsForApi = formData.items?.map(item => ({
      produto_id: Number(item.productId), // Garante que produto_id seja um número
      quantidade: item.quantity,
      preco_unitario: item.unitPrice,
      // nome_produto não é enviado ao criar/atualizar itens via pedido;
      // o backend deve buscar/associar o nome com base no produto_id.
    })) || [];

    try {
      if (editingOrder) { // Se estiver editando um pedido existente
        if (!editingOrder.id) { // Validação de segurança
          setError("ID do pedido não encontrado para edição.");
          setLoading(false); return;
        }
        // Prepara o payload para atualizar o pedido
        const payload: ApiPedidoUpdate = {
          status: formData.status,
          total: formData.totalAmount,
          // Permite atualizar o cliente_id se ele foi alterado no formulário
          cliente_id: formData.customerId || (editingOrder ? Number(editingOrder.customerId) : undefined),
        };
        await apiClient.put(`/pedidos/${editingOrder.id}`, payload); // Chamada PUT para a API
        // setSuccessMessage(`Pedido ID ${editingOrder.id} atualizado com sucesso!`);
      } else { // Se estiver criando um novo pedido
        // Validação básica dos campos obrigatórios
        if (formData.totalAmount === undefined || !formData.status) {
          setError("Total e Status são obrigatórios.");
          setIsModalOpen(true); setLoading(false); return;
        }
        const clienteIdParaApi = formData.customerId; // Usa o customerId definido no OrderForm
        if (!clienteIdParaApi) { // Garante que um cliente foi selecionado/definido
          setError("Cliente é obrigatório. Selecione um cliente no formulário.");
          setIsModalOpen(true); setLoading(false); return;
        }

        // Prepara o payload para criar o pedido
        const payload: ApiPedidoCreate = {
          cliente_id: clienteIdParaApi,
          status: formData.status || 'Pendente',
          total: formData.totalAmount,
          itens: itemsForApi, // Inclui os itens formatados para a API
        };
        await apiClient.post('/pedidos/', payload); // Chamada POST para a API
        // setSuccessMessage("Novo pedido adicionado com sucesso!");
      }
      fetchOrders(); // Recarrega a lista de pedidos para refletir as mudanças
    } catch (err: any) {
      console.error("Erro ao salvar pedido:", err);
      const apiErrorMessage = err.response?.data?.detail || "Erro ao salvar pedido.";
      if (Array.isArray(apiErrorMessage)) {
        setError(apiErrorMessage.map((e: { msg: string }) => e.msg).join(', '));
      } else {
        setError(apiErrorMessage);
      }
      setIsModalOpen(true); // Reabre o modal em caso de erro na operação
    } finally {
      setLoading(false);
      if (!error) { // Se não houve erro na submissão, limpa o estado de edição
        setEditingOrder(null);
      }
    }
  };

  /**
   * Lida com o cancelamento do formulário de pedido.
   */
  const handleCancel = () => {
    setEditingOrder(null); // Limpa o estado de edição
    setIsModalOpen(false); // Fecha o modal
    setError(null);        // Limpa mensagens de erro
    // setSuccessMessage(null); // Limpa mensagens de sucesso, se estiver usando
  };

  /**
   * Lida com a confirmação da exclusão de um pedido.
   */
  const confirmDelete = async () => {
    if (orderToDelete) { // Garante que há um pedido selecionado para deletar
      setLoading(true);
      setError(null);
      // setSuccessMessage(null);
      console.log(`Tentando deletar pedido com ID: ${orderToDelete.id}`); // Log para depuração
      try {
        await apiClient.delete(`/pedidos/${orderToDelete.id}`); // Chamada DELETE para a API
        // setSuccessMessage(`Pedido ID ${orderToDelete.id} deletado com sucesso!`);
        fetchOrders(); // Atualiza a lista de pedidos
      } catch (err: any) {
        console.error("Erro ao deletar pedido:", err);
        const apiErrorMessage = err.response?.data?.detail || "Falha ao deletar pedido.";
        if (Array.isArray(apiErrorMessage)) {
          setError(apiErrorMessage.map((e: { msg: string }) => e.msg).join(', '));
        } else {
          setError(apiErrorMessage);
        }
      } finally {
        setLoading(false);
        setOrderToDelete(null); // Fecha o modal de confirmação e limpa o estado
      }
    }
  };

  // Renderização condicional enquanto os dados estão carregando
  if (loading && orders.length === 0) return <p className="text-center text-gray-500">Carregando pedidos...</p>;
  // Renderização condicional se houver erro e nenhum pedido carregado (e o modal não estiver aberto)
  if (error && orders.length === 0 && !isModalOpen) return <p className="text-center text-red-500">Erro: {error}</p>;

  // Renderização principal do componente
  return (
    <div className="space-y-6">
      {/* Cabeçalho da página com título e botão de adicionar novo pedido */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
        <AddButton
          label="Order"
          onClick={() => {
            setEditingOrder(null); // Garante que está no modo de adição
            setError(null);
            // setSuccessMessage(null); 
            setIsModalOpen(true); // Abre o modal do formulário
          }}
        />
      </div>

      {/* Exibição de mensagens globais de erro ou carregamento (quando o modal não está aberto) */}
      {/* {successMessage && !isModalOpen && <div className="p-3 my-2 text-sm text-green-700 bg-green-100 rounded-md">{successMessage}</div>} */}
      {error && !isModalOpen && <div className="p-3 my-2 text-sm text-red-700 bg-red-100 rounded-md">Erro: {error}</div>}
      {loading && <p className="text-sm text-blue-600 text-center my-2">Processando...</p>}

      {/* Tabela para exibir os pedidos */}
      <TableWrapper columns={["Order ID", "Customer", "Items", "Total", "Status", "Date", "Actions"]}>
        {orders.map((order) => (
          <tr key={order.id}>
            <td className="px-6 py-4">{order.id}</td> {/* ID do Pedido */}
            <td className="px-6 py-4">{order.customerName}</td> {/* Nome do Cliente */}
            {/* Resumo dos itens do pedido, com tooltip para ver a lista completa se for longa */}
            <td className="px-6 py-4 max-w-md truncate" title={order.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}>
              {order.items.map(i => `${i.productName} (x${i.quantity})`).join(', ') || 'Nenhum item'}
            </td>
            <td className="px-6 py-4">${order.totalAmount.toFixed(2)}</td> {/* Valor Total */}
            {/* Status do pedido com estilização condicional */}
            <td className="px-6 py-4">
              <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${order.status === 'Entregue' ? 'bg-green-100 text-green-800'
                : order.status === 'Cancelado' ? 'bg-red-100 text-red-800'
                  : order.status === 'Processando' ? 'bg-blue-100 text-blue-800'
                    : order.status === 'Enviado' ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-yellow-100 text-yellow-800' // Status 'Pendente' e outros
                }`}>{order.status}</span>
            </td>
            <td className="px-6 py-4">{order.orderDate}</td> {/* Data do Pedido */}
            {/* Botões de Ação (Editar/Deletar) */}
            <td className="px-6 py-4 text-sm">
              <div className="flex space-x-2">
                <ActionButtons
                  onEdit={() => { setEditingOrder(order); setError(null); /*setSuccessMessage(null);*/ setIsModalOpen(true); }}
                  onDelete={() => setOrderToDelete(order)} // Define o pedido a ser deletado, abrindo o modal de confirmação
                />
              </div>
            </td>
          </tr>
        ))}
      </TableWrapper>

      {/* Modal para Adicionar ou Editar um Pedido */}
      {isModalOpen && (
        <ModalWrapper
          title={editingOrder ? `Edit Order ID: ${editingOrder.id}` : 'Add New Order'}
          onClose={handleCancel}
        >
          {/* Exibição de erro dentro do modal */}
          {error && isModalOpen && <p className="text-sm text-red-600 text-center mb-4">Erro: {error}</p>}
          {/* {successMessage && isModalOpen && <p className="text-sm text-green-600 text-center mb-4">{successMessage}</p>} */}
          <OrderForm
            initialData={editingOrder || { // Se estiver editando, passa os dados do pedido, senão, objeto com padrões
              orderDate: new Date().toISOString().split('T')[0],
              items: [],
              status: 'Pendente', // Status padrão para novo pedido
              totalAmount: 0      // Total padrão para novo pedido
            }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEditing={!!editingOrder} // Passa booleano indicando se está no modo de edição
          />
        </ModalWrapper>
      )}

      {/* Modal de Confirmação para Deletar Pedido */}
      {orderToDelete && (
        <ConfirmModal
          title="Confirm Deletion"
          message={`Are you sure you want to delete order ID: ${orderToDelete.id}?`}
          onCancel={() => setOrderToDelete(null)} // Fecha o modal sem deletar
          onConfirm={confirmDelete} // Chama a função para deletar
        />
      )}
    </div>
  );
}
