import { Plus } from 'lucide-react';

interface AddButtonProps {
  label: string;
  onClick: () => void;
}

export default function AddButton({ label, onClick }: AddButtonProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
    >
      <Plus className="h-5 w-5 mr-2" />
      Add {label}
    </button>
  );
}
