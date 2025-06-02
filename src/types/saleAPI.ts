export interface ApiVenda {
    id: number;
    pedido_id: number;
    funcionario_id?: number | null;
    data_venda: string;
    valor_total: string;
    forma_pagamento?: string | null;
}

export interface ApiPedidoForDetails {
    id: number;
    cliente: { nome: string };
    itens: Array<{ produto_id: number; quantidade: number; nome_produto?: string }>;
    status?: string;
}

export interface ApiVendaCreate {
    pedido_id: number;
    funcionario_id?: number | null;
    valor_total: number | string;
    forma_pagamento?: string | null;
}

export interface ApiVendaUpdate {
    funcionario_id?: number | null;
    valor_total?: number | string;
    forma_pagamento?: string | null;
}

export interface ApiPedidoStatusUpdate {
    status: string;
}