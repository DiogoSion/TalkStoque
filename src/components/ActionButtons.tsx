import { Pencil, Trash2 } from 'lucide-react';

interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
}

// Componente reutilizável para botões de ação (editar e excluir)
export default function ActionButtons({ onEdit, onDelete }: ActionButtonsProps) {
  return (
    <div className="flex space-x-2">
      <button onClick={onEdit} className="text-blue-600 hover:text-blue-900">
        <Pencil className="h-5 w-5" />
      </button>
      <button onClick={onDelete} className="text-red-600 hover:text-red-900">
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
}
