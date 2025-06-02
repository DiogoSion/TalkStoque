export interface ApiCliente {
    id: number;
    nome: string;
}

export interface Props {
    initialData: Partial<Order>;
    onSubmit: (data: Partial<Order>) => void;
    onCancel: () => void;
    isEditing: boolean;
}