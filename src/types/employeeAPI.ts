export interface ApiFuncionario {
    id: number;
    nome: string;
    email: string;
    cargo?: string | null;
    data_contratacao: string;
}

export interface ApiFuncionarioCreate {
    nome: string;
    email: string;
    senha?: string;
    cargo?: string | null;
}

export interface ApiFuncionarioUpdate {
    nome?: string;
    email?: string;
    cargo?: string | null;
}