import React, { useState, useEffect, useCallback } from 'react';
// import { Pencil, Trash2 } from 'lucide-react'; // Não parecem estar sendo usados diretamente aqui
import { Employee } from '../types/employee';
import EmployeeForm from '../components/EmployeeForm';
import ModalWrapper from '../components/ModalWrapper';
import ConfirmModal from '../components/ConfirmModal';
import AddButton from '../components/AddButton';
import TableWrapper from '../components/TableWrapper';
import ActionButtons from '../components/ActionButtons';
import apiClient from '../services/api';
import {
  ApiFuncionario,
  ApiFuncionarioCreate,
  ApiFuncionarioUpdate
} from '../types/employeeAPI';

export default function Employers() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ApiFuncionario[]>('/funcionarios/');
      const frontendEmployees: Employee[] = response.data.map(apiEmp => ({
        id: apiEmp.id.toString(),
        name: apiEmp.nome,
        role: apiEmp.cargo || '',
        email: apiEmp.email,
        startDate: new Date(apiEmp.data_contratacao).toISOString().split('T')[0],
        // 'phone' removido daqui
      }));
      setEmployees(frontendEmployees);
    } catch (err) {
      console.error("Erro ao buscar funcionários:", err);
      setError("Falha ao carregar funcionários. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSubmit = async (formData: Partial<Employee> & { senha?: string }) => { // Adicionado 'senha' ao tipo formData
    setIsModalOpen(false);
    setLoading(true);
    setError(null);

    try {
      if (editingEmployee) {
        const payload: ApiFuncionarioUpdate = {
          nome: formData.name,
          email: formData.email,
          cargo: formData.role,
        };
        Object.keys(payload).forEach(key => payload[key as keyof ApiFuncionarioUpdate] === undefined && delete payload[key as keyof ApiFuncionarioUpdate]);
        await apiClient.put(`/funcionarios/${editingEmployee.id}`, payload);
      } else {
        // ADICIONAR NOVO FUNCIONÁRIO
        const payload: ApiFuncionarioCreate = {
          nome: formData.name || '',
          email: formData.email || '',
          senha: formData.senha, // Senha vinda do formulário
          cargo: formData.role,
        };
        if (!payload.nome || !payload.email || !payload.senha) { // Validação incluindo senha
          setError("Nome, email e senha são obrigatórios para criar um funcionário.");
          setLoading(false);
          setIsModalOpen(true);
          return;
        }
        await apiClient.post('/funcionarios/', payload);
      }
      fetchEmployees();
    } catch (err: any) {
      console.error("Erro ao salvar funcionário:", err);
      const apiErrorMessage = err.response?.data?.detail || "Erro ao salvar funcionário. Verifique os dados e tente novamente.";
      if (Array.isArray(apiErrorMessage)) {
        setError(apiErrorMessage.map((e: { msg: string }) => e.msg).join(', '));
      } else {
        setError(apiErrorMessage);
      }
      setIsModalOpen(true);
    } finally {
      setLoading(false);
      if (!error) {
        setEditingEmployee(null);
      }
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setError(null);
  };

  const confirmDelete = async () => {
    if (employeeToDelete) {
      setLoading(true);
      setError(null);
      try {
        await apiClient.delete(`/funcionarios/${employeeToDelete.id}`);
        fetchEmployees();
      } catch (err) {
        console.error("Erro ao deletar funcionário:", err);
        setError("Falha ao deletar funcionário.");
      } finally {
        setLoading(false);
        setEmployeeToDelete(null);
      }
    }
  };

  if (loading && employees.length === 0) {
    return <p className="text-center text-gray-500">Carregando funcionários...</p>;
  }

  if (error && employees.length === 0) {
    return <p className="text-center text-red-500">Erro: {error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Employers Management</h2>
        <AddButton
          label="Employee"
          onClick={() => {
            setEditingEmployee(null);
            setError(null);
            setIsModalOpen(true);
          }}
        />
      </div>

      {error && !isModalOpen && <p className="text-sm text-red-600 text-center my-2">Erro: {error}</p>}
      {loading && <p className="text-sm text-blue-600 text-center my-2">Processando...</p>}

      {/* Coluna "Phone" removida daqui */}
      <TableWrapper columns={["Name", "Role", "Email", "Start Date", "Actions"]}>
        {employees.map((employee) => (
          <tr key={employee.id}>
            <td className="px-6 py-4">{employee.name}</td>
            <td className="px-6 py-4">{employee.role}</td>
            <td className="px-6 py-4">{employee.email}</td>
            <td className="px-6 py-4">{employee.startDate}</td>
            <td className="px-6 py-4 flex space-x-2">
              <ActionButtons
                onEdit={() => {
                  setEditingEmployee(employee);
                  setError(null);
                  setIsModalOpen(true);
                }}
                onDelete={() => setEmployeeToDelete(employee)}
              />
            </td>
          </tr>
        ))}
      </TableWrapper>

      {isModalOpen && (
        <ModalWrapper
          title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          onClose={handleCancel}
        >
          {error && isModalOpen && <p className="text-sm text-red-600 text-center mb-4">{error}</p>}
          <EmployeeForm
            initialData={editingEmployee || {}}
            onSubmit={handleSubmit} // handleSubmit em Employers.tsx já espera 'senha' em formData
            onCancel={handleCancel}
            isEditing={!!editingEmployee}
          />
        </ModalWrapper>
      )}

      {employeeToDelete && (
        <ConfirmModal
          title="Confirm Deletion"
          message={`Are you sure you want to delete ${employeeToDelete.name}? This action cannot be undone.`}
          onCancel={() => setEmployeeToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}