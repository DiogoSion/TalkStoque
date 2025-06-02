// src/pages/Sales.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Sale } from '../types/sale'; // Tipo do frontend para Venda, agora inclui pedido_status_original
import SaleForm from '../components/SaleForm';
import ModalWrapper from '../components/ModalWrapper';
import ConfirmModal from '../components/ConfirmModal';
import AddButton from '../components/AddButton';
import TableWrapper from '../components/TableWrapper';
import ActionButtons from '../components/ActionButtons';
import apiClient from '../services/api';
import { useAuth } from '../contexts/AuthContext'; // Contexto para informações de autenticação
import { ApiVenda, ApiPedidoForDetails, ApiVendaCreate, ApiVendaUpdate, ApiPedidoStatusUpdate } from '../types/saleAPI';

// Opções de status para o dropdown no modal de atualização de status do pedido
const PEDIDO_STATUS_OPTIONS = ['Pendente', 'Processando', 'Enviado', 'Entregue', 'Cancelado'];

export default function Sales() {
  // Estado para armazenar a lista de vendas buscadas da API
  const [sales, setSales] = useState<Sale[]>([]);
  // Estado para controlar a visibilidade do modal de formulário de venda (adicionar/editar)
  const [isSaleFormModalOpen, setIsSaleFormModalOpen] = useState(false);
  // Estado para armazenar os dados da venda que está sendo editada
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  // Estado para armazenar os dados da venda a ser deletada (para o modal de confirmação)
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);

  // Estados para o modal de atualização de status do pedido (após deletar uma venda)
  const [orderToUpdateStatus, setOrderToUpdateStatus] = useState<{ pedido_id: number; current_status?: string; customer_name?: string } | null>(null);
  const [isChangeOrderStatusModalOpen, setIsChangeOrderStatusModalOpen] = useState(false);
  const [selectedNewOrderStatus, setSelectedNewOrderStatus] = useState<string>('');

  // Estados para feedback visual e tratamento de erros
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Obtém informações do usuário logado (principalmente o ID do funcionário) e o estado de carregamento dessas informações
  const { userInfo, isLoadingUserInfo } = useAuth();

  /**
   * Mapeia os dados de uma venda vindos da API (ApiVenda) para o formato do frontend (Sale).
   * Também busca detalhes do pedido associado para exibir nome do cliente e resumo dos produtos.
   */
  const mapApiVendaToFrontendSale = useCallback(async (apiSale: ApiVenda): Promise<Sale> => {
    let customerName = `Pedido ID: ${apiSale.pedido_id}`;
    let productsSummary = 'Ver detalhes no pedido';
    let pedidoStatusOriginal = 'Desconhecido';

    try {
      // Busca os detalhes do pedido associado a esta venda
      const pedidoResponse = await apiClient.get<ApiPedidoForDetails>(`/pedidos/${apiSale.pedido_id}`);
      if (pedidoResponse.data) {
        customerName = pedidoResponse.data.cliente?.nome || 'Cliente Desconhecido';
        pedidoStatusOriginal = pedidoResponse.data.status || 'Desconhecido';
        // Gera um resumo dos produtos do pedido (assumindo que nome_produto vem da API de pedido)
        productsSummary = pedidoResponse.data.itens
          .map(item => {
            const name = item.nome_produto || `ID ${item.produto_id}`;
            return `${name} (x${item.quantidade})`;
          })
          .join(', ') || 'Nenhum item';
      }
    } catch (e) {
      console.warn(`Não foi possível buscar detalhes do pedido ${apiSale.pedido_id} para a venda ${apiSale.id}.`, e);
      productsSummary = 'Erro ao carregar itens do pedido';
    }

    // Retorna o objeto Sale formatado para o frontend
    return {
      id: apiSale.id.toString(),
      invoiceNumber: `INV-${String(apiSale.id).padStart(5, '0')}`, // Cria um número de fatura simples
      pedido_id: apiSale.pedido_id,
      customerNameDisplay: customerName,
      productsDisplay: productsSummary,
      amount: parseFloat(apiSale.valor_total), // Converte valor_total (string da API) para número
      paymentMethod: apiSale.forma_pagamento || 'N/A',
      saleDate: new Date(apiSale.data_venda).toISOString().split('T')[0], // Formata a data
      funcionario_id: apiSale.funcionario_id,
      pedido_status_original: pedidoStatusOriginal, // Armazena o status original do pedido
    };
  }, []); // useCallback para otimização, pois esta função é dependência de fetchSales

  /**
   * Busca todas as vendas da API e atualiza o estado 'sales'.
   */
  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ApiVenda[]>('/vendas/');
      // Mapeia cada venda da API para o formato do frontend (isso envolve chamadas async para detalhes do pedido)
      const mappedSales = await Promise.all(response.data.map(sale => mapApiVendaToFrontendSale(sale)));
      setSales(mappedSales);
    } catch (err) {
      console.error("Erro ao buscar vendas:", err);
      setError("Falha ao carregar vendas.");
    } finally {
      setLoading(false);
    }
  }, [mapApiVendaToFrontendSale]); // Depende de mapApiVendaToFrontendSale

  // Efeito para buscar as vendas quando o componente é montado ou quando as informações do usuário são carregadas
  useEffect(() => {
    if (!isLoadingUserInfo) { // Só busca se as informações do usuário já foram carregadas (ou falharam)
      fetchSales();
    }
  }, [fetchSales, isLoadingUserInfo]); // Depende de fetchSales e isLoadingUserInfo

  /**
   * Lida com a submissão do formulário de Venda (tanto para criar nova quanto para editar existente).
   * @param formData Dados parciais da venda vindos do SaleForm.
   */
  const handleSaleSubmit = async (formData: Partial<Sale>) => {
    setIsSaleFormModalOpen(false); // Fecha o modal do formulário
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    const currentEmployeeId = userInfo.id; // ID do funcionário logado

    try {
      let saleResponse;
      if (editingSale) { // Se estiver editando uma venda existente
        const payload: ApiVendaUpdate = {
          valor_total: formData.amount,
          forma_pagamento: formData.paymentMethod,
          funcionario_id: currentEmployeeId, // Pode-se permitir atualizar o funcionário aqui se fizer sentido
        };
        saleResponse = await apiClient.put(`/vendas/${editingSale.id}`, payload);
        setSuccessMessage("Venda atualizada com sucesso!");
      } else { // Se estiver criando uma nova venda
        // Validação básica dos campos obrigatórios
        if (formData.amount === undefined || !formData.paymentMethod || formData.pedido_id === undefined) {
          setError("Pedido, Valor e Método de Pagamento são obrigatórios.");
          setIsSaleFormModalOpen(true); // Reabre o modal para correção
          setLoading(false);
          return;
        }
        const payload: ApiVendaCreate = {
          pedido_id: formData.pedido_id,
          funcionario_id: currentEmployeeId,
          valor_total: formData.amount,
          forma_pagamento: formData.paymentMethod,
        };
        saleResponse = await apiClient.post('/vendas/', payload);
        setSuccessMessage("Venda adicionada com sucesso!");

        // Após criar a venda com sucesso, atualiza o status do pedido associado para 'Entregue'
        if (saleResponse && saleResponse.data && formData.pedido_id) {
          try {
            const pedidoStatusUpdatePayload: ApiPedidoStatusUpdate = { status: 'Entregue' };
            await apiClient.put(`/pedidos/${formData.pedido_id}`, pedidoStatusUpdatePayload);
            // Adiciona à mensagem de sucesso
            setSuccessMessage(prev => (prev ? prev + " " : "") + `Status do pedido ${formData.pedido_id} atualizado para 'Entregue'.`);
          } catch (pedidoError) {
            console.error(`Erro ao atualizar status do pedido ${formData.pedido_id}:`, pedidoError);
            // Adiciona ao erro, informando que a venda foi criada mas o status do pedido falhou
            setError((prevError) => (prevError ? prevError + " " : "") + `Venda criada, mas falha ao atualizar status do pedido ${formData.pedido_id}.`);
          }
        }
      }
      fetchSales(); // Recarrega a lista de vendas para refletir as mudanças
    } catch (err: any) {
      console.error("Erro ao salvar venda:", err);
      const apiErrorMessage = err.response?.data?.detail || "Erro ao salvar venda.";
      if (Array.isArray(apiErrorMessage)) { setError(apiErrorMessage.map((e: { msg: string }) => e.msg).join(', ')); } else { setError(apiErrorMessage); }
      setIsSaleFormModalOpen(true); // Reabre o modal em caso de erro na operação da venda
    } finally {
      setLoading(false);
      if (!error && successMessage) { // Se não houve erro e teve sucesso, limpa o estado de edição
        setEditingSale(null);
      }
    }
  };

  /**
   * Lida com o cancelamento do formulário de venda.
   */
  const handleSaleFormCancel = () => {
    setEditingSale(null);
    setIsSaleFormModalOpen(false);
    setError(null);
    setSuccessMessage(null);
  };

  /**
   * Lida com a confirmação da exclusão de uma venda.
   * Após excluir a venda, abre um modal para permitir a alteração do status do pedido associado.
   */
  const confirmSaleDelete = async () => {
    if (saleToDelete) {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      const { pedido_id, pedido_status_original, customerNameDisplay } = saleToDelete;

      try {
        await apiClient.delete(`/vendas/${saleToDelete.id}`);
        setSuccessMessage(`Venda ${saleToDelete.invoiceNumber} deletada com sucesso.`);
        fetchSales(); // Atualiza a lista de vendas
        setSaleToDelete(null); // Fecha o modal de confirmação de deleção da venda

        // Abre o modal para alterar o status do pedido associado
        setOrderToUpdateStatus({
          pedido_id: pedido_id,
          current_status: pedido_status_original || 'Entregue', // Assume 'Entregue' se o status original não foi pego
          customer_name: customerNameDisplay
        });
        // Sugere um novo status: se era 'Entregue', sugere 'Enviado', senão mantém o original ou 'Enviado'
        setSelectedNewOrderStatus(pedido_status_original === 'Entregue' ? 'Enviado' : pedido_status_original || 'Enviado');
        setIsChangeOrderStatusModalOpen(true);

      } catch (err: any) {
        console.error("Erro ao deletar venda:", err);
        const apiErrorMessage = err.response?.data?.detail || "Falha ao deletar venda.";
        if (Array.isArray(apiErrorMessage)) { setError(apiErrorMessage.map((e: { msg: string }) => e.msg).join(', ')); } else { setError(apiErrorMessage); }
        setSaleToDelete(null); // Fecha o modal de confirmação mesmo se der erro
      } finally {
        setLoading(false);
      }
    }
  };

  /**
   * Lida com a confirmação da atualização do status de um pedido (no modal específico).
   */
  const handleConfirmOrderStatusUpdate = async () => {
    if (!orderToUpdateStatus || !selectedNewOrderStatus) {
      setError("Nenhum pedido ou novo status selecionado para atualização.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload: ApiPedidoStatusUpdate = { status: selectedNewOrderStatus };
      await apiClient.put(`/pedidos/${orderToUpdateStatus.pedido_id}`, payload);
      setSuccessMessage(`Status do Pedido ID ${orderToUpdateStatus.pedido_id} atualizado para '${selectedNewOrderStatus}'.`);
      // Opcional: Chamar fetchSales() novamente para atualizar pedido_status_original nas vendas, se necessário.
      // fetchSales(); 
    } catch (err: any) {
      console.error("Erro ao atualizar status do pedido:", err);
      const apiErrorMessage = err.response?.data?.detail || "Falha ao atualizar status do pedido.";
      if (Array.isArray(apiErrorMessage)) { setError(apiErrorMessage.map((e: { msg: string }) => e.msg).join(', ')); } else { setError(apiErrorMessage); }
    } finally {
      setLoading(false);
      setIsChangeOrderStatusModalOpen(false);
      setOrderToUpdateStatus(null);
    }
  };

  /**
   * Lida com o cancelamento do modal de atualização de status do pedido.
   */
  const handleCancelOrderStatusUpdate = () => {
    setIsChangeOrderStatusModalOpen(false);
    setOrderToUpdateStatus(null);
  };

  // Lógica de renderização condicional para estados de carregamento e erro
  if (isLoadingUserInfo || (loading && sales.length === 0)) {
    return <p className="text-center text-gray-500">Carregando dados...</p>;
  }
  // Só mostra erro global se nenhum modal estiver aberto e a lista de vendas estiver vazia
  if (error && sales.length === 0 && !isSaleFormModalOpen && !isChangeOrderStatusModalOpen) {
    return <p className="text-center text-red-500">Erro: {error}</p>;
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página e botão de adicionar */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Sales Management</h2>
        <AddButton
          label="Sale"
          onClick={() => {
            setEditingSale(null); setError(null); setSuccessMessage(null);
            setIsSaleFormModalOpen(true);
          }}
        />
      </div>

      {/* Exibição de mensagens globais de sucesso, erro e carregamento */}
      {successMessage && !isSaleFormModalOpen && !isChangeOrderStatusModalOpen && <div className="p-3 my-2 text-sm text-green-700 bg-green-100 rounded-md">{successMessage}</div>}
      {error && !isSaleFormModalOpen && !isChangeOrderStatusModalOpen && <div className="p-3 my-2 text-sm text-red-700 bg-red-100 rounded-md">Erro: {error}</div>}
      {loading && <p className="text-sm text-blue-600 text-center my-2">Processando...</p>}

      {/* Tabela de Vendas */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <TableWrapper columns={['Invoice #', 'Customer (Order)', 'Items (Order)', 'Amount', 'Payment', 'Date', 'Actions']}>
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td className="px-6 py-4">{sale.invoiceNumber}</td>
              <td className="px-6 py-4">{sale.customerNameDisplay}</td>
              <td className="px-6 py-4 max-w-xs truncate" title={sale.productsDisplay}>{sale.productsDisplay}</td>
              <td className="px-6 py-4">${sale.amount.toFixed(2)}</td>
              <td className="px-6 py-4">{sale.paymentMethod}</td>
              <td className="px-6 py-4">{sale.saleDate}</td>
              <td className="px-6 py-4 text-sm">
                <div className="flex space-x-2">
                  <ActionButtons
                    onEdit={() => { setEditingSale(sale); setError(null); setSuccessMessage(null); setIsSaleFormModalOpen(true); }}
                    onDelete={() => setSaleToDelete(sale)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </TableWrapper>
      </div>

      {/* Modal para Adicionar/Editar Venda */}
      {isSaleFormModalOpen && (
        <ModalWrapper
          title={editingSale ? `Edit Sale ${editingSale.invoiceNumber}` : 'Add New Sale'}
          onClose={handleSaleFormCancel}
        >
          {error && isSaleFormModalOpen && <p className="text-sm text-red-600 text-center mb-4">Erro: {error}</p>}
          {successMessage && isSaleFormModalOpen && <p className="text-sm text-green-600 text-center mb-4">{successMessage}</p>}
          <SaleForm
            initialData={editingSale || { saleDate: new Date().toISOString().split('T')[0] }}
            onSubmit={handleSaleSubmit}
            onCancel={handleSaleFormCancel}
            isEditing={!!editingSale}
          />
        </ModalWrapper>
      )}

      {/* Modal para Confirmar Deleção da Venda */}
      {saleToDelete && !isChangeOrderStatusModalOpen && (
        <ConfirmModal
          title="Confirm Deletion"
          message={`Are you sure you want to delete sale ${saleToDelete.invoiceNumber}?`}
          onCancel={() => setSaleToDelete(null)}
          onConfirm={confirmSaleDelete}
        />
      )}

      {/* Modal para Alterar Status do Pedido (após deletar venda) */}
      {isChangeOrderStatusModalOpen && orderToUpdateStatus && (
        <ModalWrapper
          title={`Atualizar Status do Pedido ID: ${orderToUpdateStatus.pedido_id}`}
          onClose={handleCancelOrderStatusUpdate}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              A venda associada ao Pedido ID <strong>{orderToUpdateStatus.pedido_id}</strong> (Cliente: {orderToUpdateStatus.customer_name || 'N/A'}) foi excluída.
            </p>
            <p className="text-sm text-gray-700">
              Status atual do pedido: <strong>{orderToUpdateStatus.current_status}</strong>.
            </p>
            <div>
              <label htmlFor="newOrderStatus" className="block text-sm font-medium text-gray-700">
                Selecione o novo status para este pedido:
              </label>
              <select
                id="newOrderStatus"
                value={selectedNewOrderStatus}
                onChange={(e) => setSelectedNewOrderStatus(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {PEDIDO_STATUS_OPTIONS.map(statusOption => (
                  <option key={statusOption} value={statusOption}>
                    {statusOption}
                  </option>
                ))}
              </select>
            </div>
            {/* Exibição de erro/sucesso dentro deste modal específico */}
            {error && isChangeOrderStatusModalOpen && <p className="text-sm text-red-600 text-center">{error}</p>}
            {successMessage && isChangeOrderStatusModalOpen && <p className="text-sm text-green-600 text-center">{successMessage}</p>}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancelOrderStatusUpdate}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Pular / Manter Atual
              </button>
              <button
                type="button"
                onClick={handleConfirmOrderStatusUpdate}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Atualizar Status do Pedido
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
}
