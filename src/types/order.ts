export interface OrderItemDetail {
  // Idealmente, productId seria number para corresponder à API, mas vamos manter string por enquanto se seu form já usa.
  // Ou converter no momento do envio para a API.
  productId: string | number; // ID do produto
  productName: string;      // Nome do produto (precisará ser obtido ou carregado)
  quantity: number;
  unitPrice: number;        // Preço unitário no momento da adição ao pedido
}

export interface Order {
  id: string; // Mapeado do apiOrder.id (number), exibido como o "Order ID"
  // orderNumber: string; // Removido
  customerName: string;
  customerId?: number; // Para uso interno se você implementar seleção de cliente
  items: OrderItemDetail[]; // Anteriormente 'products: string'
  totalAmount: number;
  status: string;
  orderDate: string;
}