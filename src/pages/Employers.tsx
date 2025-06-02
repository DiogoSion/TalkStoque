import React, { useState, useEffect, useCallback } from 'react';
import { Employee } from '../types/employee'; // Tipo do frontend para Funcionário
import EmployeeForm from '../components/EmployeeForm'; // Componente do formulário para adicionar/editar
import ModalWrapper from '../components/ModalWrapper'; // Componente genérico para modais
import ConfirmModal from '../components/ConfirmModal'; // Modal para confirmações (ex: deletar)
import AddButton from '../components/AddButton'; // Botão para adicionar novo item
import TableWrapper from '../components/TableWrapper'; // Componente para encapsular a tabela
import ActionButtons from '../components/ActionButtons'; // Botões de ação (editar/deletar) para a tabela
import apiClient from '../services/api'; // Cliente Axios configurado para chamadas à API
import {
  ApiFuncionario,
  ApiFuncionarioCreate,
  ApiFuncionarioUpdate
} from '../types/employeeAPI'; // Interfaces da API

export default function Employers() {
  // Estado para armazenar a lista de funcionários buscada da API
  const [employees, setEmployees] = useState<Employee[]>([]);
  // Estado para controlar a visibilidade do modal de formulário (adicionar/editar funcionário)
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Estado para armazenar os dados do funcionário que está sendo editado
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  // Estado para armazenar os dados do funcionário a ser deletado (para o modal de confirmação)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // Estados para feedback visual e tratamento de erros
  const [loading, setLoading] = useState<boolean>(true); // Indica se os dados estão sendo carregados
  const [error, setError] = useState<string | null>(null); // Armazena mensagens de erro
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Para mensagens de sucesso


  /**
   * Mapeia os dados de um funcionário vindos da API (ApiFuncionario) para o formato do frontend (Employee).
   * @param apiEmp Objeto do funcionário vindo da API.
   * @returns Objeto do funcionário formatado para o frontend.
   */
  const mapApiFuncionarioToFrontendEmployee = (apiEmp: ApiFuncionario): Employee => {
    return {
      id: apiEmp.id.toString(), // Converte ID (número da API) para string
      name: apiEmp.nome,
      role: apiEmp.cargo || '', // Usa o cargo da API ou string vazia como padrão
      email: apiEmp.email,
      startDate: new Date(apiEmp.data_contratacao).toISOString().split('T')[0], // Formata a data para YYYY-MM-DD
      // O campo 'senha' não é retornado pela API de listagem/leitura, então não é mapeado aqui.
      // O campo 'phone' foi removido anteriormente.
    };
  };

  /**
   * Busca todos os funcionários da API e atualiza o estado 'employees'.
   * Usa useCallback para otimizar e evitar recriações desnecessárias da função.
   */
  const fetchEmployees = useCallback(async () => {
    setLoading(true); // Ativa o indicador de carregamento
    setError(null);   // Limpa erros anteriores
    try {
      const response = await apiClient.get<ApiFuncionario[]>('/funcionarios/'); // Chamada à API
      // Mapeia os dados recebidos para o formato do frontend
      const frontendEmployees: Employee[] = response.data.map(mapApiFuncionarioToFrontendEmployee);
      setEmployees(frontendEmployees); // Atualiza o estado com os funcionários mapeados
    } catch (err) {
      console.error("Erro ao buscar funcionários:", err);
      setError("Falha ao carregar funcionários. Tente novamente."); // Define mensagem de erro
    } finally {
      setLoading(false); // Desativa o indicador de carregamento
    }
  }, []); // Array de dependências vazio, pois mapApiFuncionarioToFrontendEmployee não tem dependências externas

  // Efeito para buscar os funcionários quando o componente é montado
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]); // A dependência fetchEmployees garante que rode apenas se a função mudar

  /**
   * Lida com a submissão do formulário de Funcionário (tanto para criar novo quanto para editar existente).
   * @param formData Dados parciais do funcionário vindos do EmployeeForm, pode incluir 'senha'.
   */
  const handleSubmit = async (formData: Partial<Employee> & { senha?: string }) => {
    setIsModalOpen(false); // Fecha o modal do formulário
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (editingEmployee) { // Se estiver editando um funcionário existente
        // Prepara o payload para atualizar o funcionário
        const payload: ApiFuncionarioUpdate = {
          nome: formData.name,
          email: formData.email,
          cargo: formData.role,
          // A senha não é atualizada aqui; há um endpoint/processo separado para isso.
        };
        // Remove campos undefined do payload para não enviar nulls desnecessariamente se não foram alterados
        Object.keys(payload).forEach(key => payload[key as keyof ApiFuncionarioUpdate] === undefined && delete payload[key as keyof ApiFuncionarioUpdate]);

        await apiClient.put(`/funcionarios/${editingEmployee.id}`, payload); // Chamada PUT para a API
        setSuccessMessage(`Funcionário ${payload.nome || editingEmployee.name} atualizado com sucesso!`);
      } else { // Se estiver criando um novo funcionário
        // Prepara o payload para criar o funcionário
        const payload: ApiFuncionarioCreate = {
          nome: formData.name || '',
          email: formData.email || '',
          senha: formData.senha, // Inclui a senha vinda do formulário
          cargo: formData.role,
        };
        // Validação básica dos campos obrigatórios
        if (!payload.nome || !payload.email || !payload.senha) {
          setError("Nome, email e senha são obrigatórios para criar um funcionário.");
          setLoading(false);
          setIsModalOpen(true); // Reabre o modal para correção
          return;
        }
        await apiClient.post('/funcionarios/', payload); // Chamada POST para a API
        setSuccessMessage(`Funcionário ${payload.nome} adicionado com sucesso!`);
      }
      fetchEmployees(); // Recarrega a lista de funcionários para refletir as mudanças
    } catch (err: any) {
      console.error("Erro ao salvar funcionário:", err);
      const apiErrorMessage = err.response?.data?.detail || "Erro ao salvar funcionário. Verifique os dados e tente novamente.";
      if (Array.isArray(apiErrorMessage)) {
        setError(apiErrorMessage.map((e: { msg: string }) => e.msg).join(', '));
      } else {
        setError(apiErrorMessage);
      }
      setIsModalOpen(true); // Reabre o modal em caso de erro na operação
    } finally {
      setLoading(false);
      if (!error && successMessage) { // Se não houve erro e teve sucesso, limpa o estado de edição
        setEditingEmployee(null);
      }
    }
  };

  /**
   * Lida com o cancelamento do formulário de funcionário.
   */
  const handleCancel = () => {
    setIsModalOpen(false); // Fecha o modal
    setEditingEmployee(null); // Limpa o estado de edição
    setError(null); // Limpa mensagens de erro
    setSuccessMessage(null); // Limpa mensagens de sucesso
  };

  /**
   * Lida com a confirmação da exclusão de um funcionário.
   */
  const confirmDelete = async () => {
    if (employeeToDelete) { // Garante que há um funcionário selecionado para deletar
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        await apiClient.delete(`/funcionarios/${employeeToDelete.id}`); // Chamada DELETE para a API
        setSuccessMessage(`Funcionário ${employeeToDelete.name} deletado com sucesso!`);
        fetchEmployees(); // Atualiza a lista de funcionários
      } catch (err: any) {
        console.error("Erro ao deletar funcionário:", err);
        const apiErrorMessage = err.response?.data?.detail || "Falha ao deletar funcionário.";
        if (Array.isArray(apiErrorMessage)) {
          setError(apiErrorMessage.map((e: { msg: string }) => e.msg).join(', '));
        } else {
          setError(apiErrorMessage);
        }
      } finally {
        setLoading(false);
        setEmployeeToDelete(null); // Fecha o modal de confirmação e limpa o estado
      }
    }
  };

  // Renderização condicional enquanto os dados estão carregando
  if (loading && employees.length === 0) {
    return <p className="text-center text-gray-500">Carregando funcionários...</p>;
  }

  // Renderização condicional se houver erro e nenhum funcionário carregado (e o modal não estiver aberto)
  if (error && employees.length === 0 && !isModalOpen) {
    return <p className="text-center text-red-500">Erro: {error}</p>;
  }

  // Renderização principal do componente
  return (
    <div className="space-y-6">
      {/* Cabeçalho da página com título e botão de adicionar novo funcionário */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Employers Management</h2>
        <AddButton
          label="Employee"
          onClick={() => {
            setEditingEmployee(null); // Garante que está no modo de adição
            setError(null);
            setSuccessMessage(null);
            setIsModalOpen(true); // Abre o modal do formulário
          }}
        />
      </div>

      {/* Exibição de mensagens globais de sucesso, erro e carregamento (quando o modal não está aberto) */}
      {successMessage && !isModalOpen && <div className="p-3 my-2 text-sm text-green-700 bg-green-100 rounded-md">{successMessage}</div>}
      {error && !isModalOpen && <div className="p-3 my-2 text-sm text-red-700 bg-red-100 rounded-md">Erro: {error}</div>}
      {loading && <p className="text-sm text-blue-600 text-center my-2">Processando...</p>}

      {/* Tabela para exibir os funcionários */}
      <TableWrapper columns={["Name", "Role", "Email", "Start Date", "Actions"]}>
        {employees.map((employee) => (
          <tr key={employee.id}>
            <td className="px-6 py-4">{employee.name}</td>
            <td className="px-6 py-4">{employee.role}</td>
            <td className="px-6 py-4">{employee.email}</td>
            <td className="px-6 py-4">{employee.startDate}</td>
            {/* Botões de Ação (Editar/Deletar) para cada linha */}
            <td className="px-6 py-4 flex space-x-2">
              <ActionButtons
                onEdit={() => {
                  setEditingEmployee(employee); // Define o funcionário para edição
                  setError(null);
                  setSuccessMessage(null);
                  setIsModalOpen(true); // Abre o modal do formulário em modo de edição
                }}
                onDelete={() => setEmployeeToDelete(employee)} // Define o funcionário a ser deletado, abrindo o modal de confirmação
              />
            </td>
          </tr>
        ))}
      </TableWrapper>

      {/* Modal para Adicionar ou Editar um Funcionário */}
      {isModalOpen && (
        <ModalWrapper
          title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          onClose={handleCancel}
        >
          {/* Exibição de erro/sucesso dentro do modal */}
          {error && isModalOpen && <p className="text-sm text-red-600 text-center mb-4">Erro: {error}</p>}
          {successMessage && isModalOpen && <p className="text-sm text-green-600 text-center mb-4">{successMessage}</p>}
          <EmployeeForm
            initialData={editingEmployee || {}} // Se estiver editando, passa os dados do funcionário, senão, objeto vazio
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEditing={!!editingEmployee} // Passa booleano indicando se está no modo de edição
          />
        </ModalWrapper>
      )}

      {/* Modal de Confirmação para Deletar Funcionário */}
      {employeeToDelete && (
        <ConfirmModal
          title="Confirm Deletion"
          message={`Are you sure you want to delete ${employeeToDelete.name}?`}
          onCancel={() => setEmployeeToDelete(null)} // Fecha o modal sem deletar
          onConfirm={confirmDelete} // Chama a função para deletar
        />
      )}
    </div>
  );
}
