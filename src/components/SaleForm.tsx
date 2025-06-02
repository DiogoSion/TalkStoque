// src/components/SaleForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Sale } from '../types/sale';
import apiClient from '../services/api';
import { Order } from '../types/order'; // Para o tipo do pedido selecionado

// Supondo que você tenha um contexto de autenticação que forneça o ID do funcionário
// import { useAuth } from '../contexts/AuthContext'; 

// Interface para o Pedido retornado pela API (simplificada para o seletor)
interface ApiPedidoOption {
  id: number;
  cliente: { nome: string }; // Precisamos do nome do cliente para exibição
  total: string; // O total do pedido
  // Adicione outros campos se quiser exibi-los na seleção
}

interface Props {
  initialData: Partial<Sale>;
  onSubmit: (data: Partial<Sale>) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export default function SaleForm({ initialData, onSubmit, onCancel, isEditing }: Props) {
  const [formData, setFormData] = useState<Partial<Sale>>(initialData);

  // const { employeeId } = useAuth(); // Conceitual: pegando ID do funcionário logado

  const [pedidoSearchTerm, setPedidoSearchTerm] = useState<string>('');
  const [availablePedidos, setAvailablePedidos] = useState<ApiPedidoOption[]>([]);
  const [pedidosLoading, setPedidosLoading] = useState<boolean>(false);
  const [pedidosError, setPedidosError] = useState<string | null>(null);
  const [selectedPedido, setSelectedPedido] = useState<ApiPedidoOption | null>(null);


  // Efeito para preencher o formulário com initialData
  useEffect(() => {
    setFormData(initialData);
    if (isEditing && initialData.pedido_id) {
      // Se estiver editando, buscar e definir o pedido selecionado para exibição (se necessário)
      // No entanto, para edição de venda, o pedido_id geralmente não muda.
      // Apenas preenchemos o valor e forma de pagamento.
    } else if (!isEditing) {
      // Limpar seleção de pedido e termo de busca ao abrir para nova venda
      setPedidoSearchTerm('');
      setSelectedPedido(null);
      setAvailablePedidos([]);
    }
  }, [initialData, isEditing]);

  const fetchShippedPedidos = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim() && !isEditing) { // Não busca se o termo for vazio e não estiver editando
      setAvailablePedidos([]);
      return;
    }
    setPedidosLoading(true);
    setPedidosError(null);
    let endpoint = `/pedidos/?status_filter=Enviado`; // Filtra por status 'Enviado'
    if (searchTerm.trim() !== '') {
      endpoint += `&search=${encodeURIComponent(searchTerm.trim())}`;
    }
    endpoint += `&limit=10`; // Limitar resultados da busca

    try {
      const response = await apiClient.get<ApiPedidoOption[]>(endpoint);
      setAvailablePedidos(response.data);
    } catch (error) {
      console.error("Erro ao buscar pedidos enviados:", error);
      setPedidosError("Não foi possível carregar os pedidos.");
    } finally {
      setPedidosLoading(false);
    }
  }, [isEditing]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (pedidoSearchTerm.trim() || (!isEditing && availablePedidos.length === 0)) { // Busca se termo ou se for novo e lista vazia
        fetchShippedPedidos(pedidoSearchTerm);
      }
    }, 500); // Debounce
    return () => clearTimeout(handler);
  }, [pedidoSearchTerm, fetchShippedPedidos, isEditing, availablePedidos.length]);

  const handleSelectPedido = (pedido: ApiPedidoOption) => {
    setSelectedPedido(pedido);
    setFormData(prev => ({
      ...prev,
      pedido_id: pedido.id,
      amount: parseFloat(pedido.total), // Preenche o valor da venda com o total do pedido
      // customerNameDisplay e productsDisplay seriam preenchidos em Sales.tsx ao listar
    }));
    setPedidoSearchTerm(`Pedido ID: ${pedido.id} - Cliente: ${pedido.cliente.nome}`);
    setAvailablePedidos([]); // Limpa sugestões
  };

  const handleChange = (field: keyof Sale, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing && !formData.pedido_id) {
      alert("Por favor, selecione um Pedido para registrar a Venda.");
      return;
    }
    // Adicionar o funcionario_id conceitual
    // const dataToSubmit = { ...formData, funcionario_id: employeeId };
    // onSubmit(dataToSubmit);
    onSubmit(formData); // Por enquanto, sem funcionario_id explícito do contexto
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEditing && (
        <fieldset className="border p-4 rounded-md space-y-3">
          <legend className="text-md font-medium text-gray-900 px-1">Selecionar Pedido Enviado</legend>
          <div>
            <label htmlFor="pedidoSearch" className="block text-sm font-medium text-gray-700">
              Buscar Pedido (por ID ou Nome do Cliente)
            </label>
            <input
              type="text"
              id="pedidoSearch"
              placeholder="Digite ID do Pedido ou nome do Cliente"
              value={pedidoSearchTerm}
              onChange={(e) => setPedidoSearchTerm(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          {pedidosLoading && <p className="text-sm text-gray-500">Buscando pedidos...</p>}
          {pedidosError && <p className="text-sm text-red-500">{pedidosError}</p>}
          {availablePedidos.length > 0 && (
            <ul className="border border-gray-300 rounded-md max-h-40 overflow-y-auto">
              {availablePedidos.map(p => (
                <li
                  key={p.id}
                  onClick={() => handleSelectPedido(p)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  ID: {p.id} - Cliente: {p.cliente.nome} - Total: R$ {parseFloat(p.total).toFixed(2)}
                </li>
              ))}
            </ul>
          )}
          {selectedPedido && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md text-sm">
              Pedido Selecionado: ID {selectedPedido.id}, Cliente: {selectedPedido.cliente.nome}, Total: R$ {parseFloat(selectedPedido.total).toFixed(2)}
            </div>
          )}
        </fieldset>
      )}

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Amount ($)
        </label>
        <input
          type="number"
          id="amount"
          step="0.01"
          value={formData.amount === undefined ? '' : formData.amount}
          onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
          required
          readOnly={!isEditing && !!selectedPedido} // Somente leitura se novo e pedido selecionado
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!isEditing && !!selectedPedido ? 'bg-gray-100' : ''}`}
        />
      </div>

      <div>
        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
          Payment Method
        </label>
        <select
          id="paymentMethod"
          value={formData.paymentMethod || ''}
          onChange={(e) => handleChange('paymentMethod', e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select payment method</option>
          <option value="Dinheiro">Dinheiro</option>
          <option value="Cartão de Crédito">Cartão de Crédito</option>
          <option value="Cartão de Débito">Cartão de Débito</option>
          <option value="Transferência Bancária">Transferência Bancária</option>
          <option value="PIX">PIX</option>
          <option value="Cheque">Cheque</option>
        </select>
      </div>

      <div>
        <label htmlFor="saleDate" className="block text-sm font-medium text-gray-700">
          Sale Date
        </label>
        <input
          type="date"
          id="saleDate"
          value={formData.saleDate || new Date().toISOString().split('T')[0]}
          onChange={(e) => handleChange('saleDate', e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
          {isEditing ? 'Update Sale' : 'Add Sale'}
        </button>
      </div>
    </form>
  );
}
