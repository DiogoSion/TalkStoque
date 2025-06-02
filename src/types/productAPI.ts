export interface ApiProduto {
    id: number;
    nome: string;
    descricao?: string | null;
    preco: string; // API retorna preço como string
    quantidade_estoque: number;
    categoria?: string | null;
    data_cadastro: string;
}

export interface ApiProdutoCreate {
    nome: string;
    descricao?: string | null;
    preco: number | string; // API aceita number ou string para preço na criação
    quantidade_estoque: number;
    categoria?: string | null;
    // O campo 'unit' do frontend não está aqui
}

export interface ApiProdutoUpdate {
    nome?: string;
    descricao?: string | null;
    preco?: number | string; // API aceita number ou string para preço na atualização
    quantidade_estoque?: number;
    categoria?: string | null;
}