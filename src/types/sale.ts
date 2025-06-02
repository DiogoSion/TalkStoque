export interface Sale {
  id: string;                 // Mapeado do apiVenda.id
  invoiceNumber: string;      // Pode ser gerado no frontend, ex: "INV-" + id da venda
  pedido_id: number;          // Importante, da API Venda

  // Estes campos serão para exibição e preenchidos buscando o Pedido associado
  customerNameDisplay: string;
  productsDisplay: string;     // Um resumo dos produtos do pedido

  amount: number;             // Mapeado de apiVenda.valor_total
  paymentMethod: string;      // Mapeado de apiVenda.forma_pagamento
  saleDate: string;           // Mapeado de apiVenda.data_venda
  funcionario_id?: number | null; // Da API Venda
  pedido_status_original?: string;// Para armazenar o status do pedido antes da venda
}