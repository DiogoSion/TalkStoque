// src/components/OrderForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Order, OrderItemDetail } from '../types/order';
import { Product } from '../types/product';
import apiClient from '../services/api';
import { ApiProduto } from '../types/productAPI';
import { ApiCliente, Props } from '../types/clientAPI';

export default function OrderForm({ initialData, onSubmit, onCancel, isEditing }: Props) {
  const [formData, setFormData] = useState<Partial<Order>>({
    items: [],
    ...initialData,
  });

  // Estados para produtos
  const [selectedProductId, setSelectedProductId] = useState<string | number>('');
  const [currentQuantity, setCurrentQuantity] = useState<number>(1);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [productSearchTerm, setProductSearchTerm] = useState<string>('');

  // --- Estados para Clientes ---
  const [clientSearchTerm, setClientSearchTerm] = useState<string>('');
  const [availableClients, setAvailableClients] = useState<ApiCliente[]>([]);
  const [clientsLoading, setClientsLoading] = useState<boolean>(false);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [showClientSearchResults, setShowClientSearchResults] = useState<boolean>(false);
  // --- Fim dos Estados para Clientes ---

  const mapApiProdutoToFrontendProduct = (apiProd: ApiProduto): Product => ({
    id: apiProd.id.toString(),
    name: apiProd.nome,
    category: apiProd.categoria || '',
    price: parseFloat(apiProd.preco),
    stock: apiProd.quantidade_estoque,
    descricao: apiProd.descricao,
  });

  const fetchAvailableProducts = useCallback(async (searchTerm: string) => {
    setProductsLoading(true);
    setProductsError(null);
    let endpoint = '/produtos/';
    if (searchTerm.trim() !== '') {
      endpoint = `/produtos/?search=${encodeURIComponent(searchTerm.trim())}`;
    }
    try {
      const response = await apiClient.get<ApiProduto[]>(endpoint);
      setAvailableProducts(response.data.map(mapApiProdutoToFrontendProduct));
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      setProductsError("Não foi possível carregar os produtos.");
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (productSearchTerm === '' && availableProducts.length === 0) { // Evita recarregar se já tiver algo e a busca for limpa
      fetchAvailableProducts('');
    } else {
      const handler = setTimeout(() => {
        if (productSearchTerm !== '') fetchAvailableProducts(productSearchTerm);
      }, 500);
      return () => clearTimeout(handler);
    }
  }, [productSearchTerm, fetchAvailableProducts, availableProducts.length]);

  // --- Lógica para Busca de Clientes ---
  const fetchAvailableClients = useCallback(async (searchTerm: string) => {
    if (searchTerm.trim() === '') {
      setAvailableClients([]);
      setShowClientSearchResults(false);
      return;
    }
    setClientsLoading(true);
    setClientsError(null);
    setShowClientSearchResults(true); // Mostra a área de resultados ao buscar
    try {
      const response = await apiClient.get<ApiCliente[]>(`/clientes/?search=${encodeURIComponent(searchTerm.trim())}`);
      setAvailableClients(response.data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      setClientsError("Não foi possível carregar os clientes.");
    } finally {
      setClientsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (clientSearchTerm.trim() !== '') {
        fetchAvailableClients(clientSearchTerm);
      } else {
        setAvailableClients([]); // Limpa resultados se a busca estiver vazia
        setShowClientSearchResults(false);
      }
    }, 500); // Debounce de 500ms
    return () => clearTimeout(handler);
  }, [clientSearchTerm, fetchAvailableClients]);

  const handleSelectClient = (client: ApiCliente) => {
    setFormData(prev => ({
      ...prev,
      customerName: client.nome,
      customerId: client.id,
    }));
    setClientSearchTerm(client.nome); // Preenche o input de busca com o nome selecionado
    setAvailableClients([]); // Limpa a lista de sugestões
    setShowClientSearchResults(false); // Esconde a área de resultados
  };
  // --- Fim da Lógica para Busca de Clientes ---

  useEffect(() => {
    // Preencher customerName no input de busca se initialData tiver customerId e customerName
    if (initialData.customerId && initialData.customerName && !clientSearchTerm) {
      setClientSearchTerm(initialData.customerName);
    }
    setFormData(prev => ({ ...prev, ...initialData, items: initialData.items || [] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]); // clientSearchTerm removido para evitar loop na edição

  const handleChange = (field: keyof Omit<Order, 'items' | 'customerId'>, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Se o nome do cliente for alterado manualmente, limpar o customerId selecionado
    if (field === 'customerName') {
      setFormData(prev => ({ ...prev, customerId: undefined }));
      setClientSearchTerm(value as string); // Atualiza o termo de busca de cliente também
      if (!(value as string).trim()) setShowClientSearchResults(false); else setShowClientSearchResults(true);
    }
  };

  const handleItemChange = <K extends keyof OrderItemDetail>(index: number, field: K, value: OrderItemDetail[K]) => {
    const updatedItems = formData.items ? [...formData.items] : [];
    if (updatedItems[index]) {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      setFormData(prev => ({ ...prev, items: updatedItems }));
    }
  };

  const handleAddItem = () => {
    // ... (lógica de handleAddItem permanece a mesma) ...
    if (!selectedProductId || currentQuantity <= 0) {
      alert("Selecione um produto e especifique uma quantidade válida.");
      return;
    }
    const productToAdd = availableProducts.find(p => p.id.toString() === selectedProductId.toString());
    if (!productToAdd) {
      alert("Produto selecionado não encontrado.");
      return;
    }
    if (currentQuantity > productToAdd.stock) {
      alert(`Quantidade solicitada (${currentQuantity}) excede o estoque disponível (${productToAdd.stock}) para ${productToAdd.name}.`);
      return;
    }

    const newItem: OrderItemDetail = {
      productId: productToAdd.id,
      productName: productToAdd.name,
      quantity: currentQuantity,
      unitPrice: productToAdd.price,
    };

    const existingItems = formData.items || [];
    const existingItemIndex = existingItems.findIndex(item => item.productId.toString() === productToAdd.id.toString());

    let updatedItems;
    if (existingItemIndex > -1) {
      updatedItems = [...existingItems];
      const newQuantityForExisting = updatedItems[existingItemIndex].quantity + currentQuantity;
      if (newQuantityForExisting > productToAdd.stock) {
        alert(`Adicionar ${currentQuantity} unidades de ${productToAdd.name} excederia o estoque disponível (${productToAdd.stock}). Você já tem ${updatedItems[existingItemIndex].quantity} no pedido.`);
        return;
      }
      updatedItems[existingItemIndex].quantity = newQuantityForExisting;
    } else {
      updatedItems = [...existingItems, newItem];
    }

    setFormData(prev => ({ ...prev, items: updatedItems }));
    setSelectedProductId('');
    setCurrentQuantity(1);
  };

  const handleRemoveItem = (indexToRemove: number) => {
    // ... (lógica de handleRemoveItem permanece a mesma) ...
    const existingItems = formData.items || [];
    setFormData(prev => ({
      ...prev,
      items: existingItems.filter((_, index) => index !== indexToRemove),
    }));
  };

  const calculateTotalAmount = () => {
    // ... (lógica de calculateTotalAmount permanece a mesma) ...
    return formData.items?.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) || 0;
  };

  useEffect(() => {
    // ... (useEffect para totalAmount permanece o mesmo) ...
    if (!isEditing || initialData.totalAmount === undefined) {
      const newTotal = calculateTotalAmount();
      if (formData.totalAmount !== newTotal) {
        setFormData(prev => ({ ...prev, totalAmount: newTotal }));
      }
    }
  }, [formData.items, isEditing, initialData.totalAmount, formData.totalAmount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId && clientSearchTerm.trim() !== '') {
      // Se o usuário digitou um nome de cliente mas não selecionou da lista (ou a busca não retornou),
      // E não há um customerId já definido (ex: vindo de initialData ao editar)
      // Você pode querer alertar ou ter uma lógica para criar um novo cliente aqui (fora do escopo atual).
      // Por ora, o `handleSubmit` em Orders.tsx já tem uma validação para clienteIdParaApi.
      // Apenas limpamos o customerName se não houver customerId para evitar enviar um nome sem ID.
      if (!initialData.customerId) { // Só limpa se não for edição com ID já existente
        setFormData(prev => ({ ...prev, customerName: clientSearchTerm, customerId: undefined }));
      }
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Name - Agora com busca */}
      <div>
        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
          Customer Name
        </label>
        <input
          type="text"
          id="customerName"
          placeholder="Digite para buscar"
          value={clientSearchTerm} // Controlado por clientSearchTerm para permitir a busca
          onChange={(e) => {
            setClientSearchTerm(e.target.value);
            // Se o nome do cliente for alterado manualmente, limpar o customerId selecionado
            // para forçar uma nova seleção ou indicar que é um novo cliente (lógica a ser definida)
            if (formData.customerId) {
              setFormData(prev => ({ ...prev, customerId: undefined, customerName: e.target.value }));
            } else {
              setFormData(prev => ({ ...prev, customerName: e.target.value }));
            }
            if (e.target.value.trim() !== '') {
              setShowClientSearchResults(true);
            } else {
              setShowClientSearchResults(false);
              setAvailableClients([]);
            }
          }}
          onBlur={() => setTimeout(() => setShowClientSearchResults(false), 150)} // Pequeno delay para permitir clique no resultado
          onFocus={() => { if (clientSearchTerm.trim()) setShowClientSearchResults(true); }}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {showClientSearchResults && (clientsLoading || clientsError || availableClients.length > 0) && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {clientsLoading && <div className="px-3 py-2 text-sm text-gray-500">Buscando clientes...</div>}
            {clientsError && <div className="px-3 py-2 text-sm text-red-500">{clientsError}</div>}
            {!clientsLoading && !clientsError && availableClients.length === 0 && clientSearchTerm.trim() !== '' && (
              <div className="px-3 py-2 text-sm text-gray-500">Nenhum cliente encontrado para "{clientSearchTerm}".</div>
            )}
            {availableClients.map(client => (
              <div
                key={client.id}
                onClick={() => handleSelectClient(client)}
                className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                {client.nome}
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Seção para Adicionar Itens ao Pedido (com busca de produto) */}
      <fieldset className="border p-4 rounded-md space-y-3">
        {/* ... (resto do fieldset de itens do pedido, incluindo busca de produto, permanece o mesmo que na resposta anterior) ... */}
        <legend className="text-md font-medium text-gray-900 px-1">Order Items</legend>
        <div>
          <label htmlFor="productSearch" className="block text-sm font-medium text-gray-700">
            Search Product
          </label>
          <input
            type="text"
            id="productSearch"
            placeholder="Digite para buscar produtos..."
            value={productSearchTerm}
            onChange={(e) => setProductSearchTerm(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {productsLoading && <p className="text-sm text-gray-500">Carregando produtos...</p>}
        {productsError && <p className="text-sm text-red-500">{productsError}</p>}

        {!productsLoading && !productsError && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="productSelect" className="block text-sm font-medium text-gray-700">
                Product
              </label>
              <select
                id="productSelect"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a product</option>
                {availableProducts.map(p => (
                  <option key={p.id} value={p.id} disabled={p.stock === 0}>
                    {p.name} (${p.price.toFixed(2)}) - Estoque: {p.stock}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="itemQuantity" className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                id="itemQuantity"
                min="1"
                value={currentQuantity}
                onChange={(e) => setCurrentQuantity(parseInt(e.target.value, 10) || 1)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              disabled={productsLoading || !selectedProductId}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 h-fit disabled:bg-gray-400"
            >
              Add Item
            </button>
          </div>
        )}

        {formData.items && formData.items.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Items in Order:</h4>
            <ul className="list-disc list-inside pl-2 max-h-40 overflow-y-auto">
              {formData.items.map((item, index) => (
                <li key={`${item.productId}-${index}`} className="text-sm text-gray-600 flex justify-between items-center py-1">
                  <span>
                    {item.productName} (ID: {item.productId}) - Qty:
                    <input
                      type="number"
                      value={item.quantity}
                      min="1"
                      readOnly={isEditing}
                      onChange={(e) => {
                        if (!isEditing) {
                          handleItemChange(index, 'quantity', parseInt(e.target.value, 10) || 1)
                        }
                      }}
                      className={`mx-1 w-16 text-center border-gray-300 rounded-md shadow-sm sm:text-sm ${isEditing ? 'bg-gray-100' : ''}`}
                    />
                    @ ${item.unitPrice.toFixed(2)} each
                  </span>
                  {!isEditing &&
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="ml-2 text-red-500 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  }
                </li>
              ))}
            </ul>
          </div>
        )}
      </fieldset>

      {/* Total Amount, Status, Order Date (semelhantes a antes) */}
      {/* ... (restante do formulário: Total Amount, Status, Order Date, botões Submit/Cancel) ... */}
      <div>
        <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700">Total Amount ($)</label>
        <input
          type="number"
          id="totalAmount"
          step="0.01"
          value={formData.totalAmount === undefined ? '' : formData.totalAmount.toFixed(2)}
          onChange={(e) => handleChange('totalAmount', parseFloat(e.target.value))}
          required
          readOnly={!isEditing && (formData.items?.length || 0) > 0}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${(!isEditing && (formData.items?.length || 0) > 0) ? 'bg-gray-100' : ''
            }`}
        />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
        <select id="status" value={formData.status || ''} onChange={(e) => handleChange('status', e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          <option value="Pendente">Pending</option>
          <option value="Processando">Processing</option>
          <option value="Enviado">Shipped</option>
          <option value="Entregue">Delivered</option>
          <option value="Cancelado">Cancelled</option>
        </select>
      </div>
      <div>
        <label htmlFor="orderDate" className="block text-sm font-medium text-gray-700">Order Date</label>
        <input type="date" id="orderDate" value={formData.orderDate || new Date().toISOString().split('T')[0]} onChange={(e) => handleChange('orderDate', e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
          {isEditing ? 'Update Order' : 'Add Order'}
        </button>
      </div>
    </form>
  );
}