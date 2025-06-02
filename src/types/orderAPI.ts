export interface ApiCliente {
    id: number;
    nome: string;
}

export interface ApiPedidoItem {
    id: number; // ID do PedidoItem (da tabela PedidoItem)
    produto_id: number;
    quantidade: number;
    preco_unitario: string; // Preço no momento da criação do PedidoItem
    nome_produto?: string; // Nome do produto (espera-se que a API popule este campo)
}

export interface ApiPedido {
    id: number; // ID do Pedido
    cliente_id: number;
    status: string;
    total: string; // API retorna total como string
    data_pedido: string; // String no formato date-time
    cliente: ApiCliente; // Objeto Cliente aninhado
    itens: ApiPedidoItem[]; // Lista de itens do pedido, agora esperando nome_produto
}

export interface ApiPedidoCreate { // Payload para criar um novo pedido
    cliente_id: number;
    status?: string;
    total: number | string;
    itens?: Array<{ produto_id: number; quantidade: number; preco_unitario: number | string }>;
}

export interface ApiPedidoUpdate { // Payload para atualizar um pedido existente
    cliente_id?: number;
    status?: string;
    total?: number | string;
    // A edição de itens de um pedido existente geralmente é feita por endpoints dedicados (/pedido_itens/)
    // e não diretamente no payload de atualização do pedido principal.
}