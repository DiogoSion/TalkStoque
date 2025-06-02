import React, { useState, useEffect } from 'react';
import { Employee } from '../types/employee';

interface Props {
  initialData: Partial<Employee>; // initialData pode ou não ter 'senha'
  onSubmit: (data: Partial<Employee>) => void; // onSubmit espera o tipo Employee atualizado
  onCancel: () => void;
  isEditing: boolean; // Adicionamos isEditing para controlar a exibição do campo senha
}

const EmployeeForm: React.FC<Props> = ({ initialData, onSubmit, onCancel, isEditing }) => {
  // O estado formData agora pode conter 'senha'
  const [formData, setFormData] = useState<Partial<Employee>>(initialData);

  // Limpar a senha do formData se estiver editando e initialData mudar
  // para evitar que uma senha (mesmo que vazia) seja mantida acidentalmente
  // ao alternar entre adicionar e editar.
  useEffect(() => {
    if (isEditing) {
      // Se estiver editando, certifique-se de que a senha não esteja no formData inicial do formulário.
      // A senha só deve ser definida ao criar um novo usuário.
      const { senha, ...dataWithoutSenha } = initialData;
      setFormData(dataWithoutSenha);
    } else {
      // Se estiver adicionando, pode resetar para o initialData (que deve ser vazio ou com defaults)
      setFormData(initialData);
    }
  }, [initialData, isEditing]);


  const handleChange = (field: keyof Employee, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Se não estiver editando e a senha não foi fornecida, pode adicionar validação aqui ou no componente pai
    if (!isEditing && !formData.senha) {
      // Poderia definir um erro local ou deixar a validação para o componente Employers.tsx
      // Por ora, apenas alertando, mas idealmente isso seria um feedback melhor.
      alert("Password is required when adding a new employee.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <select
          id="role"
          value={formData.role || ''}
          onChange={(e) => handleChange('role', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          <option value="">Select a role</option>
          <option value="Warehouse Manager">Warehouse Manager</option>
          <option value="Inventory Specialist">Inventory Specialist</option>
          <option value="Sales Representative">Sales Representative</option>
          <option value="Delivery Driver">Delivery Driver</option>
          {/* Adicione outros cargos conforme a necessidade da sua API/negócio */}
          <option value="Admin">Admin</option>
          <option value="Estoquista">Estoquista</option>
        </select>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      {/* Campo de Senha - Visível apenas se não estiver editando (isEditing === false) */}
      {!isEditing && (
        <div>
          <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="senha"
            value={formData.senha || ''}
            onChange={(e) => handleChange('senha', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required={!isEditing} // Obrigatório apenas se não estiver editando
          />
        </div>
      )}

      {/* Campo "Phone Number" Removido */}
      {/*
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      */}

      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
          Start Date
        </label>
        <input
          type="date"
          id="startDate"
          value={formData.startDate || ''}
          onChange={(e) => handleChange('startDate', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          {isEditing ? 'Update Employee' : 'Add Employee'} {/* Usando isEditing para o texto do botão */}
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;